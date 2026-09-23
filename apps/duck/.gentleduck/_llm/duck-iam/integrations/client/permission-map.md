The permission map is the contract between the server and every duck-iam client: the types, the four key formats, the escaping rules, why the map you actually get is *partial*, and how a lookup fails closed. Read [client overview](/duck-iam/integrations/client) first for the surrounding flow.

The map is a snapshot of decisions a server already made, serialised over the wire, sitting in a browser the user controls. Every key in it can be flipped from a devtools console. It decides what to render; the request the button fires must be authorized again on the server, by the engine, against the live policy set.

## The types

Four type aliases live in the `IamClient` namespace, exported from `@gentleduck/iam` and `@gentleduck/iam/core`.

```ts
export namespace IamClient {
  export type PermissionKey<
    TAction extends string = string,
    TResource extends string = string,
    TScope extends string = string,
  > =
    | `${TAction}:${TResource}`
    | `${TAction}:${TResource}:${string}`
    | `@${TScope}:${TAction}:${TResource}`
    | `@${TScope}:${TAction}:${TResource}:${string}`

  export type PermissionMap<
    TAction extends string = string,
    TResource extends string = string,
    TScope extends string = string,
  > = Record<PermissionKey<TAction, TResource, TScope>, boolean>

  export type PartialPermissionMap<
    TAction extends string = string,
    TResource extends string = string,
    TScope extends string = string,
  > = Partial<PermissionMap<TAction, TResource, TScope>>

  export interface IPermissionCheck<
    TAction extends string = string,
    TResource extends string = string,
    TScope extends string = string,
  > {
    readonly action: TAction
    readonly resource: TResource
    readonly resourceId?: string
    readonly scope?: TScope
  }
}
```

| Type | What it is | Where you meet it |
| --- | --- | --- |
| `IamClient.PermissionKey` | Union of the four key template literals | Rarely by hand; the discriminant behind the map |
| `IamClient.PermissionMap` | Total map - every key in the union must be present | The `development`-mode return type of `engine.permissions()` |
| `IamClient.PartialPermissionMap` | `Partial` of the above - only the batched keys | What every client accepts, and what you really hold |
| `IamClient.IPermissionCheck` | One entry of the batch you pass to `engine.permissions()` | Building the batch on the server |

The runtime value in all cases is a flat object of `string` to `boolean`. The generics only shape the type.

## Partial maps are the normal case

`PermissionMap` is a `Record` over the *whole* key union. For `TAction` of four members and `TResource` of three, that is already twelve required keys before any `resourceId` or `scope` appears, and the `resourceId` arms include `${string}`, so the union is effectively infinite. No caller has ever produced such an object.

`PartialPermissionMap` is what `engine.permissions()` returns in substance: only the keys that were in the batch. All three clients take the partial type, so passing a three-key object to a client typed over a large union needs no cast.

```ts
import { IamAccessClient } from '@gentleduck/iam/client/vanilla'

// No cast. 'write:post' was never batched.
const client = new IamAccessClient<'read' | 'write', 'post'>({ 'read:post': true })
client.can('read', 'post') // true
client.can('write', 'post') // false
```

The same holds for React's `AccessProvider`, `usePermissions`, and `createIamPermissionChecker`, and for Vue's `createAccessState`, `provideAccess`, and `createAccessPlugin`. Type-level tests pin all three surfaces to `IamClient.PartialPermissionMap`.

Runtime behaviour never differed from the total type - a missing key already denied - so the partial type is a typing fix, not a behaviour change.

React re-exposes both types under its own namespace so a React-only app does not have to depend on `@gentleduck/iam/core` for a type alias. Note the aliasing: `IamReactClient.PermissionMap` resolves to `IamClient.PartialPermissionMap`, not to the total `IamClient.PermissionMap`.

## The four key formats

Which format a key takes is decided entirely by which optional fields were present when the key was built.

| Shape | Format | Example |
| --- | --- | --- |
| Action and resource | `action:resource` | `create:post` |
| Plus a resource instance | `action:resource:resourceId` | `delete:post:abc123` |
| Plus a scope | `@scope:action:resource` | `@org-1:manage:billing` |
| Both | `@scope:action:resource:resourceId` | `@org-1:update:post:post-42` |

The scope always leads and the resource id always trails, whatever order you passed the arguments in.

**The leading `@` is not decoration.** It is what makes the arity unambiguous. Without it, `('read', 'doc', '42')` and `('doc', '42', undefined, 'read')` both produce `read:doc:42`, so two different checks in one batch share a map entry and one answers for the other. A scoped key is the only one that may start with an unescaped `@`, which is why a leading `@` inside any other segment is escaped.

Both branch tests in the diagram are `!== undefined`, not truthiness. That is load-bearing: an empty-string `scope` is a real, distinct segment, so `scope: ''` yields `@:manage:billing`, which never collides with the unscoped `manage:billing`. The same applies to an empty `resourceId`. If you find yourself passing `''` to mean "no scope", pass `undefined` instead.

## Escaping

A segment is rewritten when it contains a `:` or a `\`: backslashes are doubled first, then colons are prefixed with a backslash. Separately, a segment *starting* with `@` gets one escaping backslash, because that character is the scope marker and a segment posing as one would reintroduce the arity ambiguity.

| Raw segment | Encoded segment |
| --- | --- |
| `post` | `post` |
| `doc:42` | `doc\:42` |
| `a\b` | `a\\b` |
| `a\:b` | `a\\\:b` |
| `@team` | `\@team` |

`iamSplitPermissionKey` reverses it, recognising exactly three escape sequences: `\:`, `\\` and `\@`. Any other backslash pair is left literal, so a crafted `\x` in a key cannot silently become `x`.

```ts
import { iamBuildPermissionKey, iamSplitPermissionKey } from '@gentleduck/iam'

