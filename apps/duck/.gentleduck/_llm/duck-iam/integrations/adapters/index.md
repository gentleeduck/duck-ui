An adapter is the only thing `IamEngine` requires. It is a plain object implementing `IamAdapter.IAdapter`: nineteen async methods, thirteen required and six optional, that read and write policies, roles, role assignments, and subject attributes. Evaluation, caching, role inheritance, scope resolution, explain traces, and timeouts all live in the engine, so an adapter never decides anything - it only stores and returns rows.

## The three stores

`IamAdapter.IAdapter` is the intersection of three narrower interfaces, all generic over the same `TAction`, `TResource`, `TRole`, and `TScope` parameters your engine is typed with. You can accept the narrower interface in your own code when you only need one part.

`IPolicyStore` and `IRoleStore` are symmetrical CRUD surfaces keyed on `id`. `ISubjectStore` is the asymmetric one: `getSubjectRoles` returns **global** assignments only, while `getSubjectScopedRoles` returns the scoped ones, and the two must never overlap.

Six members carry a `?`. Five live on `ISubjectStore`; `withClient` is declared on `IAdapter` itself, because re-binding to a driver handle is a property of the whole adapter rather than of one store.

```ts
import type { AccessControl, IamAdapter, IamPrimitives, IamRequest } from '@gentleduck/iam'

export interface IAdapter<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
> extends IPolicyStore<TAction, TResource, TRole>,
    IRoleStore<TAction, TResource, TRole, TScope>,
    ISubjectStore<TRole, TScope> {
  withClient?(client: unknown): IAdapter<TAction, TResource, TRole, TScope>
}
```

## Method reference

Every read method takes an optional `IamAdapter.IReadOptions` - currently just `{ signal?: AbortSignal }`. Every method returns a promise.

| Method | Required | Returns | Contract |
|---|---|---|---|
| `listPolicies(opts?)` | yes | `IPolicy[]` | Every stored policy, any order. Also the liveness probe behind `engine.healthCheck()`. |
| `getPolicy(id, opts?)` | yes | `IPolicy` or `null` | `null` on a miss - never `undefined`, never a throw. |
| `savePolicy(policy)` | yes | `void` | Upsert on `policy.id`. The engine invalidates its policy cache afterwards. |
| `deletePolicy(id)` | yes | `void` | Idempotent; an unknown id resolves. |
| `listRoles(opts?)` | yes | `IRole[]` | Every stored role. |
| `getRole(id, opts?)` | yes | `IRole` or `null` | `null` on a miss. |
| `saveRole(role)` | yes | `void` | Upsert on `role.id`. Invalidates the role cache. |
| `deleteRole(id)` | yes | `void` | Idempotent, and it **cascades**: the role and every grant naming it go together. Leaving the grants is not the harmless option - they still read as grants, and a role later recreated under the reused id hands them back to everyone who once held it. |
| `getSubjectRoles(subjectId, opts?)` | yes | `TRole[]` | **Unscoped assignments only**, deduplicated. `[]` for an unknown subject. |
| `getSubjectScopedRoles?(subjectId, opts?)` | optional | `IamRequest.IScopedRole[]` | **Scoped assignments only**, one entry per `(role, scope)` pair. Omit it and every subject looks like it has no scoped roles. |
| `assignRole(subjectId, roleId, scope?, opts?)` | yes | `void` | Idempotent on `(role, scope)`. Refuses a role that is not stored, refuses `scope: ''` and `scope: '*'`, and refuses any `IAssignOptions` field it cannot store. |
| `revokeRole(subjectId, roleId, scope?)` | yes | `void` | With a scope: that scoped grant only. Without: **every** grant of that role, scoped and unscoped. |
| `updateAssignmentScope?(subjectId, roleId, fromScope, toScope, actor?)` | optional | `boolean` | Move one grant in a single write; `false` when nothing matched `fromScope` - and `false` must mean nothing was written. |
| `assignRoleMany?(rows)` | optional | `number[]` or `null` | Set-based assign. Returns indices into `rows` of the grants actually written, or `null` when the driver cannot say which were new. |
| `revokeRoleMany?(rows)` | optional | `number[]` or `null` | Set-based revoke, same reporting rule. |
| `getSubjectGrantBoundary?(subjectId, opts?)` | optional | `number` or `null` | Earliest future `startsAt` / `expiresAt` across the subject's grants, epoch ms, so the engine can cap its cache entry there. `null` when nothing is time-boxed. |
| `withClient?(client)` | optional | `IAdapter` | Re-bind to a driver handle, typically a transaction. Returns a **new** adapter; the original keeps writing to its own client. |
| `getSubjectAttributes(subjectId, opts?)` | yes | `IamPrimitives.Attributes` | `{}` for an unknown subject. Throw on a corrupt stored blob rather than returning `{}`. |
| `setSubjectAttributes(subjectId, attrs)` | yes | `void` | **Merge**, never replace. Keys absent from `attrs` survive. |

