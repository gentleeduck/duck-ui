The object `createIam()` returns has eight methods. Four construct builders, one constructs an engine, one is a compile-time identity function, and two run runtime validation. Every signature below is copied from `IamConfig.IAccessConfig` in `src/core/config/config.types.ts`.

## The surface at a glance

`When` is reachable three ways - directly through `access.when()`, inside a rule's `when` / `whenAny` callback, and inside a role's `grantWhen` callback. Only the last two narrow the resource, which is what makes `resourceAttr()` autocomplete per resource; the standalone `access.when()` sees every resource's attributes merged.

## API reference

### `access.defineRole()`

```ts
defineRole: (id: TRole) => RoleBuilder<TAction, TResource, TRole, TScope, TContext>
```

Constructs a typed `RoleBuilder`. When `roles` was declared, `id` is constrained to that union; otherwise it accepts any string. Actions, resources, and scopes on `grant` / `grantWhen` are constrained to the config's unions either way.

```ts
const viewer = access
  .defineRole('viewer')
  .grant('read', 'post')
  .grant('read', 'comment')
  .build()

const editor = access
  .defineRole('editor')
  .inherits('viewer')
  .grant('create', 'post')
  .grant('update', 'post')
  .build()

const orgEditor = access
  .defineRole('editor')
  .scope('org-1')
  .grant('update', 'post')
  .build()
// orgEditor.scope === 'org-1'
```

`access.defineRole('intern')` is a compile error when `intern` is not in `roles`; `grant('read', 'invoice')` is a compile error when `invoice` is not in `resources`. The full builder API is on [role definition](/duck-iam/core/roles/definition).

### `access.definePolicy()`

```ts
definePolicy: (id: string) => PolicyBuilder<TAction, TResource, TRole, TScope, TContext>
```

Constructs a typed `PolicyBuilder`. The policy `id` is a free string - only the rules inside are constrained. Chain `name()`, `description()`, `version()`, `algorithm()`, `targets()`, `rule()`, and `addRule()`, then `build()`.

```ts
const ownerPolicy = access
  .definePolicy('owner-only')
  .name('Owner Only')
  .algorithm('deny-overrides')
  .rule('owner-update', (r) =>
    r.allow().on('update').of('post').priority(10).when((w) => w.isOwner()),
  )
  .rule('deny-non-owner-delete', (r) =>
    r
      .deny()
      .on('delete')
      .of('post')
      .priority(20)
      .when((w) => w.resourceAttr('ownerId', 'neq', '$subject.id')),
  )
  .build()
```

The full builder API is on [building policies](/duck-iam/core/policies/building).

### `access.defineRule()`

```ts
defineRule: (id: string) => RuleBuilder<TAction, TResource, TScope, TRole, TContext>
```

Constructs a standalone typed `RuleBuilder` for rules you want to share across policies. Note the parameter order: `TScope` comes before `TRole` here, unlike every other builder. The factory supplies them correctly, so this only matters if you write the annotation yourself.

```ts
const ownerRule = access
  .defineRule('owner-check')
  .allow()
  .on('update', 'delete')
  .of('post')
  .priority(10)
  .when((w) => w.isOwner())
  .build()

const p = access
  .definePolicy('my-policy')
  .name('My Policy')
  .algorithm('deny-overrides')
  .addRule(ownerRule)
  .build()
```

`.of(...)` returns a rule builder narrowed to the resources you named, and that narrowing is what `resourceAttr()` reads inside `when()`. See [rules](/duck-iam/core/policies/rules).

### `access.when()`

```ts
when: () => When<TAction, TResource, TRole, TScope, TContext>
```

Constructs a typed `When` for reusable condition groups. Finish with `buildAll()`, `buildAny()`, or `buildNone()` to get an `AccessControl.IConditionGroup`.

```ts
const isOwner = access.when().isOwner().buildAll()
// { all: [{ field: 'resource.attributes.ownerId', operator: 'eq', value: '$subject.id' }] }

const isAdmin = access.when().role('admin').buildAll()
// { all: [{ field: 'subject.roles', operator: 'contains', value: 'admin' }] }

const isAdminOrOwner = access.when().role('admin').isOwner().buildAny()
// { any: [ ...the two conditions above... ] }
```

`role(id)` and `roles(...ids)` are constrained to `TRole`; `scope(id)` and `scopes(...ids)` to `TScope`. `role()` emits `contains` against `subject.roles`; `roles()` emits `in`. The condition operator table is on [conditions](/duck-iam/core/policies/conditions).

### `access.createEngine()`

```ts
createEngine: <TMode extends AccessControl.Mode = 'production'>(
  config: IamEngineTypes.IConfig<TAction, TResource, TRole, TScope, TMode>,
) => IamEngine<TAction, TResource, TRole, TScope, TMode>
```

Constructs a typed engine. `TMode` defaults to `'production'`, which is what decides whether `check` / `authorize` return `AccessControl.IDecision` objects or plain booleans. `can` always returns a boolean.

`TMode` is not inferred from `config.mode`, because `mode` is optional on `IConfig`: passing `mode: 'development'` gives you a development engine typed as production, and naming `'development'` in the type arguments without passing `mode` gives you the reverse - a production engine typed as development, whose `.allowed` reads `undefined`. Pass both, or neither.

```ts
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'

const adapter = new IamMemoryAdapter<
  'create' | 'read' | 'update' | 'delete' | 'manage',
  'post' | 'comment' | 'user' | 'dashboard',
  'viewer' | 'editor' | 'admin',
  'org-1' | 'org-2'
>({
  roles: [viewer, editor],
  assignments: { 'user-1': ['editor'] },
  policies: [ownerPolicy],
})

const engine = access.createEngine<'development'>({ adapter, mode: 'development' })
const prodEngine = access.createEngine({ adapter })   // production, the default

await engine.can('user-1', 'read', { type: 'post', attributes: {} })
// await engine.can('user-1', 'approve', ...)  // compile error: 'approve' is not an action
// await engine.can('user-1', 'read', { type: 'invoice', attributes: {} })  // compile error
```

