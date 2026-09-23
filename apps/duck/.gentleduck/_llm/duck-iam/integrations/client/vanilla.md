`@gentleduck/iam/client/vanilla` is the framework-agnostic client. It wraps a permission map in a small class with `can`/`cannot`, a subscription hook for reactive frameworks, and two helpers that walk the map. Use it for Svelte, Solid, Lit, Angular, Web Components, browser extensions, or anywhere React and Vue are not in play.

This module contains no evaluator. `can()` reads a snapshot of decisions a server already made, serialised over the wire, sitting in a browser the user controls - every value in it can be edited from a devtools console. It decides what to render, nothing more. The request the button fires must be authorized again on the server, by the engine, against the live policy set.

## Install

```ts
import { IamAccessClient, iamAccessClient } from '@gentleduck/iam/client/vanilla'
```

The module also re-exports `iamAllowedActions` and `iamHasAnyOn`. It does **not** re-export `iamBuildPermissionKey` - the React and Vue entry points do; from here, import it from `@gentleduck/iam/core`.

No dependencies. The class itself needs nothing beyond the language; only the static `fromServer` helper touches `fetch`, so it runs in browsers, Node, Bun, Deno, and edge runtimes alike.

## Lifecycle

The `Empty` state is not an error state: a client built with no argument holds `{}` and every check denies, which is the correct pre-hydration behaviour. `Notifying` is reached from `update` and from `merge` - `merge` is implemented as an `update` of the merged object, so subscribers always receive the *whole* map, never just the patch.

## Basic usage

```ts
import { IamAccessClient } from '@gentleduck/iam/client/vanilla'

const access = new IamAccessClient(permissionsFromServer)

access.can('delete', 'post') // boolean
access.cannot('manage', 'billing') // boolean
access.can('manage', 'user', undefined, 'admin') // scoped check
access.can('delete', 'post', 'post-42') // instance check
```

Type the client to your unions so a mistyped action is a compile error rather than a silently hidden button:

```ts
type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Resource = 'post' | 'comment' | 'billing'
type Scope = 'org-1' | 'admin'

const access = new IamAccessClient<Action, Resource, Scope>(permissionsFromServer)
```

