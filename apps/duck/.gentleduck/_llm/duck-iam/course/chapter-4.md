DocDuck now has roles and policies. This chapter is about the thing that runs them. You will wire hooks that load document attributes for you, read the cache counters, batch a screen's worth of checks into one call, and finish with a complete, runnable application - the state chapters 5 to 8 build on.

## Learning goals

* Know every public method on `IamEngine` and what each returns in each mode.
* Wire all seven hooks and know which one can change a decision.
* Name the five caches, what invalidates each, and what the counters mean.
* Batch checks with `permissions()` and read the key format.
* Read an `explain()` trace and know what it does not do.
* Use `engine.admin` for runtime changes, and `preload` / `healthCheck` / `dispose` for lifecycle.

## One request, end to end

`can` and `check` both take this path. `authorize` joins it at the `beforeEvaluate` step because you already handed it a resolved subject. The two hook calls at the end run *outside* the evaluation try block, so a hook that throws cannot turn an allow into a deny.

## Every engine method

| Member | Signature | Development | Production |
| --- | --- | --- | --- |
| `can` | `(subjectId, action, resource, environment?, scope?)` | `boolean` | `boolean` |
| `check` | same as `can` | `IDecision` | `boolean` |
| `authorize` | `(request: IamRequest.IAccessRequest)` | `IDecision` | `boolean` |
| `permissions` | `(subjectId, checks, environment?, opts?)` | `IamClient.PermissionMap` | `RecordLRU, maxCacheSize entries"]
  SC --> |"miss"| AD["adapter"]
  REQ --> MP["mergedPolicies1 entry"]
  MP --> PC["policies1 entry"]
  MP --> RB["rbacPolicy1 entry"]
  RB --> RC["roles1 entry"]
  PC --> AD
  RC --> AD
  INV["cache.invalidateRoles(id)"] --> RC
  INV --> RB
  INV --> MP
  INV --> |"only subjects holding that role"| SC`}
/>

| Cache | Holds | Size |
| --- | --- | --- |
| `policies` | the result of `adapter.listPolicies()` | 1 entry |
| `roles` | the result of `adapter.listRoles()` | 1 entry |
| `rbacPolicy` | the synthetic `__rbac__` policy built from the roles | 1 entry |
| `mergedPolicies` | stored policies plus `__rbac__`, ready to evaluate | 1 entry |
| `subjects` | per-subject resolved roles, scoped roles, attributes | up to `maxCacheSize`, LRU |

All five honour `cacheTTL` (seconds, default 60; `0` disables caching). Concurrent misses for the same key are collapsed into one in-flight promise, so a cold start does not stampede the adapter.

| Call | Clears |
| --- | --- |
| `engine.cache.invalidate()` | all five, plus every in-flight loader |
| `engine.cache.invalidatePolicies()` | `policies`, `mergedPolicies` |
| `engine.cache.invalidateRoles()` | `roles`, `rbacPolicy`, `mergedPolicies`, **all** subjects |
| `engine.cache.invalidateRoles('editor')` | the same, but only subjects that hold `editor` directly or as a scoped role |
| `engine.cache.invalidateSubject('bob')` | that one subject |

Each takes an options object; pass `{ broadcast: false }` when you are *applying* an event that arrived from another instance, so it does not echo back onto the `invalidator` channel.

```ts
const s = engine.stats.get()
// {
//   policies:       { hits: 0, misses: 1, size: 1 },
//   roles:          { hits: 3, misses: 1, size: 1 },
//   rbacPolicy:     { hits: 0, misses: 1, size: 1 },
//   mergedPolicies: { hits: 8, misses: 1, size: 1 },
//   subjects:       { hits: 6, misses: 3, size: 3 },
// }
engine.stats.reset()
```

Counters accumulate from construction. `engine.healthCheck()` folds the same numbers into a single `cacheHitRate`.

## Batch permissions

A document list screen needs a dozen answers at once. One call, one subject resolution, one policy load:

```ts
const perms = await engine.permissions('bob', [
  { action: 'read', resource: 'document', resourceId: 'doc-2' },
  { action: 'update', resource: 'document', resourceId: 'doc-2' },
  { action: 'delete', resource: 'document', resourceId: 'doc-1' },
  { action: 'manage', resource: 'team' },
])
// {
//   'read:document:doc-2': true,
//   'update:document:doc-2': false,
//   'delete:document:doc-1': false,
//   'manage:team': false,
// }
```

