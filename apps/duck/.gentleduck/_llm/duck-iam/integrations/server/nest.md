`@gentleduck/iam/server/nest` is decorator-driven rather than router-driven: you mark controller methods with `@IamAuthorize`, install one guard, and the guard reads the metadata off the handler. It has no hard dependency on `@nestjs/common` — every Nest type it touches is duck-typed — and `reflect-metadata` is optional. The shared extraction and audit behaviour lives in [generic helpers](/duck-iam/integrations/server/generic); this page documents only what NestJS adds.

## Install

```ts
import {
  IamAuthorize,
  iamNestAccessGuard,
  createIamEngineProvider,
  createIamAdminOperations,
  IAM_ACCESS_ENGINE_TOKEN,
  IAM_ACCESS_METADATA_KEY,
} from '@gentleduck/iam/server/nest'
import type { IamNest, NestRequest } from '@gentleduck/iam/server/nest'
```

All runtime exports carry the `iam` / `Iam` / `IAM_` prefix since 5.0.0. `nestAccessGuard`, `Authorize`, `createEngineProvider`, and `createAdminOperations` no longer resolve, and the namespace is `IamNest`, not `Nest`.

## Setup

Register the engine as a provider

`createIamEngineProvider` returns `{ provide: IAM_ACCESS_ENGINE_TOKEN, useFactory }`. The factory may be async.

```ts
import { Module } from '@nestjs/common'
import { IamEngine } from '@gentleduck/iam/core'
import { IamDrizzleAdapter } from '@gentleduck/iam/adapters/drizzle'
import { createIamEngineProvider } from '@gentleduck/iam/server/nest'

@Module({
  providers: [createIamEngineProvider(async () => new IamEngine({ adapter: await buildAdapter() }))],
  exports: [IAM_ACCESS_ENGINE_TOKEN],
})
export class AccessModule {}
```

Install the guard

`iamNestAccessGuard` returns a `canActivate` body, not a class. Wrap it in an `@Injectable()` guard or register it globally with `APP_GUARD`.

```ts
import { APP_GUARD } from '@nestjs/core'
import { iamNestAccessGuard, IAM_ACCESS_ENGINE_TOKEN } from '@gentleduck/iam/server/nest'

{
  provide: APP_GUARD,
  useFactory: (engine) => ({ canActivate: iamNestAccessGuard(engine) }),
  inject: [IAM_ACCESS_ENGINE_TOKEN],
}
```

Mark the handlers that need a check

```ts
@Delete(':id')
@IamAuthorize({ action: 'delete', resource: 'post' })
deletePost(@Param('id') id: string) {
  return this.posts.delete(id)
}
```

Map guard denials to a response

The guard returns a boolean. Nest turns `false` into `403 Forbidden` through its own `ForbiddenException`. If you need a 401 for the unauthenticated case, put an authentication guard in front so the request never reaches this one without `req.user`.

## One guarded request

This sequence diagram traces `DELETE /posts/42` through a Nest request pipeline. Everything hinges on the metadata lookup: no metadata, no check.

Absent metadata and unreadable metadata are two different answers, and conflating them was a live bypass:

```ts
const { meta, present } = getHandlerMeta(handler)
if (!present) return true            // No @IamAuthorize decorator: allow.
if (meta === undefined) return onError(new Error('...not readable...; denying.'), request)
```

* **No decorator → the guard returns `true`.** An undecorated controller method is not this package's business, and `undefined` counts as absent — that is what an unset reflect key answers, and it is indistinguishable from no decorator.
* **Present but unreadable → deny, through `onError`.** `null`, `false`, `0`, `''`, a string, a number, an array, `{action: 1}`, `{resource: {}}`, `{scope: 7}`, `{infer: 'true'}` and `{infer: 1}` are all refused and the engine is never consulted. The guard's old `if (!meta) return true` could not tell "no decorator" from "decorator carrying `null`", so a broken decorator opened the route instead of closing it — and a `scope` arriving as a number went straight into `engine.can` as the tenant to answer for. The refusal routes through `onError` so an operator sees which handler is broken rather than hunting a silent 403; the message contains `@gentleduck/iam:nest`.

