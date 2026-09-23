`IamMemoryAdapter` keeps the whole authorization store in four `Map` instances inside the current process. It has no dependencies, no I/O, and no failure modes worth handling, which makes it the reference implementation of `IamAdapter.IAdapter` and the fastest way to write an engine test. It is also the only built-in adapter that loses everything on restart, so it is deliberately limited to tests, prototypes, and CI.

## Install

Nothing to install beyond the package itself.

```ts
import { IamMemoryAdapter, iamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import type { IamMemory } from '@gentleduck/iam/adapters/memory'
```

## What it stores

Four maps, all private, all keyed on an id. Assignments are a single array per subject holding both scoped and unscoped entries, split apart on read.

`ASSIGNMENTS` is the only non-obvious one: each entry is `{ role, scope? }`, and the same array feeds both reads. `getSubjectRoles` filters for `scope == null` and deduplicates; `getSubjectScopedRoles` filters for the entries that have a scope and maps them to `{ role, scope }`. `entry.role` must name a role in `ROLES`: both `assignRole` and the constructor seed refuse a grant of a role the store does not hold.

## Basic usage

```ts
import { IamEngine } from '@gentleduck/iam'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'

const adapter = new IamMemoryAdapter({
  roles: [
    { id: 'admin', name: 'Administrator', permissions: [{ action: '*', resource: '*' }] },
    {
      id: 'editor',
      name: 'Editor',
      permissions: [
        { action: 'read', resource: '*' },
        { action: 'create', resource: 'post' },
        { action: 'update', resource: 'post' },
        { action: 'delete', resource: 'post' },
      ],
    },
    { id: 'viewer', name: 'Viewer', permissions: [{ action: 'read', resource: '*' }] },
  ],

  policies: [
    {
      id: 'default',
      name: 'Default Policy',
      algorithm: 'deny-overrides',
      rules: [
        {
          id: 'deny-banned',
          effect: 'deny',
          priority: 100,
          actions: ['*'],
          resources: ['*'],
          conditions: { all: [{ field: 'subject.attributes.status', operator: 'eq', value: 'banned' }] },
        },
        {
          id: 'allow-all',
          effect: 'allow',
          priority: 1,
          actions: ['*'],
          resources: ['*'],
          conditions: { all: [] },
        },
      ],
    },
  ],

  assignments: {
    'user-1': ['admin'],
    'user-2': ['editor'],
    'user-3': ['viewer'],
  },

  attributes: {
    'user-1': { department: 'engineering', level: 3, verified: true },
  },
})

const engine = new IamEngine({ adapter })
const allowed = await engine.can('user-1', 'read', { type: 'post', attributes: {} })
```

The factory is equivalent if you prefer functions to `new`:

```ts
import { iamMemoryAdapter } from '@gentleduck/iam/adapters/memory'

const adapter = iamMemoryAdapter({ assignments: { 'user-1': ['admin'] } })
```

## API reference

### `new IamMemoryAdapter(init?)`

```ts
class IamMemoryAdapter<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
> implements IamAdapter.IAdapter<TAction, TResource, TRole, TScope> {
  constructor(init?: IamMemory.IInit<TAction, TResource, TRole, TScope>)
}
```

The constructor is fully synchronous, and it **can throw**. The seed goes through the same guards the write path uses, so the constructor cannot reach a state the adapter's own methods forbid: policies are run through `iamNormalizePolicy`, and assignments through the same unstored-role refusal `assignRole` applies. Roles are seeded before assignments, so an init naming its own roles is fine - an init naming a role it does not also define throws.

### `IamMemory.IInit`

Every field is optional; `new IamMemoryAdapter()` gives an empty store.

| Option | Type | Default | Meaning |
|---|---|---|---|
| `policies` | `AccessControl.IPolicy<TAction, TResource, TRole>[]` | `[]` | Seed policies, keyed into the map on `policy.id`. A later id wins over an earlier duplicate. |
| `roles` | `AccessControl.IRole<TAction, TResource, TRole, TScope>[]` | `[]` | Seed roles, keyed on `role.id`. |
| `assignments` | `Record<string, TRole[]>` | `{}` | Subject id to role ids. **Every seeded assignment is unscoped.** |
| `attributes` | `Record<string, IamPrimitives.Attributes>` | `{}` | Subject id to its attribute bag. Each bag is shallow-copied on the way in, matching `setSubjectAttributes`. |