```ts
interface IPermissionCheck {
  readonly action: string
  readonly resource: string
  readonly resourceId?: string
  readonly scope?: string
}
```

| Key shape | Produced when |
| --- | --- |
| `action:resource` | neither `scope` nor `resourceId` |
| `action:resource:resourceId` | `resourceId` only |
| `@scope:action:resource` | `scope` only |
| `@scope:action:resource:resourceId` | both |

`PermissionMap` is `Record<PermissionKey, boolean>`. Development mode gives you the precisely-typed key union rather than richer values. Keys are built by `iamBuildPermissionKey`, which escapes `:`, `\` and a leading `@` inside each segment, and `iamSplitPermissionKey` reverses it.

The `@` on the scope is load-bearing. Without it `('read', 'doc', '42')` and `('doc', '42', undefined, 'read')` both spell `read:doc:42`, two different checks share one map entry, and one answers for the other.

Every check still runs the full pipeline, hooks included. Pass `{ telemetry: false }` as the fourth argument to skip per-check `onMetrics` on hot UI gates. A batch of more than 1024 checks throws.

## Explain

```ts
const trace = await engine.explain('bob', 'update', { type: 'document', id: 'doc-2', attributes: {} })
console.log(trace.summary)
```

```text
DENIED: "bob" attempting update on document
  Roles: [editor, viewer]
  __rbac__ [allow-overrides]: Allowed by rule "__rbac__#5" (1/16 rules matched)
  document-ownership [deny-overrides]: Denied by rule "deny-non-owner-write" (2/2 rules matched)
  document-lifecycle [deny-overrides]: Allowed by rule "allow-otherwise" (1/3 rules matched)
  Result: Denied by rule "deny-non-owner-write"
```

```ts
interface IResult {
  readonly decision: AccessControl.IDecision
  readonly request: { action: string; resourceType: string; resourceId?: string; scope?: string }
  readonly subject: {
    id: string
    roles: readonly string[]
    scopedRolesApplied: readonly string[]
    attributes: Readonly<Record<string, IamPrimitives.AttributeValue>>
  }
  readonly policies: readonly Explain.IPolicyTrace[]
  readonly summary: string
}
```

Each `IPolicyTrace` carries `policyId`, `policyName`, `algorithm`, `targetMatch`, `result`, `reason`, `decidingRuleId`, `decidingRule`, and a `rules` array. Each `IRuleTrace` carries `ruleId`, `effect`, `priority`, `actionMatch`, `resourceMatch`, `conditionsMet`, `matched`, and a `conditions` tree whose leaves record the resolved `expected` and `actual` values side by side - which is how you find a condition comparing against `null`.

| Explain does | Explain does not |
| --- | --- |
| run `beforeEvaluate` | run `afterEvaluate`, `onDeny`, or `onError` |
| evaluate every rule in every policy | short-circuit on the first deny |
| resolve the subject through the normal cache | work in production mode |

`summary` and the condition leaves embed policy names and request attribute values verbatim. If you render a trace in a debug panel, run those strings through `escapeHtml` from `@gentleduck/iam/core/explain` first.

## The admin API

```ts
await engine.admin.savePolicy(policy)          // invalidates the policy cache
await engine.admin.deletePolicy('old-policy')  // invalidates the policy cache
await engine.admin.saveRole(role)              // invalidates roles + subjects holding role.id
await engine.admin.deleteRole('reviewer')      // invalidates roles + subjects holding that ID
await engine.admin.assignRole('alice', 'editor')          // invalidates alice
await engine.admin.revokeRole('alice', 'editor')          // invalidates alice
await engine.admin.assignRole('alice', 'admin', 'team-acme')  // scoped, chapter 5
await engine.admin.updateAssignmentScope('alice', 'admin', 'team-acme', 'team-globex')
await engine.admin.setAttributes('bob', { department: 'platform' })  // merges, invalidates bob
const attrs = await engine.admin.getAttributes('bob')
```

Reads - `listPolicies`, `getPolicy`, `listRoles`, `getRole`, `getAttributes` - invalidate nothing. Every mutation invalidates for you; you never need a manual `cache.*` call after an admin write.

`updateAssignmentScope` moves an assignment in one write when the adapter supports it and falls back to revoke plus assign when it does not.

### Snapshots

```ts
const snapshot = await engine.admin.export()
// { schemaVersion: 1, exportedAt: '2026-09-02T...', policies: [...], roles: [...] }

