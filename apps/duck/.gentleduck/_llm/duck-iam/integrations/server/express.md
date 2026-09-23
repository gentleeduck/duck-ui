`@gentleduck/iam/server/express` exposes two request gates and one admin router. It declares no runtime dependency on Express: every function is typed against a minimal `req` / `res` / `next` shape, so it works with Express 4, Express 5, and any router that implements `.get`, `.put`, `.post`, and `.delete`. The shared extraction and audit behaviour lives in [generic helpers](/duck-iam/integrations/server/generic); this page documents only what Express adds.

## Install

```ts
import { iamAccessMiddleware, iamGuard, iamAdminRouter } from '@gentleduck/iam/server/express'
import type { IamExpress } from '@gentleduck/iam/server/express'
```

All three runtime exports carry the `iam` prefix since 5.0.0. `accessMiddleware`, `guard`, and `adminRouter` no longer resolve, and the namespace is `IamExpress`, not `Express`.

## Setup

Build the engine once per process

```ts
// lib/engine.ts
import { IamEngine } from '@gentleduck/iam/core'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'

export const engine = new IamEngine({ adapter: new IamMemoryAdapter() })
```

Put your auth layer in front

The wrapper never authenticates. It reads `req.user.id`, which passport, a session middleware, or your own JWT verifier must have set already.

```ts
app.use(sessionMiddleware)
app.use(attachUserFromSession)
```

Mount a gate

Either one blanket middleware under a prefix, or a guard per route.

```ts
app.use('/api', iamAccessMiddleware(engine))
// or
app.delete('/posts/:id', iamGuard(engine, 'delete', 'post'), deletePostHandler)
```

Optionally replace the 500 body

Both gates answer a fixed `500 { error: 'Internal server error' }` when an extractor or the engine throws. Pass `onError` if you want a different body or your own logging.

```ts
app.delete('/posts/:id', iamGuard(engine, 'delete', 'post', {
  onError: (err, _req, res) => { log.error(err); res.status(503).json({ error: 'Try again' }) },
}), deletePostHandler)
```

## One guarded request

This sequence diagram traces `DELETE /posts/42` through the Express stack with `iamGuard` mounted.

Every extractor runs **inside** the `try`, `getUserId` included, so a throwing or rejecting one reaches `onError` rather than the framework boundary. That placement is Express-specific in its consequences: `getUserId` is the extractor most likely to do I/O - JWT verification, a session lookup, an IdP call - and an Express 4 middleware that returns a rejected promise writes nothing to the socket, so the client hung until it timed out.

## `iamAccessMiddleware`

Blanket middleware. Derives action and resource from the request, so one `app.use` covers a whole route tree.

```ts
export function iamAccessMiddleware<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
>(
  engine: IamEngine<TAction, TResource, TRole, TScope>,
  opts?: IamExpress.IOptions<TScope>,
): (req: Req, res: Res, next: Next) => void
```

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `getUserId` | `(req) => string \| null` | `req.user?.id ?? null` | Subject id. A falsy return is a 401 before the engine is consulted. |
| `getResource` | `(req) => IamRequest.IResource` | first two segments of `req.path` | `{ type: parts[0] ?? 'root', id: parts[1], attributes: {} }`. `req.path` defaults to `'/'` when absent. |
| `getAction` | `(req) => string` | `iamActionForMethod(req.method)` | Method map from the generic helpers; an unmapped method yields the reserved refusal token, **not** `'read'`. |
| `getEnvironment` | `(req) => IamRequest.IEnvironment` | `iamExtractEnvironment` | `{ ip, userAgent, timestamp }`, with `ip` left `undefined`. |
| `getScope` | `(req) => TScope \| undefined` | none — `scope` stays `undefined` | Multi-tenant scope. |
| `onDenied` | `(req, res) => void` | `res.status(403).json({ error: 'Forbidden' })` | Runs when `engine.can()` returns `false`. |
| `onError` | `(err, req, res) => void` | `res.status(500).json({ error: 'Internal server error' })` | Runs when any extractor or `engine.can()` throws. **Three arguments — `next` is not passed.** |

The 401 response is fixed at `{ error: 'Unauthorized' }` and has no option. The `resource.attributes` bag is always `{}` — the middleware never loads the record.

It used to be, and the obvious handler to write with it - `(err, req, res, next) => next()` - resumes the request with no decision made. That is a fail-open on exactly the path where the decision could not be computed. A cross-adapter test now asserts `onError.mock.calls[0].length === 3`.

