`IamFileAdapter` persists the whole authorization store as one human-editable JSON file. It reads through an in-memory cache and rewrites the entire document on every mutation, which makes it ideal for a CLI that ships pre-baked policies or a fixture committed to a repo, and unsuitable for anything with two writers.

## Install

No dependency beyond the package - you supply the filesystem driver yourself.

```ts
import { IamFileAdapter, iamFileAdapter } from '@gentleduck/iam/adapters/file'
import type { IamFile } from '@gentleduck/iam/adapters/file'
```

## Basic usage

```ts
import * as path from 'node:path'
import { IamEngine } from '@gentleduck/iam'
import { IamFileAdapter } from '@gentleduck/iam/adapters/file'

const stateDir = '/var/lib/myapp'

const adapter = new IamFileAdapter({
  fs: await import('node:fs/promises'),
  path: path.join(stateDir, 'iam.json'),
  rootDir: stateDir,
  onPolicyError: (err, ctx) => logger.error({ err, rowId: ctx.rowId }, 'iam row dropped'),
})

const engine = new IamEngine({ adapter })

await adapter.savePolicy({
  id: 'allow-read',
  name: 'Allow Read',
  algorithm: 'deny-overrides',
  rules: [
    { id: 'r1', effect: 'allow', priority: 10, actions: ['read'], resources: ['post'], conditions: { all: [] } },
  ],
})

const allowed = await engine.can('user-1', 'read', { type: 'post', attributes: {} })
```

The adapter calls `mkdir` on the immediate parent **without** `{ recursive: true }`, so a missing grandparent is an error rather than a silently created deep tree. If `/var/lib/myapp` does not exist, the first write fails with `IAM_FILE_MKDIR_FAILED` (`meta: { path: '/var/lib/myapp', code: 'ENOENT' }`). Create the directory in your deploy step.

## API reference

### `new IamFileAdapter(init)`

```ts
class IamFileAdapter<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
  TFS extends IamFile.IFS = IamFile.IFS,
> implements IamAdapter.IAdapter<TAction, TResource, TRole, TScope> {
  constructor(init: IamFile.IInit<TFS>)
}
```

