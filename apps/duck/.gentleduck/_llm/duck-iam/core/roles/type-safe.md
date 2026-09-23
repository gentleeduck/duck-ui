`defineRole()` imported from the package root accepts any string for every argument. `createIam()` fixes the action, resource, role, scope, and context types once, and hands back builders that reject anything outside them. This page shows what `createIam()` constrains, how the generics reach `RoleBuilder`, and the four places the compile-time guarantee does not hold.

## createIam()

```ts
import { createIam } from '@gentleduck/iam'

const access = createIam({
  actions: ['create', 'read', 'update', 'delete', 'publish'] as const,
  resources: ['post', 'comment', 'user'] as const,
  scopes: ['org-1', 'org-2'] as const,
  roles: ['viewer', 'editor', 'admin'] as const,
})
```

```ts
function createIam<
  const TActions extends readonly string[],
  const TResources extends readonly string[],
  const TRoles extends readonly string[] = readonly string[],
  const TScopes extends readonly string[] = readonly string[],
  TContext extends object = DotPath.IDefaultContext,
>(
  input: IamConfig.IAccessConfigInput<TActions, TResources, TRoles, TScopes, TContext>,
): IamConfig.IAccessConfig<TActions[number], TResources[number], TRoles[number], TScopes[number], TContext>
```

| Input option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `actions` | `readonly string[]` | required | Every action your app supports. Becomes `TAction`. |
| `resources` | `readonly string[]` | required | Every resource type. Becomes `TResource`. |
| `scopes` | `readonly string[]` | `[]` | Tenant / workspace identifiers. Becomes `TScope`. |
| `roles` | `readonly string[]` | `[]` | Role IDs. Becomes `TRole`. |
| `context` | `object` | `DotPath.IDefaultContext` | Phantom field for dot-path inference. The runtime value is never read - pass `{} as unknown as AppContext`. |

`as const` is what makes this work. Without it TypeScript widens the array to `string[]`, `TActions[number]` collapses to `string`, and every constraint silently disappears. There is no runtime error - the builders just stop rejecting typos.

The returned `IamConfig.IAccessConfig` carries the declared arrays back (`access.actions`, `access.resources`, `access.scopes`, `access.roles` - the last two are `[]` when not declared) plus eight factories: `defineRole`, `definePolicy`, `defineRule`, `when`, `createEngine`, `checks`, `validateRoles`, and `validatePolicy`.

## How the generics reach RoleBuilder

* `IDX` is the whole trick: a tuple declared `as const` indexed by `number` becomes the union of its members.
* `RB` is where the order changes. `createIam` builds `RoleBuilder

`DotPath.IDefaultContext` declares `subject.attributes`, `resource.attributes`, and `environment` as `IAnyAttributes`, which is an index signature - so the default is the `OPEN` branch. Declaring those bags concretely moves you to `CLOSED`, where a mistyped path fails to compile and the operand value is checked against the type at that path. `$`-references are typed the same way through `DotPath.DollarPaths<TContext>`; see [`$`-variable references](/duck-iam/core/policies/dollar-variables) and [typed context](/duck-iam/advanced/config/context).

## Per-resource attribute narrowing

Declare a `resourceAttributes` map on the context and `grantWhen()`'s third argument narrows `w.resourceAttr()` to the attributes of the resource you named:

```ts
const access = createIam({
  actions: ['read', 'update'] as const,
  resources: ['post', 'invoice'] as const,
  context: {} as unknown as {
    subject: { id: string; attributes: { tier: 'free' | 'pro' } }
    resourceAttributes: {
      post: { ownerId: string; status: 'draft' | 'published' }
      invoice: { customerId: string; amount: number }
    }
  },
})

const editor = access
  .defineRole('editor')
  .grantWhen('update', 'post', (w) => w.resourceAttr('status', 'eq', 'draft'))
  //                                     suggestions: 'ownerId' | 'status'
  .grantWhen('update', 'invoice', (w) => w.resourceAttr('amount', 'lt', 1000))
  //                                        suggestions: 'customerId' | 'amount'
  .build()
```

The mechanism is `DotPath.ResolvedResourceAttrPaths<TContext, TActiveResource>`: `grantWhen<R>` captures the resource literal as `R` and passes it to `When` as `TActiveResource`, which looks `R` up in the context's `resourceAttributes` map. `'*'` and any resource with no entry in the map fall back to the generic `resource.attributes` shape. The rule builder does the same through `.of()`; see [rules](/duck-iam/core/policies/rules).

## Validating a role set

The compiler cannot see relationships between roles. Run the validator over the whole set before persisting:

```ts
const roles = [viewer, author, editor, admin]
const result = access.validateRoles(roles)

if (!result.valid) {
  for (const issue of result.issues) {
    if (issue.type === 'error') console.error(`${issue.code} on ${issue.roleId}: ${issue.message}`)
  }
  throw new Error('role set rejected')
}
```

`access.validateRoles()` is `validateRoles()` with the argument typed to your unions. Outside a `createIam()` setup, import it directly - it is **not** re-exported from the package root, because the validator is a separate chunk:

```ts
import { validateRoles } from '@gentleduck/iam/core/validate'
```

The five codes it can emit are tabulated on [role inheritance](/duck-iam/core/roles/inheritance#what-the-validator-catches). `RoleBuilder.build()` already runs the single-role `validateRole()` for you; `validateRoles()` adds everything that needs the whole set.

## Complete example

```ts
import { createIam } from '@gentleduck/iam'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'

const access = createIam({
  actions: ['create', 'read', 'update', 'delete', 'publish', 'archive'] as const,
  resources: ['post', 'comment', 'user', 'settings'] as const,
  scopes: ['org-alpha', 'org-beta'] as const,
  roles: ['viewer', 'author', 'editor', 'org-admin', 'super-admin'] as const,
})

const viewer = access.defineRole('viewer').name('Viewer').grantRead('post', 'comment').build()

const author = access
  .defineRole('author')
  .name('Author')
  .inherits('viewer')
  .grant('create', 'post')
  .grantWhen('update', 'post', (w) => w.isOwner())
  .grantWhen('delete', 'post', (w) => w.isOwner())
  .grant('create', 'comment')
  .build()

const editor = access
  .defineRole('editor')
  .name('Editor')
  .inherits('author')
  .grant('update', 'post')
  .grant('delete', 'post')
  .grant('publish', 'post')
  .grant('archive', 'post')
  .build()

const orgAdmin = access.defineRole('org-admin').name('Organization Admin').inherits('editor').build()

const superAdmin = access.defineRole('super-admin').name('Super Admin').grantAll('*').build()

const roles = [viewer, author, editor, orgAdmin, superAdmin]
if (!access.validateRoles(roles).valid) throw new Error('role set rejected')

const engine = access.createEngine({ adapter: new IamMemoryAdapter(), mode: 'development' })
for (const role of roles) await engine.admin.saveRole(role)
```

`access.createEngine()` returns an `IamEngine` whose `can()`, `authorize()`, and `permissions()` arguments are constrained to the same unions, so a check for an action you never declared is a compile error too. See [engine methods](/duck-iam/advanced/engine/methods).

## See also

* [Defining roles](/duck-iam/core/roles/definition) - the untyped builder these constraints wrap
* [Typed context](/duck-iam/advanced/config/context) - declaring the context shape in full
* [Access config](/duck-iam/advanced/config/access-config) - every member of the object `createIam()` returns
* [Types and namespaces](/duck-iam/types) - `AccessControl`, `DotPath`, `IamConfig`, `IamValidate`