```ts
app.use(
  '/api',
  iamAccessMiddleware(engine, {
    getUserId: (req) => req.user?.id ?? null,
    getScope: (req) => (typeof req.headers?.['x-org-id'] === 'string' ? req.headers['x-org-id'] : undefined),
    onDenied: (req, res) => res.status(403).json({ error: 'Forbidden', path: req.path }),
    onError: (err, _req, res) => { log.error(err); res.status(500).json({ error: 'Internal server error' }) },
  }),
)
```

### Path-derived resources

`/posts/42` produces `{ type: 'posts', id: '42' }` — plural, taken verbatim from the URL. `/` produces `{ type: 'root', id: undefined }`. The second segment becomes `resource.id` even when it is not an identifier, so `GET /posts/search` checks `read` on `posts` with `id: 'search'`. Supply `getResource` on such routes, or switch to `iamGuard`.

An ambiguous path is refused rather than resolved. `/posts/../admin`, `/posts/%2e%2e/admin`, `/posts/%252e%252e/admin` and `/posts\..\admin` all produce the reserved token `'unknown'`, which the engine denies before consulting any policy. Express is where this matters most: it served `/admin` for `/admin/../public` while a resolving helper had authorized `public` - authorized as one resource, served as another.

## `iamGuard`

Per-route middleware with a fixed action and resource type. The resource id comes from `req.params.id`.

```ts
export function iamGuard<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
>(
  engine: IamEngine<TAction, TResource, TRole, TScope>,
  action: TAction,
  resourceType: TResource,
  opts?: Pick<IamExpress.IOptions<TScope>, 'getUserId' | 'getEnvironment' | 'onDenied' | 'onError'> & { scope?: TScope },
): (req: Req, res: Res, next: Next) => void
```

The guard accepts a strict subset of the middleware options: `getUserId`, `getEnvironment`, `onDenied`, `onError`, plus a fixed `scope`. There is no `getAction`, no `getResource`, and no `getScope` — the action and resource type are the arguments, and the id is `req.params?.id`.

`onError` defaults to the same fixed `500 { error: 'Internal server error' }` the middleware answers. It used to default to `next(err)`, which with no app error handler and `NODE_ENV !== 'production'` made finalhandler write `err.stack` into the response body.

```ts
// Fixed action and resource; id read from req.params.id.
app.delete('/posts/:id', iamGuard(engine, 'delete', 'post'), (req, res) => {
  res.json({ deleted: req.params.id })
})

// Fixed scope for a whole admin surface.
app.post('/admin/users', iamGuard(engine, 'manage', 'user', { scope: 'admin' }), createUser)

// Custom subject source for a machine-to-machine route.
app.get(
  '/reports',
  iamGuard(engine, 'read', 'report', {
    getUserId: (req) => serviceAccountFor(req) ?? null,
    // The package never answers 404; this is your own handler choosing to.
    onDenied: (_req, res) => res.status(404).json({ error: 'Not found' }),
  }),
  listReports,
)
```

The guard gives a coarse role-shaped verdict with an empty attribute bag. For ownership or status conditions, keep the guard as the cheap gate and call `engine.can()` again in the handler with the loaded record's real `resource.attributes`. Both calls hit the same subject and policy caches.

## Subject, scope, and environment

| Field | Where it comes from | Override |
| --- | --- | --- |
| subject id | `req.user?.id` | `getUserId` (both gates) |
| resource type | first path segment (middleware) or the `resourceType` argument (guard) | `getResource` / the argument |
| resource id | second path segment (middleware) or `req.params.id` (guard) | `getResource` / check in the handler |
| action | `iamActionForMethod(req.method)` (middleware) or the `action` argument (guard) | `getAction` / the argument |
| scope | `getScope(req)` (middleware) or `opts.scope` (guard) | either |
| environment | `iamExtractEnvironment(req)` | `getEnvironment` |

Neither gate reads `x-user-id` or any other client-controlled header. `req.user` is populated by your authentication middleware, and an unauthenticated request therefore fails closed with 401 before `engine.can()` is reached. If you proxy a verified identity header from a trusted ingress, pass `getUserId` explicitly and validate the header there.

### Forwarded-IP normalisation

The default `getEnvironment` is `iamExtractEnvironment` applied directly to the Express request, and it leaves **`environment.ip` undefined**. Express does have `req.ip`, but the helper ignores it without an opt-in: an integration may fill it from a platform header rather than a socket, and a condition keyed on a field the host never populated reads as a non-match, not an error - so a deny rule on `environment.ip` never fires and the request is allowed, silently, forever.

Opt in explicitly, after configuring Express's own `trust proxy` so `req.ip` is a value you believe:

