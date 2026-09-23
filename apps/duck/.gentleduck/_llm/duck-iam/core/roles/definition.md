`defineRole(id)` returns a `RoleBuilder`. Every method returns `this`, and `build()` produces a plain `AccessControl.IRole`. This page is the API reference for that builder: each signature is copied from `src/core/builder/role.ts`, with the defaults and the failure modes.

## The builder in one call chain

```ts
import { defineRole } from '@gentleduck/iam'

const editor = defineRole('editor')
  .name('Editor')
  .desc('Full write access to posts and comments')
  .inherits('viewer')
  .grant('create', 'post')
  .grant('update', 'post')
  .grant('delete', 'post')
  .grantCRUD('comment')
  .meta({ tier: 'staff' })
  .build()
```

Each call sets one field of the built role. The diagram maps builder methods to the `IRole` fields they write.

`ID`, `NAME`, `DESC`, and `META` never affect a decision. `PERMS`, `INH`, and `SCOPE` are the three fields [`rolesToPolicy()`](/duck-iam/core/roles/roles-to-policy) reads.

## API reference

### defineRole()

```ts
const defineRole: <
  const TRole extends string,
  const TAction extends string = string,
  const TResource extends string = string,
  const TScope extends string = string,
  TContext extends object = DotPath.IDefaultContext,
>(id: TRole) => RoleBuilder<TAction, TResource, TRole, TScope, TContext>
```

The `const` modifier on `TRole` preserves the literal type of the ID, so `defineRole('viewer')` is typed to `'viewer'` and not widened to `string`. For builders constrained to your declared actions, resources, roles, and scopes, use `access.defineRole()` from [`createIam()`](/duck-iam/core/roles/type-safe) instead of importing `defineRole` directly.

`RoleBuilder` is also exported and can be constructed directly (`new RoleBuilder('viewer')`); `defineRole` is the preferred spelling because it infers `TRole` for you.

### Identity and documentation

| Method | Signature | Effect |
| --- | --- | --- |
| `name` | `name(n: string): this` | Sets `role.name`. Defaults to the role ID when never called. Used in admin dashboards, audit logs, and as the prefix of each generated rule's `description`. |
| `desc` | `desc(d: string): this` | Sets `role.description`. Documentation only. |
| `meta` | `meta(m: IamPrimitives.Attributes): this` | Replaces `role.metadata`. Never consulted during evaluation. |

```ts
const beta = defineRole('beta-tester')
  .name('Beta Tester')
  .desc('Early access to unreleased features')
  .meta({ createdBy: 'system', maxSeats: 10, tier: 'beta' })
  .grant('read', 'beta-feature')
  .build()

console.log(beta.metadata) // { createdBy: 'system', maxSeats: 10, tier: 'beta' }
```

Metadata round-trips through every shipped adapter - memory, file, Redis, Prisma, and Drizzle each persist it as JSON. See [adapters](/duck-iam/integrations/adapters/comparison).

### inherits()

```ts
inherits(...roleIds: (TRole | (string & {}))[]): this
```

Declares parent roles. The union with `(string & {})` keeps autocomplete for declared role IDs while still accepting an ID that only exists in the database. `inherits` is left `undefined` on the built role when the method is never called, and only becomes an array when at least one parent was passed.

Each call overwrites the previous parent list. `defineRole('editor').inherits('viewer').inherits('commenter', 'reporter')` builds a role whose parents are `['commenter', 'reporter']` - `viewer` is gone. Pass every parent in one call. Pinned by the test "inherits() replaces rather than appends across calls".

Semantics, cycles, and the depth cap are on [role inheritance](/duck-iam/core/roles/inheritance).

### scope()

```ts
scope(s: TScope): this
```

Sets a default scope for **every** permission in the role. At conversion time each generated rule gains a `scope eq "

`V` is automatic; `VR` is not. `engine.admin.saveRole()` re-runs `validateRole()` on the write path, so a role assembled by hand rather than by the builder is still checked before it reaches storage.

## Empty roles

A role with no permissions builds successfully:

```ts
const placeholder = defineRole('placeholder').name('Placeholder').build()
// { id: 'placeholder', name: 'Placeholder', permissions: [] }
```

It grants nothing and contributes no rules to the generated policy. `validateRoles()` reports it as the warning `EMPTY_ROLE` - "Role "placeholder" has no permissions and no inheritance" - only when it also has no parents, because a role that exists purely to inherit is a legitimate alias. Warnings do not flip `result.valid` to `false`.

## Gotchas

* `build()` copies the builder's arrays, so a builder kept alive after a build can no longer push into a role that has already been validated and registered:

  ```ts
  const b = defineRole('x').grant('read', 'post')
  const role = b.build()
  b.grant('update', 'post')
  role.permissions.length // 1
  ```

* Optional fields are **absent**, not `undefined`. `description`, `inherits`, `scope` and `metadata` are spread in conditionally, so `'scope' in role` is `false` on a role that never called `.scope()`. This matters because the memory, file and http stores keep the caller's own object while a `jsonb` column or a `JSON.stringify` round trip drops an `undefined` key - a role holding the key read back unequal from two adapters.

* `name` silently defaults to the ID. Generated rule descriptions read `"<name>: <action> on <resource>"`, so unnamed roles produce descriptions like `"editor: update on post"` in [explain traces](/duck-iam/advanced/explain).

* `meta()` replaces the whole metadata bag; there is no merge. Build the object once and pass it in a single call.

## See also

* [Role inheritance](/duck-iam/core/roles/inheritance) - what `inherits()` actually resolves to
* [Conditional permissions](/duck-iam/core/roles/conditional) - the `grantWhen()` callback in depth
* [Scoped roles](/duck-iam/core/roles/scoped) - `scope()` versus `grantScoped()`
* [Building policies](/duck-iam/core/policies/building) - the sibling builder for ABAC policies