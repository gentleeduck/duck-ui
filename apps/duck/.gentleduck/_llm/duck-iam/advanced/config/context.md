Without a `context`, the condition builders accept any string as a field path and `IamPrimitives.AttributeValue` as a value. Declaring one flips both sides to your application's real shapes: `attr()`, `resourceAttr()`, `env()`, `check()`, `eq()`, `neq()`, and `in()` all autocomplete their keys and narrow their values. The runtime is unchanged - this is entirely a compile-time gain.

## Declaring a context

```ts
import { createIam, type DotPath } from '@gentleduck/iam'

interface AppContext extends DotPath.IDefaultContext {
  subject: {
    id: string
    roles: string[]
    attributes: {
      status: 'active' | 'banned' | 'suspended'
      department: string
    }
  }
  resource: {
    type: 'post' | 'comment' | 'user'
    id?: string
    attributes: {
      ownerId: string
      status: 'draft' | 'published' | 'archived'
    }
  }
  environment: {
    hour: number
    dayOfWeek: number
    maintenanceMode: boolean
  }
  scope: string
}

const access = createIam({
  actions: ['create', 'read', 'update', 'delete'] as const,
  resources: ['post', 'comment', 'user'] as const,
  roles: ['viewer', 'editor', 'admin'] as const,
  context: {} as unknown as AppContext,
})
```

`context` is a phantom field. `createIam` never reads it - it exists only so TypeScript can infer `TContext` from an argument position. `{} as unknown as AppContext` is the idiom the package's own JSDoc uses. If your codebase bans assertions, annotate the input object instead and pass it in:

```ts
import { createIam, type IamConfig } from '@gentleduck/iam'

const input: IamConfig.IAccessConfigInput<
  readonly ['create', 'read', 'update', 'delete'],
  readonly ['post', 'comment', 'user'],
  readonly ['viewer', 'editor', 'admin'],
  readonly string[],
  AppContext
> = {
  actions: ['create', 'read', 'update', 'delete'],
  resources: ['post', 'comment', 'user'],
  roles: ['viewer', 'editor', 'admin'],
}

const access = createIam(input)
```

Now every builder reached through `access` is typed:

```ts
access
  .definePolicy('banned-users')
  .rule('block-banned', (r) =>
    // 'status' autocompletes from subject.attributes;
    // the value is constrained to 'active' | 'banned' | 'suspended'
    r.deny().on('*').of('*').when((w) => w.attr('status', 'eq', 'banned')),
  )
  .build()

access
  .definePolicy('maintenance')
  .rule('deny-writes', (r) =>
    // 'maintenanceMode' autocompletes from environment; the value must be boolean
    r.deny().on('create', 'update', 'delete').of('*').when((w) => w.env('maintenanceMode', 'eq', true)),
  )
  .build()
```

## How dot-path.ts derives the paths

`DotPath.DotPaths

The compile-time assertions in `src/core/types/__tests__/types.test.ts` pin every branch:

| Input | `DotPaths` result | Rule |
|---|---|---|
| `{ a: { b: string }; c: number }` | `'a' \| 'a.b' \| 'c'` | Objects emit themselves and recurse |
| `{ roles: string[] }` | `'roles'` | Arrays are leaves, never indexed |
| `{ fn: () => void; a: string }` | `'a'` | Functions are skipped entirely |
| `Record

`.of()` is the pivot. Its signature is `of<R extends TResource | '*'>(...resources: R[]): RuleBuilder<TAction, TResource, TScope, TRole, TContext, R>` - it returns a *new* builder type whose sixth parameter is the resource you named, and the `when` callback hands you a `When` carrying that same parameter. `DotPath.ResolvedResourceAttrs` then picks the matching entry out of `resourceAttributes`; for `'*'` (and for any resource not in the map) it falls back to `MergedResourceAttrs`, which collects every key declared on any resource and unions each key's value types.

A `When` created directly by `access.when()` has no active resource, so it sees the merged shape. That is the trade-off for reusable condition groups.

## The type helpers, one line each

| Type | Purpose |
|---|---|
| `DotPath.DotPaths<T>` | Every literal path through `T`; arrays are leaves, functions skipped, index signatures give `never` |
| `DotPath.FlexibleDotPaths<T>` | `DotPaths<T>` for closed contexts; adds `(string & {})` when any branch has an open bag |
| `DotPath.PathValue<T, P>` | The value type at path `P`, or `never` |
| `DotPath.FieldValue<T, P>` | `PathValue` wrapped in `ConditionValue`, falling back to `AttributeValue` on a miss |
| `DotPath.ConditionValue<T, V>` | Passes non-string values through unchanged; adds `$`-paths to the string-capable half |
| `DotPath.FlexibleDollarPaths<T>` | `DollarPaths<T> \| (string & {})`, spliced into each method signature so the IDE lists the literals |
| `DotPath.SubjectAttrShape<T>` | `T['subject']['attributes']` |
| `DotPath.ResourceAttrShape<T>` | `T['resource']['attributes']` |
| `DotPath.EnvAttrShape<T>` | `T['environment']` |
| `DotPath.SubjectAttrs<T>` | Keys for `attr()` |
| `DotPath.ResourceAttrs<T>` | Keys for `resourceAttr()` when no per-resource map exists |
| `DotPath.EnvAttrs<T>` | Keys for `env()` |
| `DotPath.ResourceAttrMap<T>` | `T['resourceAttributes']`, or `never` |
| `DotPath.ResolvedResourceAttrs<T, R>` | The attribute shape for resource `R`; merged union for `'*'` |
| `DotPath.ResolvedResourceAttrPaths<T, R>` | Keys for `resourceAttr()` under an active resource |
| `DotPath.AttrValueAt<T, P>` | Raw value at `P` inside a bag; `never` on a miss |
| `DotPath.AttrValue<T, P>` | `AttrValueAt` with `undefined` stripped |
| `DotPath.IAnyAttributes` | The open attribute bag marker |
| `DotPath.IDefaultContext` | The default context, open bags and all |

## Gotchas

* **Value autocomplete is only as narrow as your types.** A field typed `string` can only offer broad string input plus `$`-references. Narrow the attributes you care about to literal unions and the value side narrows with them.
* **An open bag anywhere loosens every path.** `HasOpenIndex` recurses through the whole context; one `Record<string, unknown>` deep inside re-enables arbitrary strings for `check()` across the board.
* **Extending `IDefaultContext` inherits its open bags for anything you do not override.** Override `subject`, `resource`, and `environment` wholesale rather than partially if you want a fully closed context.
* **`resourceAttr()` on `access.when()` sees the merged shape.** A key that exists on only one resource still compiles there; the narrowing only happens under `.of()` or `grantWhen`.

## See also

* [Typed $-references](/duck-iam/advanced/config/dollar-paths) - the value side of the same machinery.
* [Conditions](/duck-iam/core/policies/conditions) - every operator and its edge semantics.
* [createIam()](/duck-iam/advanced/config/access-config) - where `context` is declared.
* [Types and namespaces](/duck-iam/types) - the full `DotPath` member list.