Everything so far ran in `src/main.ts`. This chapter puts DocDuck behind an HTTP server, guards its routes, feeds the engine the document data its owner policy needs, and exposes the permissions endpoint the browser will consume in chapter 7.

## What you should already have

After chapter 5, `src/access.ts` exports `adapter`, `engine` (with `scopeMode: 'hierarchical'`) and the `seeded` promise; `src/policies.ts` exports `policies`, now including `tenantIsolation`; `src/documents.ts` exports `findDocument` and `documentAttributes`; and `src/access.ts` already carries the `beforeEvaluate` hook from chapter 4. This chapter adds one new file, `src/server.ts`.

## Learning goals

* Map an HTTP request onto the five arguments of `engine.can()`.
* Choose between global middleware, a per-route guard, and a direct `engine.can()` call - and know which one can vary the scope per request.
* Load resource attributes so ABAC rules written in chapter 3 actually see them.
* Mount the admin router safely: the mandatory `authorize` callback, the CSRF default, the audit hook.
* Serve a permission map for the client.

## One guarded request

The guard sits between authentication and the handler. It never decides *who* the caller is - that is your auth middleware's job, and it must run first. The guard's only inputs are the subject ID your auth layer put on the request, the action, the resource, the environment, and the scope.

Every default extractor reads identity from somewhere the client cannot set: Express uses `req.user?.id`, Hono uses `c.get('userId')` (set by an upstream middleware), and the Next.js `withIamAccess` wrapper refuses to construct at all unless you pass `getUserId`, precisely so nobody reaches for `req.headers['x-user-id']`.

## How a request becomes a check

The framework wrappers are thin. Each derives the five `can()` arguments from the request using overridable extractors:

| `can()` argument | Default source | Override with |
| --- | --- | --- |
| `subjectId` | `req.user?.id` (Express, Nest also tries `req.user.sub`), `c.get('userId')` (Hono) | `getUserId` |
| `action` | `IAM_METHOD_ACTION_MAP[req.method]` | `getAction` |
| `resource` | First path segment as the type, second as the id | `getResource` |
| `environment` | `iamExtractEnvironment(req)` | `getEnvironment` |
| `scope` | none | `getScope` (middleware and Nest guard only) |

`IAM_METHOD_ACTION_MAP` is exported from `@gentleduck/iam/server/generic`:

| Method | Action |
| --- | --- |
| `GET`, `HEAD`, `OPTIONS` | `read` |
| `POST` | `create` |
| `PUT`, `PATCH` | `update` |
| `DELETE` | `delete` |

An unlisted method falls back to `read`.

`iamExtractEnvironment(req)` sets exactly three keys - `timestamp`, `userAgent`, and `ip` - and **`ip` is `undefined` unless you ask for it**. `X-Forwarded-For` and `X-Real-IP` are ordinary request headers, so with nothing in front of the app a client sets them itself; `req.ip` is skipped for the same reason, because a framework may fill it from a platform header rather than a socket.

Opt in explicitly, one of two ways:

```ts
// The framework already knows about your proxies:
getEnvironment: (req) => iamExtractEnvironment(req, { trustProxy: true })

// Or you resolve the client address yourself:
getEnvironment: (req) => ({ ...iamExtractEnvironment(req), ip: trustedClientIp(req) })
```

Under `trustProxy` the chain is `req.ip`, then the **leftmost** `x-forwarded-for` hop, then `x-real-ip`; a header over 4096 characters or a hop over 256 characters is dropped rather than trusted.

Write `deny when environment.ip in BLOCKLIST` on a default wiring and it never fires - `environment.ip` is `null`, the condition is false, the deny is retired, and the request is allowed. Silently, forever. The same applies to any custom key (`environment.region`, a feature flag): `getEnvironment` is the only place those values can enter.

`iamAccessMiddleware` derives the resource from `req.path`, so `/documents/doc-1` produces the type `documents` - plural, because your URL is. Either name your resource types after your routes or pass `getResource` and map them yourself. A silent mismatch here reads as "everything is denied".

## Express

**Install and mount authentication first**

```ts title="src/server.ts"
import express from 'express'
import { engine, seeded } from './access'

const app = express()
app.use(express.json())

// Your own auth: sets req.user from a verified session or JWT.
app.use(authenticate)
```

**Guard one route**

`iamGuard(engine, action, resourceType, opts?)` returns Express middleware. It reads the resource id from `req.params.id` and calls `engine.can()`; on `false` it replies 403, and with no user it replies 401.

```ts title="src/server.ts"
import { iamGuard } from '@gentleduck/iam/server/express'

app.get('/documents/:id', iamGuard(engine, 'read', 'document'), getDocument)
app.patch('/documents/:id', iamGuard(engine, 'update', 'document'), updateDocument)
app.delete('/documents/:id', iamGuard(engine, 'delete', 'document'), deleteDocument)
```