### Optional methods and their fallbacks

Omitting an optional method costs correctness nowhere - each one is either an optimisation the engine falls back for, or a capability the engine refuses outright rather than approximating:

* **`getSubjectScopedRoles` absent** - the engine has no scoped grants to merge. There is no error and no warning, so scope-aware evaluation degrades silently. All six shipped adapters implement it.
* **`updateAssignmentScope` absent, or present and returning `false`** - `engine.admin.updateAssignmentScope(...)` falls back to `revokeRole` + `assignRole`. Same end state, but you lose row identity (`id`, `createdAt`) and atomicity, and there is a window where the subject holds neither.
* **`assignRoleMany` / `revokeRoleMany` absent** - the engine loops per row instead of issuing one statement.
* **`getSubjectGrantBoundary` absent** - the engine caches the subject for the full `cacheTTL` instead of capping the entry at the next grant transition.
* **`withClient` absent** - `engine.withTransaction(tx)` **throws**, rather than silently writing outside the caller's transaction.

Which adapter implements what is declared once, in `src/adapters/__compliance__/optional-support.ts`, and checked against the real prototypes by `optional-method-matrix.test.ts` - so a method that disappears turns a row red instead of turning asserting tests into skipped ones. [Choosing an adapter](/duck-iam/integrations/adapters/comparison) reproduces the table.

### Thrown errors

The engine treats any rejection from an adapter as a hard failure and routes it through its fail-closed path (`onError`, then the configured `defaultEffect`). These throws are expected, and the last two come from the engine rather than from the adapter:

| Situation | Who throws | Message shape |
|---|---|---|
| Backend unreachable, permission denied, disk error | the adapter | whatever your driver throws, ideally wrapped with `[@gentleduck/iam:

Both the subject LRU (`maxCacheSize`, default `1000` entries) and the policy/role caches expire after `cacheTTL` seconds (default `60`; `0` disables caching entirely and makes every call hit the adapter). Writes through `engine.admin` invalidate the matching cache immediately, so an adapter never has to publish anything itself - unless you run more than one process, in which case wire the [Redis invalidator](/duck-iam/integrations/invalidators/redis).

## Swapping adapters

Adapters are interchangeable by construction: engine, builder, server middleware, and client code do not know which one is underneath. Migration is data movement only.

```ts
import { IamEngine } from '@gentleduck/iam'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'

// development
const adapter = new IamMemoryAdapter({ roles, policies, assignments: { 'user-1': ['admin'] } })
const engine = new IamEngine({ adapter, defaultEffect: 'deny' })

const allowed = await engine.can('user-1', 'read', { type: 'post', attributes: {} })
```

Swapping `IamMemoryAdapter` for `IamDrizzleAdapter` changes those two lines and nothing else. [Choosing an adapter](/duck-iam/integrations/adapters/comparison) walks the trade-offs.

## Verifying an adapter

Every shipped adapter runs the same vitest matrix, `runAdapterCompliance(name, factory, { supports })`, which pins the cross-backend contract: empty stores return `[]` and `null`, saves upsert, deletes are idempotent, `deleteRole` cascades, `getSubjectRoles` returns only unscoped roles, `getSubjectScopedRoles` returns only scoped ones, revoke with a scope removes just that grant while revoke without one removes them all, and `setSubjectAttributes` merges rather than replaces. `supports` declares which optional methods you implement; clauses for the rest are never registered, so an unimplemented method cannot show up as a pass. A second suite, `runEngineCapabilityCompliance`, runs the same behaviour one rung up through `engine.admin`, where the fallbacks live. See [Custom adapter](/duck-iam/integrations/adapters/custom).

## See also

* [Choosing an adapter](/duck-iam/integrations/adapters/comparison) - feature matrix, decision tree, FAQ
* [Custom adapter](/duck-iam/integrations/adapters/custom) - implement the interface for any backend
* [Caching](/duck-iam/advanced/engine/caching) - what the engine keeps in front of your adapter
* [Admin API](/duck-iam/advanced/engine/admin) - the write path that calls these methods