const result = await engine.admin.import(snapshot, { mode: 'merge' })
// { policiesAdded, policiesDeleted, rolesAdded, rolesDeleted }
```

`export()` is a *configuration* snapshot: policies and roles only. Subjects and assignments are user data, vary per environment, and most adapters cannot enumerate them cheaply. `mode: 'merge'` (the default) upserts; `mode: 'replace'` first deletes everything not in the snapshot. A `schemaVersion` mismatch throws before any write.

`engine.admin` performs no authorization of its own. Anything that reaches `savePolicy` or `assignRole` can rewrite your entire authorization model. Put your own check in front of every admin route.

## Lifecycle

```ts
await engine.preload()                    // warm policies, roles, __rbac__, merged set
await engine.preload({ validator: true }) // also pull in the lazy validator chunk
const health = await engine.healthCheck() // { ok, adapter, cacheHitRate, adapterLatencyMs, lastError? }
engine.dispose()                          // release the invalidator subscription
```

Call `preload()` at boot so the first real request does not pay the cold load. Wire `healthCheck()` to `/healthz`: it does one timed adapter round trip and reports `ok: false` when the adapter is unreachable, which is the signal an orchestrator needs to pull the instance. `iamFlushSharedCaches()` clears the process-wide regex and dot-path caches - schedule it periodically in multi-tenant deployments.

## What just happened

Run the finished app and read the log. Four things are worth noticing.

1. **`beforeEvaluate` removed a whole class of caller bug.** `engine.can('bob', 'update', { type: 'document', id: 'doc-4', attributes: {} })` denies with `Denied by rule "deny-archived-writes"` - the caller never mentioned `status`.
2. **`afterEvaluate` and `onDeny` fire on every check including every batch entry**, which is why the batch call emits four audit lines. `explain()` emits none.
3. **Denials name their rule.** `No matching rules. Defaulted to deny` means no rule fired at all - usually a missing grant. `Denied by rule "X"` means a deny rule matched. Those two need different fixes.
4. **The cache counters tell you the shape of your traffic.** After the demo run, `mergedPolicies` shows 8 hits to 1 miss and `subjects` shows 6 hits to 3 misses - three distinct subjects, each loaded once.

## Try it

1. Add a fifth document owned by `carol` with `status: 'draft'`, then confirm Bob cannot read it but Carol can - without passing a single attribute at the call site.
2. Set `cacheTTL: 0` and rerun. Watch `subjects.misses` climb once per check, and `hits` stay at zero.
3. Call `engine.admin.saveRole` with an `editor` role that also grants `delete` on `document`, then immediately recheck Bob's delete. It is allowed - the admin write invalidated the role and subject caches for you.
4. Build a second engine over the same adapter with `mode: 'production'` and compare `check()` return values. Then call `explain()` on it and read the error.
5. Add `onMetrics` accumulation into a histogram and print p50 and p99 after 1000 checks.

## State so far

This is the complete DocDuck source at the end of chapter 4. Chapters 5 to 8 start from exactly these files.

```
docduck/
  src/
    roles.ts      - three roles, inheritance, startup validation
    policies.ts   - two ABAC policies
    documents.ts  - the tiny document store the hook reads
    access.ts     - adapter, hooks, engine
    main.ts       - the demo script
  package.json
  tsconfig.json
```

### `src/roles.ts`

```ts title="src/roles.ts"
import { defineRole } from '@gentleduck/iam'
import { validateRoles } from '@gentleduck/iam/core/validate'

export const viewer = defineRole('viewer')
  .name('Viewer')
  .desc('Read-only access to documents and teams')
  .grant('read', 'document')
  .grant('read', 'team')
  .build()

export const editor = defineRole('editor')
  .name('Editor')
  .desc('Writes documents')
  .inherits('viewer')
  .grant('create', 'document')
  .grant('update', 'document')
  .grant('share', 'document')
  .build()