```ts
import type { IamMemory } from '@gentleduck/iam/adapters/memory'

const init: IamMemory.IInit<'read' | 'write', 'post', 'viewer' | 'editor', 'org-1'> = {
  roles: [{ id: 'viewer', name: 'Viewer', permissions: [{ action: 'read', resource: 'post' }] }],
  assignments: { 'user-1': ['viewer'] },
}
```

### `iamMemoryAdapter(init?)`

```ts
function iamMemoryAdapter(...args: ConstructorParameters<typeof IamMemoryAdapter>): IamMemoryAdapter
```

Returns a `IamMemoryAdapter` with the default `string` generics. Reach for the class when you want typed action, resource, role, and scope unions.

## Behaviour

The adapter implements the thirteen required methods plus two of the six optional ones - `getSubjectScopedRoles` and `updateAssignmentScope`. It has no `withClient`, so `engine.withTransaction` throws against it. Specifics worth knowing:

| Behaviour | Detail |
|---|---|
| Read options | `IReadOptions.signal` is accepted and **ignored** - there is nothing to cancel. The engine still enforces `adapterTimeoutMs`. |
| Duplicate assignment | `assignRole` compares `(role, scope)` against existing entries and skips a match. Calling it twice is a no-op the second time. |
| `getSubjectRoles` dedupe | The result is passed through a `Set`, so a store seeded with the same role twice returns it once. |
| `revokeRole` without a scope | Removes **every** assignment of that role for the subject, scoped and unscoped. Pass the scope to remove a single grant. |
| `revokeRole` on an unknown subject | Resolves without doing anything. |
| `updateAssignmentScope` | Returns `false` when no `(role, fromScope)` entry exists. When the target scope is already granted it drops the source entry instead of creating a duplicate, and returns `true`. |
| Attribute merge | `setSubjectAttributes` spreads the patch over the existing bag. Keys absent from the patch survive; set a key to `null` to clear it. |
| Attribute shape guard | A non-plain-object `attrs` rejects with `[@gentleduck/iam:memory] attributes for "<id>" must be a plain object (got <type>)` and leaves stored attributes untouched. An empty object is a legal no-op write. |
| `getSubjectAttributes` on an unknown subject | Returns `{}`. |
| `savePolicy` / `saveRole` | Upsert on `id`. |
| `deletePolicy` / `deleteRole` | Idempotent; an unknown id resolves. `deleteRole` also removes every grant naming the role. |
| `IAssignOptions` | `startsAt`, `expiresAt` and per-grant `attributes` are **refused**, not ignored: `assignRole` throws and names the option. Use the [Drizzle adapter](/duck-iam/integrations/adapters/drizzle) for temporal grants. |
| Grant scopes | `scope: ''` is refused on assign and on revoke; `scope: '*'` is refused on a grant and accepted on a lookup. A scoped grant matches literally, so a row stored at `'*'` would answer only a request whose own scope is the string `"*"`. |
| Unstored roles | `assignRole` refuses a role the store does not hold, with the same message every adapter uses. |
| Attribute reads are copies | `getSubjectAttributes` returns a fresh object. It used to hand back the live internal bag, so a caller who read attributes and then edited what they were given rewrote the store - no write call, no validation, and nothing to invalidate a cache from. The copy is shallow: an array value is still shared. |
| Role and policy objects are shared | `saveRole(r)` stores the object you passed. Mutating `r` afterwards mutates the store. `savePolicy` normalises first, so it stores a fresh row. |

### Seeding scoped roles

The `assignments` seed cannot express a scope. Construct first, then assign:

```ts
const adapter = new IamMemoryAdapter<string, string, 'viewer' | 'admin', 'org-1'>({
  assignments: { alice: ['viewer'] }, // global
})

await adapter.assignRole('alice', 'admin', 'org-1') // scoped

await adapter.getSubjectRoles('alice')       // ['viewer']
await adapter.getSubjectScopedRoles('alice') // [{ role: 'admin', scope: 'org-1' }]
```

That split is the contract every adapter shares, and the compliance suite pins it: a scoped grant must never appear in `getSubjectRoles`, or a role granted for one tenant would apply in all of them.

## Limits

There are no configurable limits, and that is the point to understand:

* **No size cap.** The maps grow until the process runs out of heap. A test that assigns a million subjects will happily do so. The engine's own `maxPolicies` and `maxRoles` caps (default `10_000` each) still apply when it fills its cache from the adapter.
* **No eviction, no TTL.** Nothing ages out. `cacheTTL` on the engine expires the *engine's* cache, not this store.
* **No isolation between engines.** Two `IamEngine` instances sharing one adapter instance share the store; two adapter instances share nothing. Compliance factories must return a fresh adapter per call for this reason.
* **No concurrency hazards, and no concurrency guarantees.** Every method resolves synchronously inside a promise, so there is no interleaving within a single call - but `setSubjectAttributes` is still a read-then-write, so it has the same last-writer-wins shape as the other adapters if you ever port the code.
* **No persistence.** Not to disk, not across workers, not across a `--watch` restart.

## Why it is test-only

Every process restart - a deploy, a crash, a container reschedule, a serverless cold start - resets every policy, role, assignment, and attribute to the constructor seed. With `defaultEffect: 'deny'` that is a total outage; with `defaultEffect: 'allow'` it is a total bypass.

Three concrete reasons, beyond "it does not persist":

1. **Restarts silently revert authorization state.** Nothing errors. The engine loads a seed that is months out of date and answers confidently. A revoked admin comes back.
2. **Every instance diverges.** Two nodes behind a load balancer hold different stores, so the same request gets different answers depending on which one serves it. Neither the [Redis invalidator](/duck-iam/integrations/invalidators/redis) nor any cache setting helps - the *data* differs, not the cache.
3. **There is no audit trail.** Admin writes leave no row, no timestamp, and no actor. When someone asks who granted a role, there is nothing to read.

### When to use it

* Unit and integration tests - seed a known store, assert the decision
* Local development before you commit to a schema
* CI pipelines that must not depend on a database
* Prototyping the policy model
* As the control in a custom-adapter test: run your suite against both and assert identical decisions

### When not to use it

* Any production deployment
* Any multi-process or multi-instance deployment, including serverless
* Anywhere authorization state must survive a restart or be audited

For production, move to [Prisma](/duck-iam/integrations/adapters/prisma), [Drizzle](/duck-iam/integrations/adapters/drizzle), or [Redis](/duck-iam/integrations/adapters/redis). If you only need state to survive a restart in a single process, the [File adapter](/duck-iam/integrations/adapters/file) is the smallest step up.

## Gotchas

* **Seeded assignments are unscoped.** A test that seeds `{ alice: ['admin'] }` and then asserts a scoped decision is testing a global grant.
* **Seeded role objects are stored by reference.** Reusing one role object across two adapters in a test suite means a mutation in one test leaks into another. Build fresh objects per test, or per compliance-factory call.
* **A dangling role id throws.** Seeding `{ u1: ['ghost'] }` with no `ghost` role, or calling `assignRole('u1', 'ghost')`, is refused. It used to produce a live grant that `resolveEffectiveRoles` kept and a hand-written ABAC rule testing `subject.roles contains 'ghost'` fired on - measured, an ALLOW.
* **`revokeRole` without a scope is broader than it looks.** It clears the global grant *and* every scoped one.

## See also

* [Adapters overview](/duck-iam/integrations/adapters) - the interface this adapter implements in full
* [File adapter](/duck-iam/integrations/adapters/file) - the same shape with JSON persistence
* [Custom adapter](/duck-iam/integrations/adapters/custom) - use this adapter as the reference to diff against
* [Choosing an adapter](/duck-iam/integrations/adapters/comparison) - the feature matrix