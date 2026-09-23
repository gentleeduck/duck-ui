The engine does not interpret your policy set on every request. It compiles roles and policies once into a `CompiledTable` - a handful of typed arrays keyed by `(action, resource)` - and answers each request with array indexing, map lookups and one bitwise `AND`. This page explains what the table contains, how it is built, what refuses to compile and is evaluated per request instead, and how the pieces combine into a single verdict.

The table is authoritative in **both** modes. Development runs the interpreter alongside it for provenance and cross-checking; production runs the table alone. So this page describes the verdict path whichever mode you are in.

You do not construct or configure the table. Read this page when you need to reason about a verdict, when you hit the 32-role limit, or when you want to know why a particular policy is slower than the rest.

## Compile time

Two independent classifications run. The `R` branch splits every role permission three ways; the `P` branch splits every policy two ways and then classifies each surviving rule per cell. `RES1` and `RES2` are the two escape hatches - the shapes that cannot be reduced to fixed cells and stay on the interpreter.

### The cell universe

The table indexes a dense grid of `(action, resource)` pairs. Both dimensions are collected at compile time from:

* every **non-wildcard** role permission's `action` and `resource`, and
* every rule's `actions` and `resources` on every **flat** (non-residual) policy.

Each dimension gets a `Map` from name to index (`actionId`, `resourceId`), and one cell is addressed by:

```ts
const idx = actionId.get(action)! * nResources + resourceId.get(resource)!
```

That single index addresses five parallel arrays: `kind`, `touched`, `allow`, `dynamic` and `rbacDynamic`. An action or resource that appears in neither list has no index at all, and every lookup for it abstains rather than deciding.

### What counts as a wildcard

```ts
function isWildcard(v: string): boolean {
  return v === '*' || v.endsWith(':*') || v.endsWith('.*')
}
```

`'*'`, an action prefix like `'admin:*'`, and a resource prefix like `'org.*'`. Nothing else. A wildcard could match requests no cell was ever indexed for, which is exactly what a fixed grid cannot represent - so anything wildcarded stays residual.

### Policies: flat or residual

A policy is **residual** when either is true:

* `targets.actions` or `targets.resources` contains a wildcard value, or
* any rule has a wildcard in `actions` or `resources`.

One wildcard rule makes the whole policy residual - the classification is per policy, not per rule.

A **literal** `targets.actions` / `targets.resources` restriction compiles in. It depends only on the `(action, resource)` pair, which is already the cell's key, so it is resolved once at compile time by `policyTargetsActionResource` rather than re-checked on every request. A rule that the literal target excludes never reaches a cell.

A `targets.roles` restriction also compiles in, but it cannot be resolved at compile time - it depends on who is asking. It rides along as `targetRoles` on the cell's policy group and gates that group's vote at request time. Missing the role means "not a voter here", never "deny". See [policy targets](/duck-iam/core/policies/targets).

### Cells: CONST or DYNAMIC

```ts
enum CellKind {
  CONST_DENY = 0,
  CONST_ALLOW = 1,
  DYNAMIC = 2,
}
```

For each flat policy's rules, for each `(action, resource)` the rule names:

| Rule shape at that cell | Result |
| --- | --- |
| Has conditions, or the policy has `targets.roles` | `kind = DYNAMIC` |
| Unconditional `allow` | `kind = CONST_ALLOW` (unless already `DYNAMIC`) |
| Unconditional `deny` | stays `CONST_DENY`, which is the array's zero default |
| Both an unconditional allow and an unconditional deny land here | `kind = DYNAMIC` |

Every rule that touches a cell, conditional or not, is also grouped per policy into `dynamic[idx]` - but only kept when the cell ended up `DYNAMIC`, so a conflicted cell has real group data to resolve with rather than falling through.