The constructor takes an `IamClient.PartialPermissionMap`, so a map holding only the keys you batched needs no cast. It **copies** the argument - see [map ownership](#map-ownership).

## Fetching from the server

```ts
const access = await IamAccessClient.fromServer('/api/me/permissions', {
  headers: { Authorization: `Bearer ${token}` },
})
```

`fromServer` issues one `fetch`, parses the JSON body as a permission map, and returns a populated client. Its behaviour is precise:

* `Content-Type: application/json` is set **before** your `init.headers` are spread in, so you can override it. The rest of `init` (method, signal, credentials) is spread in ahead of the header merge and passes through untouched.
* A non-2xx response throws ``Error(`Failed to fetch permissions: ${res.status}`)``. The body is *not* read on failure, so a 500 returning HTML does not produce a JSON parse error on top of the real one.
* There is no retry, no timeout, and no caching. Pass an `AbortSignal` through `init` if you need either.

`fromServer` rejects rather than returning an empty client. An unhandled rejection during boot leaves your app with no client at all, which is worse than a locked-down one. Catch it and fall back to `new IamAccessClient()` if a denied-everything UI is the behaviour you want.

## Reactive updates

```ts
const unsubscribe = access.subscribe((permissions) => {
  rerender(permissions)
})

access.update(await refetch()) // replace the whole map
access.merge({ 'manage:team': true }) // shallow patch

unsubscribe()
```

`update` replaces the map and notifies every listener with the new map. `merge` builds `{ ...current, ...patch }` and routes it through `update`, so listeners see the merged result and a patch key overwrites the existing value for the same key. Neither performs a deep merge - the map is flat, so there is nothing to merge deeply.

Listeners are held in a `Set` and invoked in insertion order. A listener that throws is caught, logged as `[@gentleduck/iam:client] listener threw - continuing to notify others`, and the remaining listeners still run. One broken subscriber cannot freeze the rest of your UI.

`subscribe` returns an unsubscribe function; call it on teardown or you leak the listener and everything it closes over.

## Map ownership

This client is the only one of the three that defends its own map. The constructor and `update` both do `{ ...permissions }`, and the `permissions` getter returns `{ ...this._permissions }` - a fresh object on every read.

```ts
const map = { 'read:post': true }
const access = new IamAccessClient(map)
map['delete:post'] = true
access.can('delete', 'post') // false - the client copied at construction
```

`Readonly<...>` erases at runtime, which is why the getter always copied. The way *in* was unguarded, and sharing one map object between a client and the code that built it is not exotic - it is what "fetch it once and pass it around" looks like. A map mutated after being handed over changed what `can()` answered, silently, with no subscriber notified. That silence is the point: the grant took effect while every subscriber stayed uninformed, so the rendered UI and the client disagreed about the same map.

Listeners are a separate matter. `update` notifies with the argument it was given, not with the client's copy, so what a listener does to that object can no longer reach what the client decides from. For `merge`, the notified object is the freshly built merged literal, which does include the previously stored keys.

React and Vue do not copy: `AccessProvider` stores the prop, `createIamPermissionChecker` stores its argument, and Vue's `ref` holds the caller's object. Treat every map you hand to those two as frozen from that moment.

## Map-walking helpers

```ts
access.allowedActions('post') // ['read', 'create']
access.hasAnyOn('post') // true
access.hasAnyOn('billing') // false
```

`allowedActions(resource)` scans every entry, keeps only entries whose value is the boolean `true`, extracts the action for matching keys, and returns a deduplicated `string[]`. `hasAnyOn(resource)` short-circuits on the first granted key that targets the resource. Both agree with `can()` on requiring a literal `true`: a truthiness test would list an action whose value is the string `"false"`.

Neither splits keys on `:`. Both route through `iamParsePermissionKey`, which is the reverse of the builder and rejects anything not in the builder's image - a lone backslash, an unescaped `@` inside a segment, an unrecognised `\x` sequence - by re-encoding the parsed tuple and comparing it to the original key. Without that round-trip the parser and `can()` disagreed on the same map: `can()` builds a canonical key and misses while `allowedActions()` parses the raw key and hits, so a menu offers an action the same client's `can()` denies.

There is no positional guesswork. Arity is unambiguous because a scoped key carries a leading `@`:

| Key | Scope | Action | Resource | Resource id |
| --- | --- | --- | --- | --- |
| `read:post` | - | `read` | `post` | - |
| `read:post:42` | - | `read` | `post` | `42` |
| `@org-1:read:post` | `org-1` | `read` | `post` | - |
| `@org-1:read:post:42` | `org-1` | `read` | `post` | `42` |

Escaping is handled too: inside a segment `:` and `\` are backslash-escaped and a leading `@` is escaped, so a resource literally named `doc:42` keys as `read:doc\:42` and `allowedActions('doc:42')` finds it.

Anything outside that image returns nothing rather than a guess. `allowedActions('42')` on a map holding `read:post:42` returns `[]` - `42` is a resource id there, not a resource type.

`allowedActions` and `hasAnyOn` exist to render navigation, toolbars, and "does this user have anything here" affordances. They report what is in the map, which is only what the server batched. They are not a substitute for a `can()` on the specific action, and never a substitute for the server check.

## SSR and non-browser runtimes

The class is plain JavaScript and runs anywhere, which makes the module-scope trap easy to fall into.

`export const access = new IamAccessClient(map)` in a module imported by a server request handler creates one instance per process, shared by every request. The first user's permissions then answer every other user's checks. Build one client per request, or build it only in code that runs in the browser.

For server-rendered apps, serialise the map into the HTML payload and construct the client during client-side boot. The map is plain JSON, so it needs no special transport. If your framework hydrates from a global, read it once:

```ts
const initial = JSON.parse(document.getElementById('perms')?.textContent ?? '{}')
const access = new IamAccessClient(initial)
```

In a worker or extension background script there is no hydration to match, so `fromServer` is usually the simpler path.

## Framework integration patterns

### Svelte

```ts
// stores/access.ts
import { writable } from 'svelte/store'
import { IamAccessClient } from '@gentleduck/iam/client/vanilla'

export const client = new IamAccessClient(initialPermissions)

const permissions = writable(client.permissions)
client.subscribe((perms) => permissions.set(perms))

// Read `permissions` in a component so Svelte re-runs the check on update.
export const can = (action: string, resource: string) => client.can(action, resource)
```

### Solid

```ts
import { createSignal } from 'solid-js'
import { IamAccessClient } from '@gentleduck/iam/client/vanilla'

const client = new IamAccessClient(initialPermissions)
const [permissions, setPermissions] = createSignal(client.permissions)

client.subscribe(setPermissions)

// Depend on the signal so the memo re-runs when the map is replaced.
export const can = (action: string, resource: string) => () => {
  permissions()
  return client.can(action, resource)
}
```

### Web Components

```ts
class AccessGate extends HTMLElement {
  private unsub?: () => void

  connectedCallback() {
    const action = this.getAttribute('action') ?? ''
    const resource = this.getAttribute('resource') ?? ''

    const render = () => {
      this.hidden = !client.can(action, resource)
    }

    render()
    this.unsub = client.subscribe(render)
  }

  disconnectedCallback() {
    this.unsub?.()
  }
}

customElements.define('access-gate', AccessGate)
```

```html
<access-gate action="delete" resource="post">
  <button>Delete</button>
</access-gate>
```

## API reference

### `IamAccessClient`

```ts
class IamAccessClient<
  TAction extends string = string,
  TResource extends string = string,
  TScope extends string = string,
> {
  constructor(permissions?: IamClient.PartialPermissionMap<TAction, TResource, TScope>)

  static fromServer<TA extends string = string, TR extends string = string, TS extends string = string>(
    url: string,
    init?: RequestInit,
  ): Promise<IamAccessClient<TA, TR, TS>>

  get permissions(): Readonly<IamClient.PartialPermissionMap<TAction, TResource, TScope>>

  can(action: TAction, resource: TResource, resourceId?: string, scope?: TScope): boolean
  cannot(action: TAction, resource: TResource, resourceId?: string, scope?: TScope): boolean

  update(permissions: IamClient.PartialPermissionMap<TAction, TResource, TScope>): void
  merge(permissions: IamClient.PartialPermissionMap<TAction, TResource, TScope>): void
  subscribe(fn: (permissions: IamClient.PartialPermissionMap<TAction, TResource, TScope>) => void): () => void

  allowedActions(resource: TResource): string[]
  hasAnyOn(resource: TResource): boolean
}
```

| Member | Signature | Returns | Notes |
| --- | --- | --- | --- |
| `constructor` | `(permissions?)` | instance | Copies the map in; omitted or `undefined` becomes `{}` |
| `fromServer` | `static (url, init?)` | `Promise<IamAccessClient>` | Throws on non-2xx; body unread on failure |
| `permissions` | getter | `Readonly<PartialPermissionMap>` | A fresh copy on every read |
| `can` | `(action, resource, resourceId?, scope?)` | `boolean` | `true` only for a key whose value is the boolean `true` |
| `cannot` | `(action, resource, resourceId?, scope?)` | `boolean` | Strict `!can(...)` |
| `update` | `(permissions)` | `void` | Copies the map in, notifies all listeners |
| `merge` | `(permissions)` | `void` | Shallow merge over current, then `update` |
| `subscribe` | `(fn)` | `() => void` | Returns the unsubscribe function |
| `allowedActions` | `(resource)` | `string[]` | Deduplicated, only `true` entries |
| `hasAnyOn` | `(resource)` | `boolean` | Short-circuits on the first match |

None of these methods throw except `fromServer`.

### `iamAccessClient`

```ts
function iamAccessClient(
  ...args: ConstructorParameters<typeof IamAccessClient>
): IamAccessClient
```

A factory around the constructor for callers who prefer not to write `new`. It returns the default-generic `IamAccessClient` - if you want `TAction`, `TResource`, and `TScope` narrowed, use `new IamAccessClient<...>()` instead.

```ts
import { iamAccessClient } from '@gentleduck/iam/client/vanilla'

const access = iamAccessClient({ 'read:post': true })
access.can('read', 'post') // true
```

## Gotchas

* **`permissions` is a copy, not the internal object.** Two reads are not `===` each other, and writing into what you got back changes nothing. Go through `update` or `merge`.
* **`update` notifies unconditionally.** Passing an equal map still fires every listener. De-duplicate upstream if your re-render is expensive.
* **`iamAccessClient` erases your generics.** Use the constructor when you want typed unions.
* **`allowedActions` reports the batch, not the world.** An action the server never checked cannot appear, however permitted the subject is. It returns `string[]`, not your action union - the keys come from unvalidated server JSON, and re-asserting the union there would hide a malformed map.
* **There is no `loading`, no `error`, and no `refetch`.** This is a store; the fetching is yours. `fromServer` is a one-shot static.
* **`iamBuildPermissionKey` is not re-exported here.** React and Vue re-export it; from this entry point, import it from `@gentleduck/iam/core`.

## When to use

* Svelte, Solid, Lit, Angular, or any framework without a dedicated duck-iam client
* Web Components and micro-frontends
* Browser extensions, Electron renderers, Tauri
* Service workers, web workers, background scripts
* Tests that want a quick subscribable permission store

## See also

* [PermissionMap reference](/duck-iam/integrations/client/permission-map) - key formats and escaping
* [Client overview](/duck-iam/integrations/client) - server-to-client sync and refresh
* [React client](/duck-iam/integrations/client/react)
* [Vue client](/duck-iam/integrations/client/vue)
* [Server integrations](/duck-iam/integrations/server) - producing the map