`opts` accepts `getUserId`, `getEnvironment`, `onDenied`, and a **static** `scope` - a narrower set than the middleware's, and notably no `onError`: a guard that throws calls `next(err)`.

**Guard everything with one middleware**

`iamAccessMiddleware(engine, opts?)` checks every request that passes through it. Use it when your routes are uniform, and give it `getScope` when the tenant is in the URL:

```ts title="src/server.ts"
import { iamAccessMiddleware } from '@gentleduck/iam/server/express'

app.use('/teams/:team', iamAccessMiddleware(engine, {
  getUserId: (req) => req.user?.id ?? null,
  getResource: (req) => {
    const parts = (req.path ?? '/').split('/').filter(Boolean)
    return { type: parts[0] === 'documents' ? 'document' : 'team', id: parts[1], attributes: {} }
  },
  getScope: (req) => req.params?.team,
  onDenied: (_req, res) => res.status(403).json({ error: 'Forbidden' }),
}))
```

**Check that the document row still reaches the engine**

`iamGuard` builds the resource as `{ type, id: req.params.id, attributes: {} }` - an **empty** attribute bag. `document-ownership` reads `resource.attributes.ownerId`, which would resolve to `null`, and its `deny-non-owner-write` rule would fire for everybody.

Chapter 4's `beforeEvaluate` hook is what saves you, and this is the moment it earns its keep - it fills the gap for every entry point at once:

```ts title="src/access.ts (unchanged since chapter 4)"
const hooks: IamEngineTypes.IHooks = {
  async beforeEvaluate(request) {
    if (request.resource.type !== 'document' || !request.resource.id) return request
    const doc = await findDocument(request.resource.id)
    if (!doc) return request
    return {
      ...request,
      resource: {
        ...request.resource,
        attributes: { ...documentAttributes(doc), ...request.resource.attributes },
      },
    }
  },
  // afterEvaluate, onDeny, onError, onPolicyError, onMetrics ...
}
```

`beforeEvaluate` may return a modified request and the engine uses what it returns. It runs on `authorize`, `can`, `check`, every entry of `permissions()`, and `explain()`. Keep it fast and cache aggressively - it is on the hot path of every check. Without a hook like this, every guard that does not build its own resource attributes is checking against an empty bag.

## Picking an integration point

`iamGuard` (Express and Hono) and `withIamAccess` (Next.js) take a **static** `scope` option - one value fixed at mount time. Only `iamAccessMiddleware` and the Nest guard accept a `getScope(request)` callback. When the tenant varies per request and you are on a per-route guard, either switch to the middleware or drop into the handler:

```ts title="src/server.ts"
import { createIamSubjectCan } from '@gentleduck/iam/server/generic'

app.post('/teams/:team/documents', async (req, res) => {
  const can = createIamSubjectCan(engine, req.user.id)
  if (!(await can('create', 'document', undefined, req.params.team))) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  res.json(await createDocument(req.body))
})
```

`createIamSubjectCan(engine, subjectId, environment?)` returns `(action, resourceType, resourceId?, scope?) => Promise<boolean>` - the terse form for handler-level checks. `generateIamPermissionMap(engine, subjectId, checks, environment?)` is the other generic helper; it is a thin pass-through to `engine.permissions()`.

## The permissions endpoint

The browser cannot run the engine, so the server hands it a **permission map**: one boolean per `(scope, action, resource, resourceId)` combination the UI needs. Chapter 7 consumes it.

```ts title="src/server.ts"
import type { IamClient } from '@gentleduck/iam'

const UI_CHECKS = [
  { action: 'create', resource: 'document' },
  { action: 'update', resource: 'document' },
  { action: 'delete', resource: 'document' },
  { action: 'manage', resource: 'team' },
] as const satisfies readonly IamClient.IPermissionCheck[]

app.get('/api/permissions', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const team = typeof req.query.team === 'string' ? req.query.team : undefined
  const checks = team ? UI_CHECKS.map((c) => ({ ...c, scope: team })) : UI_CHECKS
  res.json(await engine.permissions(req.user.id, checks))
})
```

The response is a flat object keyed by `[@scope:]action:resource[:resourceId]`:

```json
{
  "@acme.design:create:document": true,
  "@acme.design:update:document": true,
  "@acme.design:delete:document": false,
  "@acme.design:manage:team": false
}
```

Three things to know about the batch:

* The subject and the policy set are loaded **once**, then each check is evaluated against them. Scoped role merging is memoised per scope inside the call.
* The array is capped at 1024 entries; a bigger batch throws rather than truncating.
* `permissions(subjectId, checks, environment, { telemetry: false })` skips the per-check `onMetrics` hook. Use it on hot UI gates where you already have latency data.