The validator is deliberately permissive about *extra* keys — your own annotation alongside these four is not refused — and strict about the four the guard reads.

Registering `iamNestAccessGuard` as `APP_GUARD` does **not** protect anything; it protects exactly the handlers carrying `@IamAuthorize`. A handler that loses its decorator in a refactor becomes public with no error, no log, and no failing test unless one is written for that route specifically. Pair it with an authentication guard that covers the whole app, and audit new controllers for a missing `@IamAuthorize`.

Every field is optional, so `{}` is readable; with `infer` unset, `resource` falls back to the literal `'unknown'`, which is the engine's reserved refusal token. Same for `@IamAuthorize({ action: 'read' })` with no `resource`. If you mean "check with the defaults", write `@IamAuthorize()` — its default argument is `{ infer: true }`.

## `@IamAuthorize`

A `MethodDecorator` that stamps the requirement onto the handler.

```ts
export function IamAuthorize<
  TAction extends string = string,
  TResource extends string = string,
  TScope extends string = string,
>(meta?: IamNest.IAuthorizeMeta<TAction, TResource, TScope>): MethodDecorator
```

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `action` | `TAction` | `'read'` when omitted and `infer` is off | The action checked. |
| `resource` | `TResource` | `'unknown'` when omitted and `infer` is off | The resource type checked. |
| `scope` | `TScope` | falls back to the guard's `getScope(request)` | Multi-tenant scope. |
| `infer` | `boolean` | `false`; the whole `meta` argument defaults to `{ infer: true }` | Derives both action and resource from the request, ignoring `action` and `resource`. |

Omitting the argument entirely gives `{ infer: true }`, which the test `default meta has infer:true` pins. Passing `{ infer: true, action: 'publish' }` still infers — `infer` is checked first and wins for both fields.

The decorator writes the metadata twice: through `Reflect.defineMetadata(IAM_ACCESS_METADATA_KEY, meta, descriptor.value)` when `reflect-metadata` is loaded, and as an own `__accessMeta` property on the handler function so the guard also works without that package.

The guard's reading order is `'__accessMeta' in handler` first, then `Reflect.getMetadata`. That `in` test **walks the prototype chain**, so an inherited `__accessMeta` decides the request and shadows the reflect entry entirely.

```ts
@Controller('posts')
export class PostsController {
  @Delete(':id')
  @IamAuthorize({ action: 'delete', resource: 'post' })
  remove(@Param('id') id: string) {
    return this.posts.delete(id)
  }

  @Post()
  @IamAuthorize({ action: 'create', resource: 'post' })
  create(@Body() dto: CreatePostDto) {
    return this.posts.create(dto)
  }

  // action from the HTTP method, resource from the route path.
  @Get()
  @IamAuthorize({ infer: true })
  list() {
    return this.posts.list()
  }

  // Scope fixed on the decorator; overrides the guard's getScope.
  @Patch('billing')
  @IamAuthorize({ action: 'manage', resource: 'billing', scope: 'admin' })
  updateBilling(@Body() dto: BillingDto) {
    return this.billing.update(dto)
  }
}
```

### What `infer: true` derives

| Field | Derivation |
| --- | --- |
| action | `iamActionForMethod(request.method)` — an unmapped method yields the reserved refusal token, **not** `'read'` |
| resource | `inferResource(request)`, below |

`inferResource` has to agree with `iamDefaultResource`, or a policy written against Express silently does not apply under Nest. The order matters:

1. If `request.path` is ambiguous, return the refusal token — **before** looking at the route template. A matched template does not make an ambiguous target safe; it only records which route Express picked for it. Express matched `/public/*` for `/public/../admin`, so an earlier version returned a confident `public` while Hono and Next served `/admin`.
2. If `request.route?.path` is not a string — the normal case under `@nestjs/platform-fastify`, which exposes `routeOptions.url` / `routerPath` and sets no `route` — delegate to `iamDefaultResource(request.path).type`.
3. Otherwise take the **first** non-`:param` segment of the template.

