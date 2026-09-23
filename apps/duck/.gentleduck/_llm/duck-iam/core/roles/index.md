A role is a named bag of action/resource permissions with optional inheritance and an optional scope. duck-iam has no separate RBAC engine: `rolesToPolicy()` converts every role into ABAC rules that run through the same pipeline as hand-written policies, so roles and policies compose. This page is the map of the roles section and the reference for the two data shapes every other page builds on.

## What a role is

```ts
import { defineRole } from '@gentleduck/iam'

const viewer = defineRole('viewer')
  .name('Viewer')
  .desc('Read-only access to published content')
  .grant('read', 'post')
  .grant('read', 'comment')
  .build()
```

`defineRole(id)` returns a `RoleBuilder`. `.build()` validates and returns a plain `AccessControl.IRole` - a JSON record with no methods, no engine reference, and nothing to serialise around. Store it with `engine.admin.saveRole(role)` or write it straight into an adapter.

## When to use / When not to use

Use a role when the answer to "may this subject do this?" is a property of **who the subject is**. Use a [policy](/duck-iam/core/policies) when it is a property of the request: time, network, feature flag, or a relationship between two attributes that no role can encode.

* **Role** - "editors may update posts", "auditors may read everything", "org admins manage billing in their org".
* **Role with a condition** - "authors may update posts they own". The ownership check belongs to the role's meaning, so it goes on the role via [`grantWhen()`](/duck-iam/core/roles/conditional).
* **Policy** - "nobody writes during maintenance mode", "deny requests from untrusted IPs", "block this specific subject". These span roles and have their own lifecycle.

Roles are additive by construction: the generated policy uses `allow-overrides`, so adding a role can only grant more. Nothing in the role model can take a permission away. To subtract, write a deny rule in a separate policy - see [combining algorithms](/duck-iam/core/policies/combining-algorithms) and [cross-policy combining](/duck-iam/core/cross-policy).

## The two shapes

Copied from `src/core/types/access-control.ts`:

```ts
interface AccessControl.IRole<
  TAction extends string = string,
  TResource extends string = string,
  TId extends string = string,
  TScope extends string = string,
> {
  readonly id: TId
  readonly name: string
  readonly description?: string
  readonly permissions: readonly IPermission<TAction, TResource, TScope>[]
  /** Parent role IDs to inherit permissions from (resolved recursively). */
  readonly inherits?: readonly string[]
  /** Default scope applied to all permissions in this role. */
  readonly scope?: TScope
  readonly metadata?: Readonly<IamPrimitives.Attributes>
}

interface AccessControl.IPermission<
  TAction extends string = string,
  TResource extends string = string,
  TScope extends string = string,
> {
  readonly action: TAction | '*'
  readonly resource: TResource | '*'
  readonly scope?: TScope | '*'
  readonly conditions?: IConditionGroup
}
```

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `id` | `string` | none, required | Unique role ID. Referenced by `inherits`, by assignments, and by the `subject.roles contains "

* `B` and `C` are the conversion documented on [the rolesToPolicy conversion](/duck-iam/core/roles/roles-to-policy). Every permission becomes one allow rule gated by `subject.roles contains "

| Page | Covers |
| --- | --- |
| [Defining roles](/duck-iam/core/roles/definition) | Every `RoleBuilder` method with its signature, what `build()` validates and throws, metadata, empty roles |
| [Role inheritance](/duck-iam/core/roles/inheritance) | `inherits()`, multi-parent and diamond graphs, cycle handling, the depth-32 traversal bound and where `getEffectiveRoles()` and `can()` diverge past it |
| [Type-safe roles](/duck-iam/core/roles/type-safe) | `createIam()`, how `TAction` / `TResource` / `TRole` / `TScope` / `TContext` flow, per-resource attribute narrowing |
| [Scoped roles](/duck-iam/core/roles/scoped) | Role-level scope, permission-level scope, scoped assignments, and how a scope is matched at request time |
| [Conditional permissions](/duck-iam/core/roles/conditional) | `grantWhen()`, how its conditions merge into the generated rule, and when a standalone policy is the better tool |
| [The rolesToPolicy conversion](/duck-iam/core/roles/roles-to-policy) | The conversion algorithm with a real dumped `__rbac__` policy, rule id stability, cache invalidation |

## Gotchas

`rolesToPolicy()` only emits `allow` rules and the generated policy uses `allow-overrides`. There is no "negative permission" and inherited permissions cannot be removed. Restriction is a job for a deny rule in a separate policy.

* `defineRole('x').build()` throws if the role fails `validateRole()`. Structural problems that only appear across a set of roles (duplicate IDs, dangling `inherits`, cycles, chains past the depth-32 traversal bound) are found by `validateRoles(roles)`, which you call yourself. See [validation](/duck-iam/advanced/validation).
* `role.metadata` is inert. Nothing in the evaluator reads it; only `permissions`, `inherits`, and `scope` affect decisions.
* Role IDs appear verbatim inside generated rule conditions. Renaming a role means re-saving every role that inherits it and re-issuing every assignment that names it.

## See also

* [Policies overview](/duck-iam/core/policies) - the ABAC half of the model
* [Rule matching](/duck-iam/core/rule-matching) - how `'*'`, `'posts:*'`, and `'dashboard.*'` patterns match
* [Evaluation pipeline](/duck-iam/core/evaluation) - the full request lifecycle
* [Engine admin API](/duck-iam/advanced/engine/admin) - `saveRole`, `assignRole`, `revokeRole`, `export` / `import`