export const admin = defineRole('admin')
  .name('Administrator')
  .desc('Manages teams and their members')
  .inherits('editor')
  .grant('delete', 'document')
  .grant('archive', 'document')
  .grant('manage', 'team')
  .grant('manage', 'user')
  .meta({ tier: 'staff' })
  .build()

export const roles = [viewer, editor, admin]

const check = validateRoles(roles)
if (!check.valid) {
  throw new Error(check.issues.map((i) => `[${i.code}] ${i.message}`).join('; '))
}
for (const issue of check.issues) {
  if (issue.type === 'warning') console.warn(`[iam] ${issue.code}: ${issue.message}`)
}
```

### `src/policies.ts`

```ts title="src/policies.ts"
import { definePolicy } from '@gentleduck/iam'

export const ownershipPolicy = definePolicy('document-ownership')
  .name('Document ownership')
  .desc('Writes to a document are limited to its author, unless the subject is an admin')
  .version(1)
  .algorithm('deny-overrides')
  .target({ actions: ['update', 'delete', 'share'], resources: ['document'] })
  .rule('deny-non-owner-write', (r) =>
    r
      .deny()
      .desc('Only the author may write, admins excepted')
      .priority(100)
      .on('update', 'delete', 'share')
      .of('document')
      .when((w) => w.resourceAttr('ownerId', 'neq', '$subject.id').not((n) => n.role('admin'))),
  )
  .rule('allow-owner-write', (r) =>
    r
      .allow()
      .desc('Nothing above objected, so this policy consents')
      .priority(1)
      .on('update', 'delete', 'share')
      .of('document'),
  )
  .build()

export const lifecyclePolicy = definePolicy('document-lifecycle')
  .name('Document lifecycle')
  .desc('Drafts are visible only to their author; archived documents are read-only')
  .version(1)
  .algorithm('deny-overrides')
  .target({ resources: ['document'] })
  .rule('deny-foreign-drafts', (r) =>
    r
      .deny()
      .desc('A draft is visible only to its author')
      .priority(60)
      .on('read')
      .of('document')
      .when((w) => w.resourceAttr('status', 'eq', 'draft').resourceAttr('ownerId', 'neq', '$subject.id')),
  )
  .rule('deny-archived-writes', (r) =>
    r
      .deny()
      .desc('Archived documents cannot be modified')
      .priority(60)
      .on('update', 'delete', 'share')
      .of('document')
      .when((w) => w.resourceAttr('status', 'eq', 'archived')),
  )
  .rule('allow-otherwise', (r) =>
    r.allow().desc('No lifecycle objection').priority(1).on('*').of('document'),
  )
  .build()

export const policies = [ownershipPolicy, lifecyclePolicy]
```

### `src/documents.ts`

```ts title="src/documents.ts"
import type { IamPrimitives } from '@gentleduck/iam'

export interface Document {
  readonly id: string
  readonly ownerId: string
  readonly teamId: string
  readonly status: 'draft' | 'published' | 'archived'
}

const store = new Map<string, Document>([
  ['doc-1', { id: 'doc-1', ownerId: 'bob', teamId: 'team-acme', status: 'published' }],
  ['doc-2', { id: 'doc-2', ownerId: 'alice', teamId: 'team-acme', status: 'published' }],
  ['doc-3', { id: 'doc-3', ownerId: 'alice', teamId: 'team-acme', status: 'draft' }],
  ['doc-4', { id: 'doc-4', ownerId: 'bob', teamId: 'team-globex', status: 'archived' }],
])

export async function findDocument(id: string): Promise<Document | undefined> {
  return store.get(id)
}

export function documentAttributes(doc: Document): IamPrimitives.Attributes {
  return { ownerId: doc.ownerId, teamId: doc.teamId, status: doc.status }
}
```

### `src/access.ts`

```ts title="src/access.ts"
import { IamEngine, type IamEngineTypes } from '@gentleduck/iam'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import { documentAttributes, findDocument } from './documents'
import { policies } from './policies'
import { roles } from './roles'

export const adapter = new IamMemoryAdapter({
  roles,
  policies,
  assignments: {
    alice: ['viewer'],
    bob: ['editor'],
    carol: ['admin'],
  },
  attributes: {
    alice: { department: 'design' },
    bob: { department: 'engineering' },
    carol: { department: 'engineering' },
  },
})