| Template | Resource |
| --- | --- |
| `/posts/:id` | `posts` |
| `posts` | `posts` |
| `/orgs/:orgId/members/:id` | `orgs` |
| `/secrets/*` | `secrets` |
| `/files/*path` | `files` |
| `/*`, `*`, `/*path` | `unknown` |
| `/%61dmin` | `unknown` |
| `/:id`, `/` | `root` |

So `@Controller('posts')` with `@Get(':id')` infers `posts`, and `/admin/users/:id/roles` infers `admin`, not `roles`. Taking the *last* segment — the historical behaviour — authorized `/posts/42` against `42` on any platform with no `request.route`. Returning `'*'` verbatim was worse: `'*'` is the engine's wildcard *pattern* sentinel, so a `@Get('*')` route matched every `resources: ['*']` allow and no targeted deny.

For typed actions and resources, parameterise the decorator at the call site rather than looking for a factory:

```ts
type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Resource = 'post' | 'user' | 'billing'

// A typo in either string is a compile error.
@IamAuthorize<Action, Resource>({ action: 'delete', resource: 'post' })
remove() {}
```

## `iamNestAccessGuard`

Builds the `canActivate` body.

```ts
export function iamNestAccessGuard<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
>(
  engine: IamEngine<TAction, TResource, TRole, TScope>,
  opts?: IamNest.IGuardOptions<TScope>,
): (context: NestExecutionContext) => Promise<boolean>
```

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `getUserId` | `(req: NestRequest) => string \| null` | `req.user?.id ?? req.user?.sub ?? null` | Subject id. Synchronous only. |
| `getEnvironment` | `(req: NestRequest) => IamRequest.IEnvironment` | `iamExtractEnvironment(req)` | `{ ip, userAgent, timestamp }`. |
| `getResourceId` | `(req: NestRequest) => string \| undefined` | `req.params?.id` | Resource instance id. |
| `getScope` | `(req: NestRequest) => TScope \| undefined` | none | Used only when the decorator carries no `scope`. |
| `getResourceAttributes` | `(req, ctx) => Attributes \| Promise<Attributes>` | none — attributes stay `{}` | Since 5.2.0. Computes `resource.attributes` before the check. |
| `onError` | `(err: Error, req: NestRequest) => boolean` | `() => false` | The decision when the check throws. Returning `true` fails open. |

```ts
const canActivate = iamNestAccessGuard(engine, {
  getUserId: (req) => req.session?.identityId ?? req.user?.id ?? null,
  getScope: (req) => (typeof req.headers?.['x-org-id'] === 'string' ? req.headers['x-org-id'] : undefined),
  getResourceId: (req) => req.params?.id,
  onError: (err, req) => {
    logger.error({ err, path: req.path }, 'access check failed')
    return false
  },
})
```

The exported `NestRequest` interface is the shape the guard touches: `user`, `params`, `method`, `path`, `route`, `headers`, `ip`, plus `session` and `identity` slots for auth middleware such as duck-auth, and a string index signature for everything else.

The default `getUserId` reads `req.user.id` then `req.user.sub`, both populated by your authentication layer. No header is consulted. A falsy result makes the guard return `false` before `engine.can()` runs, so an unauthenticated request is denied rather than checked. If a trusted ingress injects a verified identity header, read it in an explicit `getUserId` and validate it there.

`onError` returns a boolean that becomes the guard's answer, not a response. The default `() => false` denies, which is the fail-closed posture the rest of the engine takes. Returning `true` turns an adapter outage into blanket access; the test `custom onError can override result` exists to document that it is possible, not that it is advisable.

### `getResourceAttributes`

The other wrappers always pass `attributes: {}`, so ownership conditions have to be re-checked in the handler. NestJS is the exception: `getResourceAttributes` fills the attribute bag before `engine.can()` runs, and it receives the already-resolved `action`, `resource`, and `scope` so one function can serve several routes.