The constructor is synchronous and does no I/O, but it does validate `init.path` and **throws** on a bad one - see [Path hardening](#path-hardening). The factory `iamFileAdapter(init)` is equivalent and propagates the same constructor errors.

### `IamFile.IInit`

| Option | Type | Default | Meaning |
|---|---|---|---|
| `path` | `string` | required | **Absolute** path of the JSON store. Rejected if it is not absolute, or if any segment is `..`, or if `rootDir` is set and it escapes it. The file is created on first write. |
| `rootDir` | `string` | `undefined` | Absolute containment root. When set, `path` must resolve inside it, re-checked through `realpath` on every read and write. When omitted the adapter accepts any absolute path and logs one `console.warn` per process. |
| `fs` | `IamFile.IFS` | required | The filesystem driver. Pass `await import('node:fs/promises')` in Node or Bun, or any object with the same shape. |
| `onPolicyError` | `(err: Error, ctx: { adapter: 'file'; rowId: string }) => void` | `undefined` | Called for every row dropped at load time. Without it the adapter falls back to `console.warn` with the message `[@gentleduck/iam:file] dropped malformed row "

Reading the branches from the top: the containment check runs first, so a hostile symlink is rejected before any bytes are read. `ENOENT` is the only recoverable read error - a genuinely missing file becomes an empty store. Any other errno (`EACCES`, `EISDIR`, `EIO`) throws `IAM_FILE_READ_FAILED` (`meta: { code, detail }`) rather than presenting an empty store, because an empty store means "deny everything" under `defaultEffect: 'deny'` and "allow everything" under `'allow'`. A file that exists but is not parseable JSON, or whose root is not an object, throws `IAM_FILE_STORE_CORRUPT` (`meta: { path, reason: 'parse-failed' | 'not-object', got? }`) and - crucially - does **not** populate the cache, so a later `_flush` cannot overwrite a recoverable file. Only individual rows are dropped silently-but-reported.

### What happens to bad data

| Situation | Result | Reported |
|---|---|---|
| File does not exist | empty store, then created on first write | no |
| `readFile` fails with a non-`ENOENT` errno | throws `IAM_FILE_READ_FAILED` (`meta: { code, detail }`); nothing is cached, so a later read can still succeed | no |
| File is not valid JSON | throws `IAM_FILE_STORE_CORRUPT` (`meta: { path, reason: 'parse-failed' }`) | yes, with the path as `rowId` |
| Root is an array, string, or `null` | throws `IAM_FILE_STORE_CORRUPT` (`meta: { path, reason: 'not-object', got }`) | yes |
| `policies` or `roles` is present but not an object | throws `IAM_FILE_STORE_FIELD_INVALID` (`meta: { field, got }`) | yes |
| A **policy** row fails `parsePolicyRow` | reported, then the read **throws** `IAM_UNREADABLE_POLICY` (`meta: { adapter: 'file', policyId, detail }`) - no policy is returned | yes, with the row's key and the validator's issues |
| A **role** row fails `parseRoleRow` | that row is dropped, the rest of the catalog loads | yes |
| `assignments` is not an object | all assignments load empty | yes |
| One `assignments` entry is malformed | that entry alone is dropped, reported with its index; the subject's other grants survive | yes |
| `attributes` is not an object | all attributes load empty | yes |
| One `attributes` row is not an object | that subject is marked corrupt; `getSubjectAttributes` **throws** `IAM_ATTRIBUTES_CORRUPT` (`meta: { adapter: 'file', subjectId, reason: 'not-object' }`) until an admin write replaces it | yes |
| Subject id is `__proto__` or `constructor` | reads return `[]` / `{}`; writes do not touch `Object.prototype` | no |

Two of those are deliberate fail-closed choices rather than conveniences. A corrupt `policies` field throws rather than loading empty, because zero policies reads as "no denies exist"; a malformed policy *row* throws for the same reason, while a malformed role row is only dropped, because role permissions are allow-only and losing one can only cost a subject a grant. And a corrupt attributes row throws instead of returning `{}`, because `{}` would silently strip every ABAC condition about that subject - which usually widens access. An admin write recovers it:

```ts
await adapter.setSubjectAttributes('user-bad', { tier: 'pro' })
await adapter.getSubjectAttributes('user-bad') // { tier: 'pro' } - the corrupt marker is cleared
```

All the maps built during a load use `Object.create(null)`, so an attacker-controlled row id such as `__proto__` can neither read `Object.prototype` back nor pollute the prototype chain.

## Write durability

Every mutation is a full read-modify-write of the entire document.

When the driver exposes `rename`, the write is not an overwrite: the adapter writes `${path}.<base36-time>-<random>.tmp` and renames it over the store, so a crash mid-write leaves the previous file intact rather than a truncated one that would load as zero policies - that is, as if every deny had been deleted. Without `rename` it writes in place, which a crash can truncate. That is the reason to pass the real `node:fs/promises`.

Three consequences either way:

* **Write cost is proportional to the whole store, not the change.** Assigning one role serialises every policy, role, assignment, and attribute. A store with thousands of policies pays that on every admin call.
* **The realpath containment check runs on every write**, not only the first, so a file swapped for a symlink after startup cannot steer later writes outside `rootDir`.
* **A failed flush discards the cache.** Every mutating method - `savePolicy`, `deletePolicy`, `saveRole`, `deleteRole`, `assignRole`, `revokeRole`, `updateAssignmentScope`, `setSubjectAttributes` - rejects with the driver's errno, and the adapter throws its in-memory state away rather than serving it. It used to keep the mutation: the caller was told the write failed, and the adapter then answered every later read as though it had succeeded, until an unrelated `assignRole` for a different subject serialised the whole cache and committed the refused grant to disk permanently.

The cost of discarding is one behaviour worth knowing. A write already **queued** behind a failing one mutated the cache that was discarded, so it is neither on disk nor replayable, and it rejects with `IamFileAdapter discarded its in-memory state after an earlier write failed, so this write did not reach the store. Reload and retry it.` A write *issued* after the failure reloads from disk and succeeds normally.

### Attribute reads share the cache

`getSubjectAttributes` returns the object held in the cache, not a copy. Editing what it returns edits adapter state directly: a later read answers the edited bag, and because every flush serialises the whole cache, the next write of any kind - for any subject - persists that edit to disk, with no `setSubjectAttributes` call, no shape guard, and nothing to invalidate an engine cache from. Treat the returned bag as read-only, or copy it before touching it. The [memory adapter](/duck-iam/integrations/adapters/memory) copies on the way out; this one does not.

## Concurrency

**Single writer.** The adapter holds the store in memory and rewrites it whole; two processes pointed at the same file will each write their own view and the later write wins outright. There is no file locking, no compare-and-swap, and no detection - the loser's changes are gone.

Within one process the picture is better:

* **Concurrent first reads are coalesced.** A single-flight latch means a burst of cold reads produces exactly one `readFile`; the tests assert this. It is cleared on **any** throw, including a symlink-escape rejection, so a transient failure cannot pin the adapter in a permanently broken state - a later read retries from scratch.
* **Flushes are serialised, writes are not independent.** A flush chain makes one write/rename pair complete before the next begins, so at most one `.tmp` file exists at a time and a reader never observes the store mid-swap. It does not make two concurrent writers independent: the cache is serialised at flush time, not at issue time, so both writers' mutations end up in both payloads.
* **The engine adds its own coalescing on top.** Cold subject loads for the same subject collapse into one adapter call, so the file is read far less often than requests arrive.

If you need concurrent writers, the answer is a different adapter, not a lock file:

* Several processes on one machine, or several instances - [Redis](/duck-iam/integrations/adapters/redis), [Prisma](/duck-iam/integrations/adapters/prisma), or [Drizzle](/duck-iam/integrations/adapters/drizzle).
* Hand-editable JSON *and* horizontal scale - keep the JSON in version control as the source, and write a [custom adapter](/duck-iam/integrations/adapters/custom) that reads a deployed artefact while writes go through your CI pipeline.

## Path hardening

The constructor rejects a bad `path` before any I/O happens. Every row below throws `IAM_FILE_PATH_INVALID`, distinguished by `meta.reason`:

| Input | `meta.reason` | Other `meta` fields |
|---|---|---|
| A segment equal to `..` | `'dotdot-segment'` | `path` |
| `path.resolve(path)` does not land on an absolute path | `'not-resolvable-absolute'` | `path` |
| A relative path | `'not-absolute'` | `path` |
| A `rootDir` that is not absolute | `'rootdir-not-absolute'` | `rootDir` |
| A `path` outside `rootDir` | `'escapes-rootdir'` | `path` (resolved), `rootDir` (resolved) |

`..` is checked textually *before* `path.resolve`, because `resolve` would collapse it and hide the intent. At read and write time `_assertWithinRoot` canonicalises through `realpath` (falling back to the parent directory when the file does not exist yet) and throws the same `IAM_FILE_PATH_INVALID` with `meta.reason: 'symlink-escapes-rootdir'` if the canonical path is outside. A non-`ENOENT` `realpath` failure - `ELOOP`, `EACCES` - propagates rather than falling through to the parent, so a hostile link cannot bypass the check by failing.

Omitting `rootDir` logs once per process:

```
[@gentleduck/iam:file] IamFileAdapter constructed without rootDir. Any caller deriving the path from request data should set rootDir for defence in depth.
```

The warning deliberately does not echo the resolved path, so log scrapers cannot use it as a path-existence oracle, and it fires at most once so operators do not learn to filter it out.

## When to use it

Good fits:

* CLI tools that ship pre-baked policies alongside the binary
* Dev fixtures committed to a repo and reviewed as a diff
* Single-process apps: Electron, desktop daemons, sidecars
* Tests that need persistence between assertions but not between runs

Bad fits:

* Multi-process or multi-instance servers - writes clobber each other
* Write-heavy workloads - every mutation serialises the whole document
* Anything needing transactional updates across policies, roles, and assignments - there is no `withClient` here, so `engine.withTransaction` throws the coded `IAM_ENGINE_ADAPTER_NOT_TRANSACTIONAL`
* Anywhere the store must survive a crash on a driver with no `rename`

## Gotchas

* **The parent directory is not created recursively.** This is the most common first-run failure; create it in your deploy step.
* **A hand edit made while the process is running is lost** on the next write, because the cache wins.
* **A failed write discards the cache,** and a write already queued behind it is rejected as unreachable. Reload and retry it.
* **`getSubjectAttributes` hands back the cached bag itself.** Edit the copy, not the return value.
* **`assignRole` refuses a role that is not stored,** and refuses `scope: ''` and `scope: '*'` on a grant.
* **`deleteRole` takes the subject grants with it.**
* **`revokeRole` without a scope removes every grant of that role**, scoped and unscoped, matching the cross-adapter contract.
* **`IamAdapter.IAssignOptions` is refused, not ignored.** `startsAt` / `expiresAt` / `attributes` throw and name the option rather than being dropped. Use [Drizzle](/duck-iam/integrations/adapters/drizzle) for temporal grants.
* **`IReadOptions.signal` is ignored.** There is nothing to cancel; the engine still enforces `adapterTimeoutMs`.

## See also

* [Memory adapter](/duck-iam/integrations/adapters/memory) - the same shape without persistence
* [Custom adapter](/duck-iam/integrations/adapters/custom) - implement `IamAdapter.IAdapter` for any backend
* [Choosing an adapter](/duck-iam/integrations/adapters/comparison) - the feature matrix across all six
* [Validation](/duck-iam/advanced/validation) - the `parsePolicyRow` / `parseRoleRow` helpers behind row dropping