If the subject or the policies fail to load, the whole map comes back all-`false` and `onError` fires - fail closed, never a partial map.

## The admin router

`engine.admin` writes policies, roles and assignments straight to the adapter. Exposing it over HTTP is exactly as dangerous as it sounds, so the router refuses to be constructed without an `authorize` callback.

```ts title="src/server.ts"
import { Router } from 'express'
import { iamAdminRouter } from '@gentleduck/iam/server/express'

app.use('/api/iam-admin', iamAdminRouter(engine, {
  authorize: (req) => req.user?.isPlatformAdmin === true,
  onAdminMutation: (event) => auditLog.write(event),
  redactPath: (path) => path.replace(/\/[^/]+$/, '/:id'),
})(Router))
```

`iamAdminRouter(engine, opts)` returns a factory that takes the Express `Router` constructor, so the package never imports Express itself. The routes it mounts:

| Method and path | Calls | Body |
| --- | --- | --- |
| `GET /policies` | `admin.listPolicies()` | - |
| `GET /roles` | `admin.listRoles()` | - |
| `PUT /policies` | `admin.savePolicy(body)` | a policy object |
| `PUT /roles` | `admin.saveRole(body)` | a role object |
| `POST /subjects/:id/roles` | `admin.assignRole(id, roleId, scope)` | `roleId` and optional `scope` |
| `DELETE /subjects/:id/roles/:roleId` | `admin.revokeRole(id, roleId)` | - |

Behaviour worth knowing:

* **`authorize` runs on every route**, reads included. Returning a falsy value replies 401; throwing replies 500.
* **CSRF is on by default since 2.1.0, and it applies to reads as well as mutations.** A built-in `Sec-Fetch-Site` check rejects `cross-site` and `cross-origin` with 403, before `authorize` runs and without emitting an audit event. The header is set by the user agent and page script cannot forge it. Requests carrying no such header - curl, server-to-server, native apps - pass, so bearer-token callers are unaffected. Pass `csrfCheck: false` to disable, or a predicate for an Origin allowlist; a predicate that throws is a 403, not a 500. The first construction without an explicit `csrfCheck` logs a one-time notice.
* **`onAdminMutation` fires after every mutation**, success or failure, and never on a `GET`. It is fire-and-forget: the router does not await it, and a throw inside it is caught. `event.path` carries expanded route parameters (tenant and subject IDs), so pass `redactPath` when your audit sink sits outside your trust boundary. `event.error` is the error's **class name** by default, because driver messages can carry credentials; `includeErrorMessage: true` opts into the full message.
* **Rate limiting is out of scope.** Compose your own limiter at the mount point.
* `savePolicy` and `saveRole` run the validator first and throw before writing if it reports an error-level issue.

## Other frameworks

Every wrapper is built on the same generic helpers, so the concepts above transfer unchanged. Only the shapes differ.

### Hono

```ts title="src/server.ts"
import { Hono } from 'hono'
import { iamAccessMiddleware, iamBindAdminRouter, iamGuard } from '@gentleduck/iam/server/hono'

const app = new Hono()

// Your auth middleware must set c.set('userId', ...) upstream.
app.patch('/documents/:id', iamGuard(engine, 'update', 'document'), updateDocument)

app.use('/teams/*', iamAccessMiddleware(engine, {
  getScope: (c) => c.req.param('team'),
}))

const admin = new Hono()
iamBindAdminRouter(admin, engine, { authorize: (c) => isPlatformAdmin(c) })
app.route('/api/iam-admin', admin)
```

`iamBindAdminRouter(router, engine, opts)` wires the same six routes onto a router you already own and returns it for chaining.

### Next.js App Router

```ts title="app/api/documents/[id]/route.ts"
import { withIamAccess } from '@gentleduck/iam/server/next'
import { engine } from '@/lib/access'

export const PATCH = withIamAccess(engine, 'update', 'document',
  async (req, ctx) => {
    const { id } = await ctx.params
    return Response.json(await updateDocument(id, await req.json()))
  },
  { getUserId: async (req) => (await getSession(req))?.user.id ?? null },
)
```

`getUserId` is **required** - `withIamAccess` throws at construction without it. The wrapper awaits `ctx.params` (Next 15 makes it a promise) and uses `params.id` as the resource id.

The other Next.js exports:

| Export | Use |
| --- | --- |
| `checkIamAccess(engine, subjectId, action, resourceType, resourceId?, scope?)` | one check inside a Server Component or server action |
| `getIamPermissions(engine, subjectId, checks)` | build the permission map in a layout, pass it to the client provider |
| `createIamNextMiddleware(engine, { rules, getUserId, onError? })` | Edge middleware; returns `null` when the request passes or no rule matches, otherwise a 401/403/500 `Response` |
| `createIamAdminHandlers(engine, { authorize, ... })` | `{ listPolicies, listRoles, savePolicy, saveRole, assignRole, revokeRole }` route handlers |