```ts
export interface IGuardOptions<TScope extends string = string> {
  getResourceAttributes?: (
    request: NestRequest,
    ctx: { action: string; resource: string; scope: TScope | undefined },
  ) => Readonly<IamPrimitives.Attributes> | Promise<Readonly<IamPrimitives.Attributes>>
}
```

```ts
iamNestAccessGuard(engine, {
  getResourceAttributes: async (req, { resource }) => {
    if (resource !== 'post') return {}
    const post = await posts.findById(req.params?.id ?? '')
    // `null` means absent; `undefined` is not a valid AttributeValue.
    return { ownerId: post?.authorId ?? null, status: post?.status ?? null }
  },
})
```

Values must be `IamPrimitives.AttributeValue`. Express an absent value as `null`, never `undefined` — the test `merges getResourceAttributes into the resource passed to engine.can` uses exactly that convention. The hook is awaited inside the guard's `try`, so a rejection lands in `onError` and, by default, denies.

## Subject, scope, and environment

| Field | Where it comes from |
| --- | --- |
| subject id | `getUserId(request)`, default `req.user?.id ?? req.user?.sub ?? null` |
| action | `@IamAuthorize({ action })`, or `iamActionForMethod` when `infer: true`, else `'read'` |
| resource type | `@IamAuthorize({ resource })`, or the first non-parameter route segment when `infer: true`, else the refusal token `'unknown'` |
| resource id | `getResourceId(request)`, default `req.params?.id` |
| resource attributes | `getResourceAttributes(request, ctx)`, default `{}` |
| scope | `@IamAuthorize({ scope })` when present, otherwise `getScope(request)` |
| environment | `iamExtractEnvironment(request)` |

The decorator's `scope` wins over `getScope`; the tests `decorator scope takes precedence over getScope` and `falls back to getScope when decorator scope absent` pin both directions.

### Forwarded-IP normalisation

The default `getEnvironment` passes the Nest request straight to `iamExtractEnvironment`, which leaves **`environment.ip` undefined** — even though express-backed Nest has a perfectly good `req.ip`. The helper ignores it without an opt-in, because an integration may fill `req.ip` from a platform header rather than a socket, and there is no guess that is right on every deployment.

Opt in explicitly, after configuring the platform's own proxy trust:

```ts
// main.ts, Express platform, behind exactly one trusted proxy
app.set('trust proxy', 1)

canActivate = iamNestAccessGuard(engine, {
  getEnvironment: (req) => iamExtractEnvironment(req, { trustProxy: true }),
})
```

A condition on `environment.ip` without that opt-in reads as a **non-match**, not an error: a deny rule keyed on it never fires. The full decision path is on the [generic helpers page](/duck-iam/integrations/server/generic).

## Error mapping

| Situation | Guard behaviour | What the client sees |
| --- | --- | --- |
| handler has no `@IamAuthorize` | returns `true` | the handler runs |
| `getUserId` returns a non-string, `''`, or a blank string | `iamIsSubjectId` returns `false` | `403 Forbidden` from Nest |
| handler metadata is present but unreadable | `onError(err, req)`, default `false` | `403 Forbidden` from Nest, plus the `onError` report |
| `engine.can()` returns `false` | returns `false` | `403 Forbidden` from Nest |
| `getEnvironment`, `getResourceAttributes`, or `engine.can()` throws | `onError(err, req)`, default `false` | `403 Forbidden` from Nest |
| `getUserId` throws | inside the guard's `try` | `onError(err, req)`, default `false` |

The guard never produces a 401, because it returns a boolean rather than a response — it has no way to distinguish 401 from 403, so Nest's own filter decides. Distinguish "not logged in" from "not allowed" in an authentication guard placed before this one, or throw `UnauthorizedException` from a custom `getUserId` when the request has no subject.