```ts
// Behind exactly one trusted proxy.
app.set('trust proxy', 1)

app.use(iamAccessMiddleware(engine, {
  getEnvironment: (req) => iamExtractEnvironment(req, { trustProxy: true }),
}))
```

Under `trustProxy` the chain is `req.ip`, then the leftmost `x-forwarded-for` hop, then `x-real-ip`, all through the same normaliser. The full decision path is on the [generic helpers page](/duck-iam/integrations/server/generic).

## Error mapping

| Situation | Where it is caught | Response |
| --- | --- | --- |
| `getUserId` returns a non-string, `''`, or a blank string | `iamIsSubjectId`, inside the `try` | `401 { error: 'Unauthorized' }`, not overridable |
| `engine.can()` returns `false` | after the call | `onDenied`, default `403 { error: 'Forbidden' }` |
| any extractor throws, `getUserId` included | `try` around the whole body | `onError`, default `500 { error: 'Internal server error' }` |
| `engine.can()` rejects | same `try` | `onError` |

A blank subject id is refused **here**, not by the engine. `engine.can` guards `length === 0`, not `trim()`, so `'   '` is a perfectly good cache key to it and any assignment stored under that key would grant its permissions. `iamIsSubjectId` is the only layer that closes that, and it answers 401 rather than a plain 403.

`engine.can()` does not throw on an authorisation failure: it catches adapter and policy errors, routes them to the engine's `onError` hook, and returns `false`. The 500 paths above are for your own callbacks. See [engine methods](/duck-iam/advanced/engine/methods).

## Admin router

`iamAdminRouter` returns a factory that takes the Express `Router` constructor, so nothing imports Express at runtime.

```ts
export function iamAdminRouter<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
>(
  engine: IamEngine<TAction, TResource, TRole, TScope>,
  opts: IamExpress.IAdminRouterOptions,
): (Router: () => ExpressRouterLike) => ExpressRouterLike
```

```ts
import { Router } from 'express'
import rateLimit from 'express-rate-limit'

const adminLimiter = rateLimit({ windowMs: 60_000, max: 30 })

app.use(
  '/api/access-admin',
  adminLimiter,
  iamAdminRouter(engine, {
    authorize: (req) => req.user?.role === 'platform-admin',
    onAdminMutation: (event) => auditLog.write(event),
    redactPath: (p) => p.replace(/\/[^/]+$/, '/:id'),
  })(Router),
)
```

| Endpoint | Engine call | Audit `action` / `target` | `targetId` |
| --- | --- | --- | --- |
| `GET /policies` | `admin.listPolicies()` | none (reads never audit) | — |
| `GET /roles` | `admin.listRoles()` | none | — |
| `PUT /policies` | `admin.savePolicy(req.body)` | `replace` / `policy` | `req.body.id` |
| `PUT /roles` | `admin.saveRole(req.body)` | `replace` / `role` | `req.body.id` |
| `POST /subjects/:id/roles` | `admin.assignRole(id, body.roleId, body.scope)` | `create` / `role-assignment` | `req.params.id` |
| `DELETE /subjects/:id/roles/:roleId` | `admin.revokeRole(id, roleId)` | `delete` / `role-assignment` | `req.params.id` |

Mutations write `req.method` and `req.path ?? req.url ?? ''` into the audit event; all four adapters fill `targetId` from the document's `id` for policy and role writes.

### Options

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `authorize` | `(req) => unknown \| Promise<unknown>` | **required** | Runs on every endpoint, read and write. A falsy return (`false`, `0`, `''`, `null`, `undefined`, `NaN`) is 401; a throw is 500. Return the actor itself, not `true` — see below. |
| `csrfCheck` | `((req) => boolean) \| false` | `iamDefaultCsrfCheck` | Runs on **every** admin request, reads included. `false` disables the phase. |
| `onUnauthorized` | `(req, res) => void` | `401 { error: 'Unauthorized' }` | Replaces the falsy-`authorize` response. |
| `onError` | `(err, req, res) => void` | `500 { error: 'Internal server error' }` | Same three-argument shape as the gates. |
| `onAdminMutation` | `IamAdminAudit.Hook` | none | Fire-and-forget, fires on success and failure, never on GET. |
| `redactPath` | `(path: string) => string` | identity | Rewrites `event.path` before the hook. |
| `onAuditHookError` | `(err, event) => void` | `console.error` | Sink for a throwing hook. |
| `includeErrorMessage` | `boolean` | `false` | `event.error` becomes `err.message` instead of the class name. |

The last four are the shared `IamAdminAudit.IOptions`; their exact semantics, the event shape, and the CSRF predicate are documented once on the [generic helpers page](/duck-iam/integrations/server/generic).