Only `adapter` is required in `IamEngineTypes.IConfig`; everything else has a default. The full option table is on [engine methods](/duck-iam/advanced/engine/methods) and the mode trade-off on [engine modes](/duck-iam/advanced/engine/modes).

### `access.checks()`

```ts
checks: <const T extends readonly IamClient.IPermissionCheck<TAction, TResource, TScope>[]>(
  checks: T,
) => T
```

Returns the array it was given, unchanged and by reference - the `checks() returns the exact input array unchanged` test asserts `toBe(input)`. Its only job is to make TypeScript check every `action`, `resource`, and `scope` in the batch before you hand it to `engine.permissions()`.

```ts
const uiChecks = access.checks([
  { action: 'create', resource: 'post' },
  { action: 'update', resource: 'post', resourceId: 'post-1' },
  { action: 'manage', resource: 'dashboard', scope: 'org-1' },
])

const perms = await engine.permissions('user-1', uiChecks)
// { 'create:post': true, 'update:post:post-1': true, '@org-1:manage:dashboard': false }
```

The returned map is an `IamClient.PartialPermissionMap` - it holds only the keys that were in the batch, and missing keys read as `false` at every consumer. Key layout is on [permission map](/duck-iam/integrations/client/permission-map).

### `access.validateRoles()`

```ts
validateRoles: (roles: readonly AccessControl.IRole[]) => IamValidate.IResult
```

Returns `{ valid, issues }`. `valid` is `false` only when at least one issue is error-level.

The parameter is the **unconstrained** `IRole`, deliberately. A runtime validator exists for data whose type you do not trust - roles read from an adapter, a config file, an admin form - and a signature narrowed to the declared unions could only be handed values already proven correct. Authoring-time safety comes from `defineRole`, which is typed; this is the other half.

Unlike the bare `validateRoles` export, this one is handed the config's declared vocabulary, so it also flags a grant naming an action, resource or scope the config never declared. Such a grant can never match a request - `createIam` constrains `engine.check` to the declared unions, so nothing will ever ask for the pair it answers. It reads as access granted and behaves as access denied.

```ts
const result = access.validateRoles([viewer, editor, admin])

if (!result.valid) {
  const errors = result.issues.filter((i) => i.type === 'error')
  throw new Error(errors.map((i) => `${i.code}: ${i.message}`).join(', '))
}
```

| Situation | Code | Severity |
|---|---|---|
| Two roles share an `id` | `DUPLICATE_ROLE_ID` | error |
| `inherits` names a role that is not in the array | `DANGLING_INHERIT` | error |
| Inheritance forms a cycle | `CIRCULAR_INHERIT` | **warning** - `valid` stays `true` |
| Inheritance chain exceeds `MAX_INHERITANCE_DEPTH` (32) | `INHERITANCE_TOO_DEEP` | error |
| A role has neither permissions nor `inherits` | `EMPTY_ROLE` | warning |
| A grant names an action, resource or scope outside the declared vocabulary | `UNREACHABLE_TARGET` | error - only from `access.validateRoles`, never the bare export |

`'*'` is never reported as undeclared, and an axis the config left empty is skipped entirely rather than rejecting everything on it.

`validateRoles()` reports `CIRCULAR_INHERIT` as a warning, and `result.valid` remains `true`. The `reports circular inheritance as a warning, not an error` test pins this. If a cycle must block a deploy, check `result.issues` for the code yourself rather than trusting `valid`.

### `access.validatePolicy()`

```ts
validatePolicy: (input: unknown) => IamValidate.IResult
```

Deep shape and semantic validation of a policy object from an untrusted source - an admin UI, an external API, a JSON file, a database row. The parameter is `unknown` on purpose: this is the boundary where TypeScript stops helping.

```ts
const raw: unknown = await fetch('/api/policies/123').then((r) => r.json())

const result = access.validatePolicy(raw)
if (!result.valid) {
  for (const issue of result.issues) {
    console.error(issue.code, issue.path, issue.message)
  }
  return
}
```

It checks the required fields (`id`, `name`, `algorithm`, `rules`), that `algorithm` is one of the four combining algorithms, that every rule has a valid `effect`, non-empty `actions` and `resources`, and a well-formed condition group, that every operator is in `VALID_OPERATORS`, that every `field` resolves to an allowed root, and that no `matches` pattern trips the catastrophic-regex heuristic. Structural size caps come from `POLICY_LIMITS`. The full code list is on [validation](/duck-iam/advanced/validation).

## Gotchas

* **`validatePolicy` does not narrow the type.** It returns `{ valid, issues }`, not a type predicate. After a successful validation, use `parsePolicyRow` from `@gentleduck/iam/core/validate` when you need the narrowed value rather than reaching for a cast.
* **Builders are not reusable after `build()`.** Each `access.defineRole(...)` / `access.definePolicy(...)` call returns a fresh instance; do not hold one and build it twice expecting independent results.
* **`checks()` has no runtime effect at all.** If you need the batch validated at runtime - because it came from a client - check the strings yourself; `checks()` is erased by the compiler.

## See also

* [createIam()](/duck-iam/advanced/config/access-config) - the factory and its options.
* [Typed context](/duck-iam/advanced/config/context) - what `when()` autocompletes once `context` is set.
* [Engine methods](/duck-iam/advanced/engine/methods) - what `createEngine()` hands back.
* [Validation](/duck-iam/advanced/validation) - every issue code the two validate methods can emit.