`engine.can()` does not throw on an authorisation failure: it validates the subject id, catches adapter and policy errors, routes them to the engine's `onError` hook, and returns `false`. See [engine methods](/duck-iam/advanced/engine/methods).

## Admin operations

Nest routes through controllers, so this wrapper ships gated **operations** rather than a router. `createIamAdminOperations` returns six pre-gated functions to call from your own controller methods.

```ts
export function createIamAdminOperations<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
>(
  engine: IamEngine<TAction, TResource, TRole, TScope>,
  opts: IamNest.IAdminOptions,
): {
  listPolicies(req: NestRequest): Promise<AccessControl.IPolicy<TAction, TResource, TRole>[]>
  listRoles(req: NestRequest): Promise<AccessControl.IRole<TAction, TResource, TRole, TScope>[]>
  savePolicy(req: NestRequest, body: AccessControl.IPolicy<TAction, TResource, TRole>): Promise<{ ok: true }>
  saveRole(req: NestRequest, body: AccessControl.IRole<TAction, TResource, TRole, TScope>): Promise<{ ok: true }>
  assignRole(req: NestRequest, subjectId: string, body: { roleId: TRole; scope?: TScope }): Promise<{ ok: true }>
  revokeRole(req: NestRequest, subjectId: string, roleId: TRole): Promise<{ ok: true }>
}
```

```ts
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import { IAM_ACCESS_ENGINE_TOKEN, createIamAdminOperations } from '@gentleduck/iam/server/nest'

@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 30, ttl: 60_000 } })
@Controller('admin')
export class IamAdminController {
  private readonly h

  constructor(@Inject(IAM_ACCESS_ENGINE_TOKEN) engine) {
    this.h = createIamAdminOperations(engine, {
      authorize: (req) => req.user?.role === 'platform-admin',
      onAdminMutation: (event) => auditLog.write(event),
      redactPath: (p) => p.replace(/\/[^/]+$/, '/:id'),
    })
  }

  @Get('policies') listPolicies(@Req() req) { return this.h.listPolicies(req) }
  @Get('roles') listRoles(@Req() req) { return this.h.listRoles(req) }
  @Put('policies') savePolicy(@Req() req, @Body() body) { return this.h.savePolicy(req, body) }
  @Put('roles') saveRole(@Req() req, @Body() body) { return this.h.saveRole(req, body) }

  @Post('subjects/:id/roles')
  assignRole(@Req() req, @Param('id') id: string, @Body() body) {
    return this.h.assignRole(req, id, body)
  }

  @Delete('subjects/:id/roles/:roleId')
  revokeRole(@Req() req, @Param('id') id: string, @Param('roleId') roleId: string) {
    return this.h.revokeRole(req, id, roleId)
  }
}
```

| Operation | Engine call | Audit `action` / `target` | `targetId` |
| --- | --- | --- | --- |
| `listPolicies` | `admin.listPolicies()` | none (reads never audit) | — |
| `listRoles` | `admin.listRoles()` | none | — |
| `savePolicy` | `admin.savePolicy(body)` | `replace` / `policy` | `body.id` |
| `saveRole` | `admin.saveRole(body)` | `replace` / `role` | `body.id` |
| `assignRole` | `admin.assignRole(subjectId, body.roleId, body.scope)` | `create` / `role-assignment` | the `subjectId` argument |
| `revokeRole` | `admin.revokeRole(subjectId, roleId)` | `delete` / `role-assignment` | the `subjectId` argument |

`event.method` is `req.method` and `event.path` is `req.route?.path ?? req.path ?? ''` — the **route pattern** when Nest supplies it, so identifiers are usually already absent from the audit path and `redactPath` will be operating on a template. All four adapters fill `targetId` from the document's `id` for policy and role writes.

### Denials are thrown, not returned

Every operation runs `gateWithActor` first, which throws instead of returning a status:

| Condition | Thrown value |
| --- | --- |
| `csrfCheck` returns `false`, or throws | `Error` with `status` and `statusCode` `403`, message `Forbidden (CSRF check failed)` |
| `authorize` returns falsy | `Error` with `status` and `statusCode` `401`, message `Unauthorized` |
| `authorize` throws | `Error` with `status`/`statusCode` `500`, message `Internal server error`, the original attached as `cause` |

Map those in an exception filter, or convert them at the controller boundary:

```ts
@Catch()
export class IamAdminExceptionFilter implements ExceptionFilter {
  catch(err: Error & { status?: number }, host: ArgumentsHost) {
    const status = err.status ?? 500
    host.switchToHttp().getResponse().status(status).json({ error: err.message })
  }
}
```

A gate failure happens **before** `iamWithAdminAudit`, so a rejected mutation fires no audit event: the mutation never started. Failures inside the handler do fire one, with `success: false`.

### Options

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `authorize` | `(req: NestRequest) => unknown \| Promise<unknown>` | **required** | Runs on every operation, read and write. Return the actor itself, not `true` — `true` authorizes and records `actor: undefined` with a one-time `console.warn`. |
| `csrfCheck` | `((req) => boolean) \| false` | `iamDefaultCsrfCheck` | Runs on reads **and** writes here. `false` disables it. |
| `onAdminMutation` | `IamAdminAudit.Hook` | none | Fire-and-forget, fires on success and failure, never on a read. |
| `redactPath` | `(path: string) => string` | identity | Rewrites `event.path` before the hook. |
| `onAuditHookError` | `(err, event) => void` | `console.error` | Sink for a throwing hook. |
| `includeErrorMessage` | `boolean` | `false` | `event.error` becomes `err.message` instead of the class name. |

Because Nest owns the response, these three hooks return an **error to throw** rather than write one:

| Option | Default |
| --- | --- |
| `onUnauthorized` | `(req) => Error` with `status`/`statusCode` `401`, message `Unauthorized` |
| `onForbidden` | `(req) => Error` with `status`/`statusCode` `403`, message `Forbidden (CSRF check failed)` |
| `onError` | `(err, req) => Error` with `status`/`statusCode` `500`, message `Internal server error`, the original as `cause` |

Both `status` and `statusCode` are set: `statusCode` because Nest's base filter routes a non-`HttpException` to `handleUnknownError`, whose only non-500 branch duck-types `err.statusCode && err.message`; `status` is kept for express-style consumers.

`onError` used to re-throw the original, so every failure except 401/403 arrived at the host with no status at all and an engine error's message rode out intact — `includeErrorMessage: false` governs only the *audit* string, so a driver error reading `DB password=hunter2` reached the host's filter with the flag off. Returning the original from a custom `onError` is now a deliberate choice.

A document that fails the engine validator is the exception: it throws with `status`/`statusCode` `400` and the validator's `issues` attached, because a malformed document is the caller's mistake and a 500 tells a client to retry a request that can never succeed.

The last four options are the shared `IamAdminAudit.IOptions`, documented once on the [generic helpers page](/duck-iam/integrations/server/generic).

`createIamAdminOperations` throws at construction when `opts.authorize` is not a function: `[@gentleduck/iam] createIamAdminOperations requires an authorize callback.` The operations write policies, roles, and assignments straight to the adapter, so a controller cannot be instantiated unguarded.

`iamDefaultCsrfCheck` runs before `authorize`, rejecting requests whose `Sec-Fetch-Site` is `cross-site` or `cross-origin` with a thrown error carrying `status`/`statusCode` `403`, and firing no audit event. It applies to `listPolicies` and `listRoles` as well as to the four mutations — the read gate calls the same `gateWithActor`. Nest was once the only adapter checking reads; the other three were aligned to it rather than the other way round. A predicate that throws is also a refusal. Requests with no such header (curl, service-to-service) pass and must be gated by bearer or mTLS auth inside `authorize`. A one-time `console.info` names the change when you did not pass `csrfCheck` explicitly.