`touched[idx] = 1` marks that some flat ABAC policy has a rule shaped for this cell. It is **ABAC-only bookkeeping**: a cell that only RBAC grants stays `touched = 0`. This is why `kind` alone is never enough - `touched` is checked first, and only then is `kind` read.

### Role permissions: three destinations

| Permission shape | Destination |
| --- | --- |
| Literal action and resource, no conditions, no effective scope | a bit in `allow[idx]` |
| Literal action and resource, but conditions and/or a literal scope | a group in `rbacDynamic[idx]` |
| Wildcard action or resource | `rbacResidual`, a synthetic policy evaluated per request |

"Effective scope" is `perm.scope ?? role.scope`, with `undefined` and `'*'` both meaning "no restriction" - the same rule `rolesToPolicy` applies.

## Role bitmasks

The goal is to answer "does this subject's role set grant this permission?" in one `&`, with inheritance already resolved. No walking a role graph per request.

Compile time does it in three steps.

```ts
// 1. Each role gets a bit position.
const roleId = new Map(roles.map((r, i) => [r.id, i]))

// 2. effective[i] = role i's own index plus every ancestor's, closed over `inherits`.
//    Cycle-safe via a `seen` set, depth-capped at 32.

// 3. holders[i] = every role that ends up with role i's grants.
const holders: number[][] = roles.map(() => [])
for (let i = 0; i < effective.length; i++) {
  for (const a of effective[i]!) holders[a]!.push(i)
}

// Bake: for each simple permission owned by role i, OR in every holder's bit.
let mask = 0
for (const holder of holders[i]!) mask |= 1 << holder
allow[idx]! |= mask
```

At request time the engine turns the subject's role names into a mask and intersects:

```ts
function maskFromRoles(table: CompiledTable, roles: readonly string[]): number {
  let mask = 0
  for (const roleName of roles) {
    const idx = table.roleId.get(roleName)
    if (idx !== undefined) mask |= 1 << idx
  }
  return mask
}
// then: (mask & table.allow[idx]) !== 0
```

Only **directly held** role names go into the request mask. Re-expanding inheritance here would be wrong and redundant: the compile step already folded it into `allow`.

### Worked example

Three roles: `viewer` at bit 0, `editor` at bit 1 inheriting `viewer`, `admin` at bit 2 inheriting `editor`.

| Role | `effective[i]` - self plus ancestors |
| --- | --- |
| viewer (0) | `[0]` |
| editor (1) | `[1, 0]` |
| admin (2) | `[2, 1, 0]` |

`holders` is the reverse - who ends up with role `i`'s grants:

| Bit `i` | `holders[i]` | Meaning |
| --- | --- | --- |
| 0 (viewer) | `[0, 1, 2]` | all three end up with viewer's grants |
| 1 (editor) | `[1, 2]` | editor and admin |
| 2 (admin) | `[2]` | admin only |

`viewer` owns `read` on `post`. Baking that permission sets `allow[idx] = (1 << 0) | (1 << 1) | (1 << 2)`, which is `0b111`.

A request from a subject holding only `editor` produces `mask = 1 << 1`, that is `0b010`. The check `0b010 & 0b111` is non-zero, so the request is allowed - in one `AND`, with zero graph walking, because the inheritance was folded in when the table was built.

### The 32-role cap

`allow` is a `Uint32Array`, and JavaScript's bitwise operators coerce to 32-bit integers and wrap shift amounts modulo 32: `1 << 32` is `1 << 0`. A 33rd role would silently alias role 0's bit and hand role 0's grants to anyone holding only role 33.

`compileTable` throws `IamRoleLimitExceededError` rather than risk that.

The engine catches that error specifically, sets a latch, emits one
`console.warn`, and drops to the interpreter - which answers every question
correctly, more slowly. Requests are **not** denied and `onError` does not
fire. Because both modes read the table, both fall back; there is no mode that
escapes the cap by having no table.

The fallback is not silent. `healthCheck()` reports it, with `ok` still `true` because the instance is healthy and what it lost is throughput:

```ts
{ compiledTable: { available: false, reason: 'role-limit-exceeded', roleCount: 33, limit: 32 } }
```

The latch is cleared by anything that changes the role set - `cache.invalidateRoles()`, and the admin role writes that call it - so deleting roles back under 32 lets the table be built again, and a second excursion over the limit warns again rather than being swallowed by the first one's warn-once. A policy write does not clear it: policies cannot change the role count, and clearing there would buy a guaranteed re-throw on every policy write.

The cap is on the **role catalog**, not on users, tenants, scopes or resources. Systems shaped like GitHub or Slack keep a handful of roles and push granularity into permissions and scope, which fits comfortably. Bit 31 is exercised deliberately in the boundary tests, because `1 << 31` is negative in JavaScript and a naive comparison would break there.

### Scope has two mechanisms, and only one of them costs anything

They are easy to conflate.

1. **Subject-level scoped grants** (`subject.scopedRoles`, "this user holds `editor` within `org-1`") are resolved by `enrichSubjectWithScopedRoles` *before* the lookup runs. A matching grant becomes a plain role name in `subject.roles`, so the bitmask path sees an ordinary role. Scope is never a table dimension for this case - it has already collapsed into a bit.
2. **Permission-level scope** (`IPermission.scope` or `IRole.scope`, "this permission only applies within scope X regardless of who holds the role") cannot be pre-resolved, because it depends on the request's scope. It disqualifies the permission from the bitmask and compiles into `rbacDynamic` instead - a per-cell group carrying the role mask, the required scope and any conditions. Matching is `scopeCovers(declared, req.scope, table.scopeMode)`: exact equality, plus `'*'` as a global that covers even an absent request scope, plus - under `scopeMode: 'hierarchical'` - a descendant (`org-1` covers `org-1.team-a`). Never a prefix-sharing sibling: `org-1` does not cover `org-10`, because the test is `requestScope.startsWith('org-1.')`. Never upward, and never on an absent request scope unless the declared scope is `'*'`.

The engine's `scopeMode` is baked onto the table at compile time for exactly this reason, and the same `scopeCovers` is exported from the package root as `iamScopeCovers` (with `iamScopeAncestors` alongside it) - the engine's own function, not a copy.

Two org-scoped roles granting the same `update`/`org` cell become two small groups at one cell:

| Group | `roleMask` | `scope` |
| --- | --- | --- |
| org1-admin's grant | bit 0 | `'org-1'` |
| org2-admin's grant | bit 1 | `'org-2'` |

A subject holding `org1-admin` asking with `scope: 'org-1'` matches the first group and returns without touching the second. That is linear in the number of groups at one cell, not in the number of scoped permissions in the system.

## The CompiledTable

```ts
interface CompiledTable {
  readonly nResources: number
  readonly actionId: ReadonlyMap<string, number>
  readonly resourceId: ReadonlyMap<string, number>
  readonly roleId: ReadonlyMap<string, number>
  readonly policyCombine: AccessControl.PolicyCombine
  readonly scopeMode: 'flat' | 'hierarchical'
  readonly kind: Uint8Array
  readonly touched: Uint8Array
  readonly allow: Uint32Array
  readonly dynamic: (readonly DynamicPolicyGroup[] | undefined)[]
  readonly rbacDynamic: (readonly RbacRuleGroup[] | undefined)[]
  readonly hasFlatSource: boolean
  readonly hasRbacSource: boolean
  readonly rbacResidual: AccessControl.IPolicy | null
  readonly residualPolicies: readonly AccessControl.IPolicy[]
}
```