Each middleware rule is `{ pattern, resource, action?, scope? }`, where `pattern` is a string prefix or a `RegExp`; the first match wins and an omitted `action` is inferred from the HTTP method.

### NestJS

```ts title="src/access.guard.ts"
import { Injectable, type CanActivate } from '@nestjs/common'
import { IamAuthorize, iamNestAccessGuard } from '@gentleduck/iam/server/nest'
import { engine } from './access'

@Injectable()
export class AccessGuard implements CanActivate {
  canActivate = iamNestAccessGuard(engine, {
    getScope: (req) => req.params?.team,
    getResourceAttributes: async (req, ctx) =>
      ctx.resource === 'document' && req.params?.id
        ? { ownerId: (await findDocument(req.params.id))?.ownerId ?? null }
        : {},
  })
}

// In a controller:
@IamAuthorize({ action: 'delete', resource: 'document' })
@Delete(':id')
remove(@Param('id') id: string) { /* ... */ }
```

A handler with **no** `@IamAuthorize` decorator is allowed through untouched - the guard only enforces what you annotate. `@IamAuthorize({ infer: true })` derives the action from the HTTP method and the resource from the last non-parameter route segment. `getResourceAttributes` receives the resolved `{ action, resource, scope }` so you can load the right row; return `null` for an absent value, never `undefined`.

`createIamEngineProvider(factory)` gives you a `{ provide, useFactory }` descriptor bound to the exported token `IAM_ACCESS_ENGINE_TOKEN`, and `createIamAdminOperations(engine, { authorize })` returns the admin methods for your own controller.

## Engine mode on the server

Keep `mode: 'development'` while you build: `check()` returns a full decision with a reason, and `explain()` works. Switch to `mode: 'production'` when you deploy - `check()` and `permissions()` return plain booleans, `explain()` throws, and evaluation runs against a compiled lookup table instead of walking policies. `can()` returns a `boolean` in both modes, so guards and middleware behave identically either way. Chapter 8 makes the switch.

## What just happened

The engine did not change. You wrapped it in three layers, each with one job:

1. **Your auth middleware** establishes identity. duck-iam never does this.
2. **The wrapper** turns an HTTP request into `(subjectId, action, resource, environment, scope)` using defaults you can override one at a time.
3. **The `beforeEvaluate` hook** enriches the request with data only your database has, so the ABAC rules written in chapter 3 can read `resource.attributes.ownerId`.

The deny path is uniform: no subject gives 401 and a `false` decision gives 403. A thrown error never becomes an allow either - `iamAccessMiddleware` answers it through its own `onError` option, which defaults to a 500, while `iamGuard` hands it to `next(err)` so your Express error handler owns the response. Subject-resolution failures, adapter timeouts and policy-load errors all funnel into the same fail-closed deny inside the engine before any of that.

## Try it

1. Mount `iamGuard(engine, 'delete', 'document')` on `DELETE /documents/:id` and confirm Bob gets 403 for a document Alice owns, with the `beforeEvaluate` hook in place. Remove the hook and watch every delete start failing - that is the empty-attributes trap.
2. Add `getScope: (req) => req.params.team` to a `/teams/:team` middleware and prove `PATCH /teams/acme.design/documents/doc-1` succeeds for Bob while `PATCH /teams/acme.eng/documents/doc-1` returns 403.
3. Call `/api/permissions?team=acme.design` as Bob and check the returned keys carry the `@acme.design:` prefix.
4. Mount the admin router with `authorize: () => false` and confirm every route replies 401, including `GET /policies`.
5. Wire `onAdminMutation` to `console.log`, then `PUT /policies` and inspect the event: `action`, `target`, `targetId`, `success`, and a `path` you have redacted.

## See also

* [Express integration](/duck-iam/integrations/server/express) - full options tables for middleware, guard, and admin router
* [Generic server helpers](/duck-iam/integrations/server/generic) - `iamExtractEnvironment`, `IAM_METHOD_ACTION_MAP`, the audit event shape
* [Hono](/duck-iam/integrations/server/hono), [Next.js](/duck-iam/integrations/server/next), [NestJS](/duck-iam/integrations/server/nest)
* [Engine hooks](/duck-iam/advanced/engine/hooks) - `beforeEvaluate` ordering and error semantics
* [Permission map](/duck-iam/integrations/client/permission-map) - the exact key format
* [Admin API](/duck-iam/advanced/engine/admin) - what each admin method invalidates

***

Next: [Chapter 7: client libraries](/duck-iam/course/chapter-7)