`iamAdminRouter` throws at construction when `opts.authorize` is not a function: `[@gentleduck/iam] iamAdminRouter requires an authorize callback. Mounting admin endpoints unauthenticated is never safe.` The router writes policies, roles, and assignments straight to the adapter, so there is no useful unauthenticated mode.

All six routes — the two GETs included — run `iamDefaultCsrfCheck` **before** `authorize`, rejecting browser requests whose `Sec-Fetch-Site` is `cross-site` or `cross-origin` with `403 { error: 'Forbidden (CSRF check failed)' }` and firing no audit event. That response is fixed and not covered by `onUnauthorized` or `onError`. A predicate that throws is also a 403, because a predicate that cannot answer has not said yes. Requests with no such header (curl, server-to-server) pass and must be gated by bearer or mTLS auth inside `authorize`. A one-time `console.info` names the change when you did not pass `csrfCheck` explicitly.

`POST /subjects/:id/roles` accepts `scope` in the body; the revoke route does not. It calls `admin.revokeRole(subjectId, roleId)` with no third argument, and the adapter contract for an omitted scope is **remove every assignment for that role, across every scope**. One `DELETE` against a subject holding that role in five tenants removes all five. To drop a single scoped assignment, add your own route calling `engine.admin.revokeRole(subjectId, roleId, scope)`. See [scoped roles](/duck-iam/core/roles/scoped).

`authorize` may return an actor (a non-blank string, or an object identifying someone), `true`, or a falsy value. All three authorize identically, but only a nameable value is recorded as `event.actor`. `true`, `42`, `[]` and `'   '` authorize and record `actor: undefined`, plus a one-time `console.warn`. An audit trail that names `true` as the person who changed a policy cannot attribute the mutation to anybody.

## API reference

| Export | Kind | Purpose |
| --- | --- | --- |
| `iamAccessMiddleware(engine, opts?)` | function | Blanket middleware with inferred action and resource |
| `iamGuard(engine, action, resourceType, opts?)` | function | Per-route middleware with a fixed action and resource |
| `iamAdminRouter(engine, opts)` | function | `(Router) => router` factory for the six admin endpoints |
| `IamExpress.IOptions<TScope>` | interface | Options for both gates |
| `IamExpress.IAdminAuthorize` | type | `(req) => boolean \| Promise<boolean>` |
| `IamExpress.IAdminRouterOptions` | interface | `authorize` plus `onUnauthorized`, `onError`, and `IamAdminAudit.IOptions` |

```ts
import type { IamExpress } from '@gentleduck/iam/server/express'

const opts: IamExpress.IOptions<'org-acme' | 'org-globex'> = {
  getUserId: (req) => req.user?.id ?? null,
  getScope: (req) => (req.params?.org === 'acme' ? 'org-acme' : undefined),
}

const adminAuth: IamExpress.IAdminAuthorize = (req) => req.user?.role === 'platform-admin'
```

The namespace is type-only and costs nothing at runtime.

## Gotchas

* Neither gate's `onError` receives `next`. Resuming a request whose decision could not be computed is a fail-open, so the option to do it was removed.
* Nothing in this module ever answers 404. Every refusal it produces is 400, 401, 403 or 500; a 404 on an admin path comes from your own routing table.
* The guard reads `req.params.id` only. For `:postId`, rename the parameter, use `iamAccessMiddleware` with a custom `getResource`, or check in the handler.
* Path-derived resource types are plural when your URLs are plural: `/posts/42` checks `posts`, not `post`. Name resources after URL segments or supply `getResource`.
* Both gates pass `attributes: {}`. Ownership and status conditions must be evaluated in the handler against the loaded record.
* `iamAdminRouter` is a factory of a factory: `iamAdminRouter(engine, opts)` returns a function you still have to call with `Router`.
* The audit `event.path` for `POST /subjects/:id/roles` contains the expanded subject id. Pass `redactPath` when the audit sink is outside your trust boundary.

## See also

* [Server integrations overview](/duck-iam/integrations/server) for the shared pipeline and the cross-framework comparison
* [Generic helpers](/duck-iam/integrations/server/generic) for `iamExtractEnvironment`, the CSRF predicate, and the audit pipeline
* [Hono](/duck-iam/integrations/server/hono) for the same two gates in an edge runtime
* [Admin API](/duck-iam/advanced/engine/admin) for what the six endpoints call
* [Engine methods](/duck-iam/advanced/engine/methods) for `can`, `check`, and `permissions`
* [Auth bridge guide](/duck-iam/guides/auth-bridge) for wiring `req.user` from duck-auth