const hooks: IamEngineTypes.IHooks = {
  async beforeEvaluate(request) {
    if (request.resource.type !== 'document' || !request.resource.id) return request
    const doc = await findDocument(request.resource.id)
    if (!doc) return request
    return {
      ...request,
      resource: {
        ...request.resource,
        attributes: { ...documentAttributes(doc), ...request.resource.attributes },
      },
    }
  },
  afterEvaluate(request, decision) {
    console.log(
      `[audit] ${request.subject.id} ${decision.effect} ${request.action} on ${request.resource.type}:${request.resource.id ?? '*'}`,
    )
  },
  onDeny(request, decision) {
    console.warn(`[denied] ${request.subject.id} ${request.action} ${request.resource.type}: ${decision.reason}`)
  },
  onError(error, request) {
    console.error(`[iam:error] ${request.subject.id} ${request.action}: ${error.message}`)
  },
  onPolicyError(error, policyId) {
    console.error(`[iam:policy] "${policyId}" threw and was skipped: ${error.message}`)
  },
  onMetrics(event) {
    if (event.failOpen) console.error('[iam:fail-open]', event)
    if (event.durationMs > 5) console.warn(`[iam:slow] ${event.action}:${event.resource} ${event.durationMs}ms`)
  },
}

export const engine = new IamEngine({
  adapter,
  hooks,
  defaultEffect: 'deny',
  mode: 'development',
  cacheTTL: 60,
  maxCacheSize: 1000,
  policyCombine: 'and',
  adapterTimeoutMs: 5_000,
})
```

### `src/main.ts`

```ts title="src/main.ts"
import { engine } from './access'

const doc = (id: string) => ({ type: 'document', id, attributes: {} })

async function main() {
  await engine.preload()

  console.log(await engine.can('bob', 'update', doc('doc-1')))    // true
  console.log(await engine.can('bob', 'update', doc('doc-2')))    // false
  console.log(await engine.can('carol', 'update', doc('doc-2')))  // true
  console.log(await engine.can('bob', 'read', doc('doc-3')))      // false
  console.log(await engine.can('bob', 'update', doc('doc-4')))    // false

  const perms = await engine.permissions('bob', [
    { action: 'read', resource: 'document', resourceId: 'doc-2' },
    { action: 'update', resource: 'document', resourceId: 'doc-2' },
    { action: 'delete', resource: 'document', resourceId: 'doc-1' },
    { action: 'manage', resource: 'team' },
  ])
  console.log(perms)
  // { 'read:document:doc-2': true, 'update:document:doc-2': false,
  //   'delete:document:doc-1': false, 'manage:team': false }

  const trace = await engine.explain('bob', 'update', doc('doc-2'))
  console.log(trace.summary)

  await engine.admin.assignRole('alice', 'editor')
  console.log(await engine.getEffectiveRoles('alice'))            // [ 'viewer', 'editor' ]
  console.log(await engine.can('alice', 'update', doc('doc-2')))  // true

  console.log(engine.stats.get().subjects)
  console.log(await engine.healthCheck())

  engine.dispose()
}

void main()
```

### Where the model stands

* **Actions**: `create`, `read`, `update`, `delete`, `share`, `archive`, `manage`.
* **Resources**: `document`, `team`, `user`.
* **Roles**: `viewer` to `editor` to `admin`, a straight inheritance chain.
* **Subjects**: `alice` (viewer, plus editor after the admin call), `bob` (editor), `carol` (admin).
* **Policies**: `document-ownership` and `document-lifecycle`, both `deny-overrides`, both with a consent rule.
* **Not used yet**: scopes, `createIam` typing, any adapter other than memory, and the whole server and client surface.

Chapter 5 puts `teamId` to work: the same subject holding different roles in different teams.

## See also

* [Engine methods](/duck-iam/advanced/engine/methods) - the full reference for every signature here
* [Hooks](/duck-iam/advanced/engine/hooks) and [modes](/duck-iam/advanced/engine/modes)
* [Caching](/duck-iam/advanced/engine/caching) and [the admin API](/duck-iam/advanced/engine/admin)
* [Explain](/duck-iam/advanced/explain) - the trace shape field by field
* [Chapter 5: multi-tenant scoping](/duck-iam/course/chapter-5)