| Field | What it holds |
| --- | --- |
| `nResources` | Row stride for the index arithmetic. |
| `actionId` / `resourceId` | Name to index for each dimension. A name absent here has no cell. |
| `roleId` | Role name to bit position. Bounded at 32 entries. |
| `policyCombine` | Copied from the engine config; drives the final cross-source fold. |
| `scopeMode` | Copied from the engine config. A role permission's declared scope is stored literally on `RbacRuleGroup` and matched at lookup, so the table has to carry the mode that match runs under. |
| `kind` | `CellKind` per cell. ABAC only. |
| `touched` | `1` when some flat ABAC policy has a rule shaped for this cell. ABAC only. |
| `allow` | RBAC grant bitmask per cell, inheritance already folded in. Read only by the RBAC vote. |
| `dynamic` | Per-cell `DynamicPolicyGroup[]`, valid when `kind === DYNAMIC`. |
| `rbacDynamic` | Per-cell `RbacRuleGroup[]` for scoped or conditioned role permissions. |
| `hasFlatSource` | Any flat ABAC policy exists at all. |
| `hasRbacSource` | Any role contributes any permission - simple, dynamic or residual. |
| `rbacResidual` | Synthetic policy holding only wildcarded role permissions, or `null`. |
| `residualPolicies` | ABAC policies excluded from the flat model. Never includes `rbacResidual`. |

The two group shapes:

```ts
interface DynamicPolicyGroup {
  readonly policyId: string
  readonly algorithm: AccessControl.CombiningAlgorithm
  readonly rules: readonly AccessControl.IRule[]
  readonly policy: AccessControl.IPolicy
  /** Subject must hold one of these for the group to vote. undefined applies to everyone. */
  readonly targetRoles?: readonly string[]
}

interface RbacRuleGroup {
  readonly roleMask: number
  readonly scope?: string
  readonly conditions?: AccessControl.IConditionGroup
  readonly policy: AccessControl.IPolicy
}
```

`policy` on both exists purely so a rotten rule can be attributed through `onPolicyError`. The one on `RbacRuleGroup` is a synthetic source policy shared by every RBAC group and is never evaluated directly.

### A real table

One role - `editor`, with permission `update` on `post` - and one ABAC policy, `ownership`, allowing `read` on `post` when the subject owns the resource:

```
{
  nResources: 1,
  actionId: Map(2) { 'update' => 0, 'read' => 1 },
  resourceId: Map(1) { 'post' => 0 },
  roleId: Map(1) { 'editor' => 0 },
  policyCombine: 'and',
  scopeMode: 'flat',
  kind: Uint8Array(2) [ 0, 2 ],
  touched: Uint8Array(2) [ 0, 1 ],
  allow: Uint32Array(2) [ 1, 0 ],
  dynamic: [ <1 empty item>, [ { policyId: 'ownership', algorithm: 'deny-overrides', ... } ] ],
  rbacDynamic: [ <2 empty items> ],
  hasFlatSource: true,
  hasRbacSource: true,
  rbacResidual: null,
  residualPolicies: []
}
```

`nResources` is 1, so `idx` equals the action index.

| `idx` | Cell | `touched` | `kind` | `allow` | Reading |
| --- | --- | --- | --- | --- | --- |
| 0 | update / post | `0` | `0` | `1` | No ABAC policy touches this cell, so `touched` is `0` and the `kind` value is only the array's zero default - never read, because `touched` is checked first. The real answer comes from `allow = 1`: bit 0 is `editor`. |
| 1 | read / post | `1` | `2` | `0` | `ownership` has a condition, so the cell cannot be constant. `dynamic[1]` holds the group evaluated per request. No role grants `read`/`post`, so `allow` is `0` and the verdict here is entirely ABAC. |

## Request time

Three sources vote. Each can **abstain** - return no vote at all - and abstaining is different from voting deny. Only non-abstaining votes are collected, and the final fold is `some` when `policyCombine` is `'allow-overrides'` and `every` otherwise. If nothing voted, the verdict is `defaultEffect`, and when that produces an allow the engine raises the `failOpen` signal that surfaces in `onMetrics`.

### The ABAC flat vote