const key = iamBuildPermissionKey('read', 'doc:42')
// 'read:doc\\:42'  (the string read:doc\:42)

iamSplitPermissionKey(key)
// ['read', 'doc:42']
```

Because both sides of the wire use the same pair of functions, a resource id or tenant name containing a colon round-trips correctly. Hand-rolled `key.split(':')` does not - it mis-tokenises `read:doc\:42` into three segments and produces the wrong answer.

## iamBuildPermissionKey

```ts
function iamBuildPermissionKey(
  action: string,
  resource: string,
  resourceId?: string,
  scope?: string,
): string
```

| Parameter | Type | Default | Meaning |
| --- | --- | --- | --- |
| `action` | `string` | required | The action being checked, for example `read` |
| `resource` | `string` | required | The resource type, for example `document` |
| `resourceId` | `string \| undefined` | `undefined` | Pins the key to one instance; omit for a type-level key |
| `scope` | `string \| undefined` | `undefined` | Tenant or namespace prefix; omit for a global key |

Returns the composed key. Never throws. Argument order is `(action, resource, resourceId, scope)`; serialised order is `@scope:action:resource:resourceId`.

Exported from `@gentleduck/iam` alongside `iamSplitPermissionKey` and `iamParsePermissionKey`, and re-exported from `@gentleduck/iam/client/react` and `@gentleduck/iam/client/vue`. The vanilla entry point does **not** re-export it.

```ts
import { iamBuildPermissionKey } from '@gentleduck/iam'

iamBuildPermissionKey('delete', 'post')
// 'delete:post'

iamBuildPermissionKey('delete', 'post', 'post-42')
// 'delete:post:post-42'

iamBuildPermissionKey('manage', 'billing', undefined, 'org-1')
// '@org-1:manage:billing'

iamBuildPermissionKey('update', 'post', 'post-42', 'org-1')
// '@org-1:update:post:post-42'
```

You rarely call it directly - every client calls it internally for you. Reach for it when writing tests that assert a specific key, building a custom permission endpoint, or inspecting a map in devtools.

## Generating a map

```ts
const permissions = await engine.permissions('user-1', [
  { action: 'create', resource: 'post' },
  { action: 'delete', resource: 'post', resourceId: 'post-42' },
  { action: 'manage', resource: 'billing', scope: 'org-1' },
])
```

The result is keyed exactly by the batch, one key per entry, in the format each entry's fields select:

```json
{
  "create:post": true,
  "delete:post:post-42": false,
  "@org-1:manage:billing": true
}
```

Duplicate entries collapse onto the same key, so a batch of ten checks may produce fewer than ten keys.

The static return type depends on engine mode: `production` yields `Record

Nodes D and G are indistinguishable to the caller. `cannot()` cannot tell "denied by policy" from "never asked", and neither can the map - if you need that distinction, keep the batch list alongside the map, or use [explain traces](/duck-iam/advanced/explain) on the server.

The shape of the check must match the shape of the key:

```ts
client.can('create', 'post') // matches 'create:post'
client.can('delete', 'post', 'post-42') // matches 'delete:post:post-42'
client.can('manage', 'billing', undefined, 'org-1') // matches '@org-1:manage:billing'
client.can('update', 'post', 'post-42', 'org-1') // matches '@org-1:update:post:post-42'
```

`client.can('manage', 'billing')` does **not** find `@org-1:manage:billing`. There is no fallback from a specific key to a general one, in either direction.

## Staleness

The map is a snapshot. It carries no timestamp, no version, and no subject id, so nothing in it can tell a client that it is out of date. Refresh it after a role grant or revoke, a scope change, a policy or role edit, or an attribute change a condition reads. Each client's refresh path is listed under [staleness and refresh](/duck-iam/integrations/client#staleness-and-refresh).

If you need staleness to be detectable, wrap the map in your own envelope on your endpoint - `{ issuedAt, subjectId, permissions }` - and compare `subjectId` on hydration. The clients take the bare map, so unwrap before handing it over.

## Gotchas

* **Do not mix scopes in one map** when the scoped and global answers differ. Two keys that only differ by a leading segment read as unrelated, and a component that forgets the scope silently gets the global answer instead.
* **`resourceId` keys are dense.** Do not pre-generate every `(action, resource, id)` triple. Batch the ids the current view renders; `engine.permissions()` refuses batches over 1024 entries anyway.
* **An empty string is not "no value".** `scope: ''` and `resourceId: ''` produce distinct keys, by design.
* **The map is not a security boundary.** It is browser-readable and browser-editable. Every mutation must be re-checked on the server.
* **Never introspect a key with `key.split(':')`.** The `@` marker and the escaping make that wrong on exactly the keys carrying a scope or an id. `iamAllowedActions` and `iamHasAnyOn` route through `iamParsePermissionKey`, which re-encodes the parsed tuple and compares it to the original, so anything outside the builder's image is rejected rather than guessed at.
* **Segment escaping is per segment, not per key.** Escaping a whole hand-built key string after concatenation produces a different, wrong result.

## See also

* [Client overview](/duck-iam/integrations/client) - how the map reaches the browser
* [Vanilla JS client](/duck-iam/integrations/client/vanilla)
* [React client](/duck-iam/integrations/client/react)
* [Vue client](/duck-iam/integrations/client/vue)
* [Engine modes](/duck-iam/advanced/engine/modes) - why the return type differs by mode
* [Types reference](/duck-iam/types) - the full namespace map