`assignRole` accepts `scope` in its body; `revokeRole` does not. It calls `admin.revokeRole(subjectId, roleId)` with no third argument, and the adapter contract for an omitted scope is **remove every assignment for that role, across every scope**. One call against a subject holding that role in five tenants removes all five. To drop a single scoped assignment, add a controller method calling `engine.admin.revokeRole(subjectId, roleId, scope)`. See [scoped roles](/duck-iam/core/roles/scoped).

## API reference

| Export | Kind | Purpose |
| --- | --- | --- |
| `IamAuthorize(meta?)` | function | `MethodDecorator` stamping the access requirement |
| `iamNestAccessGuard(engine, opts?)` | function | `(context) => Promise<boolean>` for `canActivate` |
| `createIamEngineProvider(factory)` | function | `{ provide: IAM_ACCESS_ENGINE_TOKEN, useFactory }` |
| `createIamAdminOperations(engine, opts)` | function | Six gated admin operations |
| `IAM_ACCESS_ENGINE_TOKEN` | `string` — `'ACCESS_ENGINE'` | DI token for the engine |
| `IAM_ACCESS_METADATA_KEY` | `string` — `'duck-iam:authorize'` | `reflect-metadata` key for the decorator |
| `NestRequest` | interface | The request shape the guard reads |
| `IamNest.IAuthorizeMeta<TAction, TResource, TScope>` | interface | `action`, `resource`, `scope`, `infer` |
| `IamNest.IGuardOptions<TScope>` | interface | Guard extractors and `onError` |
| `IamNest.IAdminAuthorize` | type | `(req) => boolean \| Promise<boolean>` |
| `IamNest.IAdminOptions` | interface | `authorize` plus `IamAdminAudit.IOptions` |

```ts
import type { IamNest, NestRequest } from '@gentleduck/iam/server/nest'

const guardOpts: IamNest.IGuardOptions = {
  getUserId: (req: NestRequest) => req.user?.id ?? req.user?.sub ?? null,
}

const meta: IamNest.IAuthorizeMeta = { action: 'delete', resource: 'post' }
```

The namespace is type-only and costs nothing at runtime.

## Gotchas

* Undecorated handlers are allowed. Global registration is not blanket protection.
* `infer: true` overrides an explicit `action` and `resource` in the same decorator; do not combine them.
* Without `infer`, an omitted `resource` becomes the literal `'unknown'` — the engine's reserved refusal token, which `authorize` refuses before consulting any policy. The route is dead-denied, not merely unmatched. An omitted `action` becomes `'read'`.
* A `@IamAuthorize` carrying a bad value (`null`, a string, `{scope: 7}`) denies through `onError` rather than allowing. Only a genuinely absent decorator allows.
* `__accessMeta` is read with `in`, which walks the prototype chain, so an inherited decorator decides an overriding handler's request.
* Nothing in this module ever answers 404. Every refusal it produces is 400, 401, 403 or 500.
* `getUserId` here is synchronous, unlike the Next.js wrapper. Resolve the session in an earlier guard or middleware and put the id on `req.user`, `req.session`, or `req.identity`.
* The guard cannot return 401. Layer an authentication guard in front if you need the distinction.
* `reflect-metadata` is optional but recommended: load it once at the application entry point so the metadata is visible to Nest's own tooling as well as to this guard.
* Admin operations throw `Error & { status }`; without an exception filter Nest reports them as 500 rather than 401 or 403.

## See also

* [Server integrations overview](/duck-iam/integrations/server) for the shared pipeline and the cross-framework comparison
* [Generic helpers](/duck-iam/integrations/server/generic) for `iamExtractEnvironment`, the CSRF predicate, and the audit pipeline
* [Express](/duck-iam/integrations/server/express) for the router-shaped equivalent under the same Node platform
* [Admin API](/duck-iam/advanced/engine/admin) for what the six operations call
* [Engine methods](/duck-iam/advanced/engine/methods) for `can`, `check`, and `permissions`
* [Auth bridge guide](/duck-iam/guides/auth-bridge) for populating `req.session` and `req.identity` from duck-auth