Abstains when the table has no flat ABAC source, when the action or resource is outside the cell universe, when `touched[idx]` is `0`, or when every policy group at a `DYNAMIC` cell threw. Otherwise `CONST_ALLOW` is `true`, `CONST_DENY` is `false`, and a `DYNAMIC` cell runs its groups.

Inside a `DYNAMIC` cell, each group is one policy. A group whose `targetRoles` the subject does not hold is skipped entirely - not counted as a deny. Surviving groups filter their rules by condition, fold them with the **policy's own** combining algorithm, and contribute one boolean. Those per-policy booleans are then folded with `policyCombine`. A group that throws is reported through `onPolicyError` and dropped; if every group threw, the cell abstains rather than fail-closing the whole request.

### The RBAC vote

`allow`, `rbacDynamic` and `rbacResidual` are three ways of storing the same
logical RBAC grant. They are OR'd inside a single `rbacVote()` call. Treating
them as independent voters would let an `'and'`-combined table double-count
RBAC, and would let a source with nothing to say veto every request the others
do grant.

Order of consultation:

1. If there is no RBAC source at all, abstain.
2. `mask & allow[idx]` non-zero - allowed. The common case, and it short-circuits before anything else runs.
3. Otherwise scan `rbacDynamic[idx]`: skip a group whose `roleMask` the subject does not intersect, skip one whose declared `scope` does not cover `req.scope` under `table.scopeMode`, skip one whose conditions fail. The first surviving group allows - role permissions are allow-only, so first match wins.
4. Otherwise evaluate `rbacResidual` if present. A non-null result is the vote.
5. Otherwise: if any role anywhere grants this exact cell - a non-zero `allow` value, or a group with a non-zero `roleMask` - the miss is a real "not this subject's roles", so the vote is `defaultEffect`. If nothing grants this cell at all, abstain. A group whose `roleMask` is `0` is excluded on purpose: it can only come from a duplicate role id whose shadowed definition still produced groups, so nobody can ever hold it. Counting it made the table cast a `defaultEffect` vote at a cell RBAC is genuinely NotApplicable for - an availability bug under `'deny'`, a fail-open allow under `'allow'`.

Step 5 is the distinction between "no" and "nobody is talking about this", and it is the same distinction the interpreter draws with NotApplicable.

Error handling differs by source, deliberately.

In the `rbacDynamic` scan the catch is **per group**, not around the loop. Those groups are independent grants from separate roles that only look like one policy because the compiler folds them into a single allow-only `__rbac__`. Wrapping the whole loop let one unreadable permission delete every unrelated grant in the cell, so the table denied what the interpreter allowed. Abstaining per grant is safe here precisely because role permissions are allow-only - there is no deny to lose - and a scan where every grant abstained still falls through to step 5 rather than vanishing.

A throw from `rbacResidual` follows the Indeterminate contract instead: the deny check is asked of the whole policy, so it denies if `rbacResidual` carries any deny rule and otherwise casts the `defaultEffect` vote. A throw in one ABAC policy group only drops that group.

### Residual policies

Each residual policy is evaluated per request with `evaluatePolicyFast`, the same function development mode uses internally. A `null` result means the policy was not applicable and casts no vote. A throw is reported through `onPolicyError` and the policy is skipped - one rotten policy never fails the request closed on its own.

The fail-skip contract is pinned by a four-path test matrix covering a throw in an ABAC dynamic cell, in the RBAC residual, in the residual-policy loop and in the `rbacDynamic` scan, each crossed with "another source voted" and "nothing else voted", under both `defaultEffect` settings. The invariant in every case: a throw abstains, it never vetoes.

### Wildcard buckets

Residual policies and `rbacResidual` are where real matching still happens, and `indexPolicy` keeps that cheap by bucketing rules on whichever side is still literal instead of scanning all wildcard rules on every request.

