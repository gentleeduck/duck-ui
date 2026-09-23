`rolesToPolicy()` is the bridge between RBAC and ABAC in duck-iam. It takes the full list of role definitions and returns one `AccessControl.IPolicy` in which every permission of every role has become an allow rule gated on holding that role. The engine calls it for you; understanding its output is what makes an [explain trace](/duck-iam/advanced/explain) readable.

## API reference

```ts
import { rolesToPolicy, resolveEffectiveRoles, MAX_INHERITANCE_DEPTH, IAM_RBAC_POLICY_ID } from '@gentleduck/iam'

function rolesToPolicy(
  roles: AccessControl.IRole[],
  scopeMode: 'flat' | 'hierarchical' = 'flat',
): AccessControl.IPolicy
function resolveEffectiveRoles(assignedRoles: string[], allRoles: AccessControl.IRole[]): string[]
const MAX_INHERITANCE_DEPTH = 32
const IAM_RBAC_POLICY_ID = '__rbac__'
```

| Export | Takes | Returns |
| --- | --- | --- |
| `rolesToPolicy` | Every role definition, independent of who holds them, plus the engine's `scopeMode` | One policy: `id: '__rbac__'`, `name: 'RBAC Policies'`, `description: 'Auto-generated from role definitions'`, `algorithm: 'allow-overrides'`, one rule per flattened permission |
| `resolveEffectiveRoles` | A subject's assigned role IDs plus every role definition | The closed set of role IDs: assigned plus inherited, de-duplicated. A *directly assigned* id the catalog does not define is kept; an *inherited* one is dropped |
| `MAX_INHERITANCE_DEPTH` | - | The traversal bound both functions share, `32` |
| `IAM_RBAC_POLICY_ID` | - | `'__rbac__'`. Exported because it is not a label: the evaluator has to tell this policy apart from an operator-authored one |

Both are pure. They take data, return data, and hold no engine reference - which is why they are usable in tests and build steps without an adapter.

## The algorithm

Step by step, from `src/core/rbac/rbac.ts`:

1. **Index.** Every role goes into a `Map` keyed by `id`, so `inherits` lookups are constant time.
2. **Flatten** (`FLAT`, `ORDER`). `collectPermissions(roleId)` walks the `inherits` graph and returns `[...inherited, ...own]` as `{ owner, perm }` pairs - the role that declared each permission travels with it, which is what makes a declared scope belong to the declarer. The memo records the shallowest depth each role was reached at, so cycles terminate and a diamond contributes once. Past depth 32 the walk returns an empty list. See [role inheritance](/duck-iam/core/roles/inheritance).
3. **Build the base conditions** (`COND`). Always `subject.roles contains "

`Q` is the empty-role-set shortcut, `FIRST` is why `__rbac__` appears at the head of an [explain trace](/duck-iam/advanced/explain), and `INV` is the only path that rebuilds the conversion.

Invalidation is driven by `engine.cache.invalidateRoles(roleId?)`, which `engine.admin.saveRole()` and `deleteRole()` call for you. It clears the role cache, the converted RBAC policy cache, and the merged-policy cache; then it evicts either every cached subject (when no `roleId` is given) or just the subjects holding that role, in `roles` or in `scopedRoles`. When an [invalidator](/duck-iam/integrations/invalidators/redis) is configured the event is broadcast so every other engine instance does the same. Entries also expire on the configured `cacheTTL`. See [engine caching](/duck-iam/advanced/engine/caching).

## Calling it yourself

You rarely need to, but it is exported and pure:

```ts
import { rolesToPolicy } from '@gentleduck/iam'

const rbac = rolesToPolicy([viewer, author, orgEditor])
console.log(rbac.rules.length) // 7
console.log(rbac.rules.filter((r) => r.description?.startsWith('Author:')).length) // 4
```

Useful for inspecting what a role set actually grants during debugging, asserting on generated rules in tests without an engine, and pre-computing the policy in a build step for a very large role table.

## Why the rule count inflates

Rules are emitted per role **and** per inherited permission, so a chain of N roles each granting M permissions approaches N x M rules in the worst case. That is deliberate:

* Every rule is gated on `subject.roles contains "<roleId>"`, so the precomputed action/resource index lets the evaluator skip irrelevant rules without walking conditions.
* Flattening at conversion time means no inheritance walk per request - each role's effective set is directly checkable.
* The cost is paid on policy load, which is cached, not per evaluation.

For very large role tables watch policy-load time, and know where the compiled table stops helping: `IAM_MAX_COMPILED_ROLES` is 32, because a role's bit position in the grant mask is `1 << index` and JS bitwise operators wrap the shift amount mod 32, so role 32 would alias role 0's bit. Past 32 roles `compileTable` throws `IamRoleLimitExceededError`, the engine catches that error specifically, warns once, and both modes fall back to the interpreter for every subsequent request. Verdicts are unchanged; throughput is not. `healthCheck()` reports it:

```ts
const health = await engine.healthCheck()
health.compiledTable // { available: false, reason: 'role-limit-exceeded', roleCount: 41, limit: 32 }
```

The flag is latched for the life of the engine instance: deleting roles back under 32 and invalidating every cache does not restore the compiled table. Construct a new engine. See [benchmarks](/duck-iam/benchmarks).

## See also

* [Role inheritance](/duck-iam/core/roles/inheritance) - the flattening walk and its bounds
* [Scoped roles](/duck-iam/core/roles/scoped) - where the `scope eq` condition comes from
* [Evaluation pipeline](/duck-iam/core/evaluation) - what happens to the policy once it is built
* [Engine caching](/duck-iam/advanced/engine/caching) - the caches this conversion sits behind