A request scans the buckets its own action and resource key into, plus `wildcardBoth`. Cost goes from "every wildcard rule in the policy, unconditionally" to "the matching buckets plus `wildcardBoth`". The worst case, where every rule wildcards both sides, degrades back to the old behaviour and is never worse.

A literal hit never lets a request skip `wildcardBoth`: combining algorithms need every rule that could apply, and a wildcard rule's effect can outrank a literal match's. Only the two *targeted* buckets are skipped when their key misses.

Development's interpreter uses the same index, so this optimisation lifted both paths.

## Lifecycle

The table is built lazily on the first `authorize()` or `permissions()` call - in either mode - from the current roles and the **raw** adapter policies, deliberately not the RBAC-merged view. `compileTable` derives its own RBAC representation from the roles, so feeding it a pre-merged `__rbac__` policy would double-count every role grant. The compiler itself is pulled in with a dynamic `import()`, so the bake lands in its own chunk.

It also expires on its own: `Date.now() - builtAt >= cacheTTL`, where `builtAt` is stamped at **the moment the table's oldest input was read**, not at `Date.now()`. Without an invalidator wired - the default - that TTL is the only convergence window for a write another process made against the same store. At `cacheTTL: 0` the table is rebuilt on every request, which re-reads `listRoles` and `listPolicies` and re-runs `compileTable` each time: correct, and very slow.

Every invalidation - `invalidate`, `invalidatePolicies`, `invalidateRoles`, or any of them arriving from a peer via the invalidator - drops the table and bumps a generation counter. `invalidateSubject` does not, because no subject data is compiled in.

Rebuilds are single-flighted per generation. Concurrent cold callers share one build; a caller arriving after a later invalidation never receives the older generation's in-flight promise, and a build that finishes after its generation was superseded still returns its table to its own awaiters but does not commit it to the field - an invalidation that landed mid-build must win. `engine.preload()` warms the table alongside the merged policy cache, in both modes.

A compile failure that is not the role limit denies every request until it is fixed. `IamPolicyCompileError` - raised by the pre-pass that checks `rules`, `actions` and `resources` really are arrays, which is exactly the claim that does not survive a policy arriving from a database row - is forwarded to `onPolicyError` with its `policyId` and rethrown. Anything else gets one `console.error` saying every request will be denied until this is fixed, and is rethrown. The role-limit path deliberately emits neither: that message would send an operator hunting an outage that is not happening.

## Gotchas

* **`touched` is ABAC-only.** A cell granted only by a role has `touched = 0` and a `kind` byte of `0`, which looks like `CONST_DENY` in a debugger and is never read.
* **One wildcard rule makes a whole policy residual.** Splitting a policy so the wildcard rules live in their own policy keeps the rest on the fast path.
* **A literal `targets.actions` / `targets.resources` compiles in; a wildcarded one does not.** `targets.roles` always compiles in and gates the vote at request time.
* **Abstaining is not denying.** Under `policyCombine: 'and'`, a source that abstains does not veto; a source that votes `false` does. This is the single most common source of surprise when comparing a production verdict to intuition.
* **There are two scopes and `scopeMode` governs both.** Subject-level scoped grants collapse into role bits before the lookup; permission-level scope is matched inside the table by `scopeCovers`, which honours `'*'` and, under `'hierarchical'`, descendants.
* **The 32-role limit is a JavaScript semantics wall, not a tuning knob.** There is no option to raise it and no mode that escapes it. Past 32 the engine keeps answering correctly on the interpreter and tells you so through `healthCheck()`.

## See also

* [Development vs production mode](/duck-iam/advanced/engine/modes)
* [Engine overview](/duck-iam/advanced/engine)
* [Cross-policy combining](/duck-iam/core/cross-policy)
* [Rule matching](/duck-iam/core/rule-matching)
* [Policy targets](/duck-iam/core/policies/targets)
* [Roles to policy](/duck-iam/core/roles/roles-to-policy)