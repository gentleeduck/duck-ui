`@gentleduck/iam/server/generic` is the layer the Express, Hono, Next.js, and NestJS wrappers are built on. It has no framework types. Use it directly when you need the same subject binding, environment extraction, or admin-audit pipeline in a runtime the four wrappers do not cover, or when you want to compose your own integration.

## What the wrappers borrow

Each framework wrapper imports from this module and adds only request/response plumbing. The table shows which helper each wrapper uses.

| Helper | Express | Hono | Next.js | NestJS |
| --- | --- | --- | --- | --- |
| `iamActionForMethod` / `IAM_METHOD_ACTION_MAP` | default `getAction` | default `getAction` | middleware rule without `action` | `@IamAuthorize({ infer: true })` |
| `iamDefaultResource` / `iamPathIsAmbiguous` | default `getResource` | default `getResource` | middleware path refusal | `inferResource` |
| `iamIsSubjectId` | subject gate | subject gate | subject gate | subject gate |
| `iamExtractEnvironment` | default `getEnvironment` | default `getEnvironment` (plus `trustCloudflareHeaders`) | default `getEnvironment` | default `getEnvironment` |
| `iamRequireStringField` / `iamOptionalStringField` / `iamRequirePathParam` | admin edge validation | admin edge validation | admin edge validation | admin edge validation |
| `iamReadJsonBody` | not used (host parses) | admin body parse | admin body parse | not used (host parses) |
| `iamDefaultCsrfCheck` | `iamAdminRouter` | `iamBindAdminRouter` | `createIamAdminHandlers` | `createIamAdminOperations` |
| `iamRunAdminAuthz` | mutation gate | mutation gate | mutation gate | not used (throws instead) |
| `iamWithAdminAudit` | mutation gate | mutation gate | mutation gate | `runMutation` |
| `iamNoticeCsrfDefaultIfNeeded` | once at construction | once at construction | once at construction | once at construction |

`generateIamPermissionMap` and `createIamSubjectCan` are not used by the wrappers; they are for handlers, jobs, and tests.

## Install

The generic helpers ship inside the main package.

```ts
import {
  IAM_METHOD_ACTION_MAP,
  IAM_UNKNOWN_ACTION,
  IAM_UNKNOWN_RESOURCE,
  IAM_MAX_ADMIN_FIELD_LENGTH,
  createIamSubjectCan,
  generateIamPermissionMap,
  iamActionForMethod,
  iamDefaultResource,
  iamNormalizePathname,
  iamPathIsAmbiguous,
  iamIsSubjectId,
  iamExtractEnvironment,
  iamDefaultCsrfCheck,
  iamRunAdminAuthz,
  iamWithAdminAudit,
  iamFireAdminMutation,
  iamErrorToAuditString,
  iamIsNameableActor,
  iamNoticeCsrfDefaultIfNeeded,
  iamReadJsonBody,
  iamRequireStringField,
  iamOptionalStringField,
  iamRequirePathParam,
} from '@gentleduck/iam/server/generic'
import type { IamAdminAudit, IamIAdminAuthzResult } from '@gentleduck/iam/server/generic'
```

All runtime names carry the `iam` prefix since 5.0.0 (`createSubjectCan` became `createIamSubjectCan`, and so on).

## Bind a subject

`createIamSubjectCan` returns a `can` function bound to one subject and one optional environment. Every call goes to `engine.can()` with `attributes: {}` on the resource.

```ts
export function createIamSubjectCan<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
>(
  engine: IamEngine<TAction, TResource, TRole, TScope>,
  subjectId: string,
  environment?: IamRequest.IEnvironment,
): (action: TAction, resourceType: TResource, resourceId?: string, scope?: TScope) => Promise<boolean>
```

```ts
import { createIamSubjectCan, iamExtractEnvironment } from '@gentleduck/iam/server/generic'

const can = createIamSubjectCan(engine, userId, iamExtractEnvironment(req))

if (await can('delete', 'post', req.params.postId)) {
  await deletePost(req.params.postId)
}

if (await can('read', 'analytics', undefined, 'org-1')) {
  return renderAnalytics()
}
```

The test `createIamSubjectCan() supports resourceId parameter` pins that the third argument becomes `resource.id`. Because the resource carries no attributes, use this for role-shaped checks; for attribute conditions call `engine.can()` with the loaded record.

## Generate a permission map

`generateIamPermissionMap` is a pass-through to `engine.permissions()` that keeps the server-to-client hydration call site short.

```ts
export async function generateIamPermissionMap<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
  TScope extends string = string,
>(
  engine: IamEngine<TAction, TResource, TRole, TScope>,
  subjectId: string,
  checks: readonly IamClient.IPermissionCheck<TAction, TResource, TScope>[],
  environment?: IamRequest.IEnvironment,
): Promise<AccessControl.ModePermissionMap<TMode, TAction, TResource, TScope>>
```

It infers `TMode` from the engine, so a development-mode engine returns a typed `IamClient.PermissionMap` and a production one returns `Record

The leftmost hop wins (`'1.2.3.4, 5.6.7.8, 10.0.0.1'` gives `'1.2.3.4'`); whitespace is trimmed; `[2001:db8::1]` and `2001:db8::1` both survive verbatim; a header longer than 4096 characters or a leftmost entry longer than 256 yields `undefined` (256 exactly is accepted); an empty or whitespace-only leftmost entry yields `undefined`; array-shaped Node headers use their first element.

The leftmost `x-forwarded-for` entry is the value the first proxy saw, which a client forges by sending its own header. Enable `trustProxy` only when something in front of the app overwrites `X-Forwarded-For` on every request. Behind more than one trusted proxy, compute the client address from the rightmost trusted hop yourself and pass it through `getEnvironment` rather than using this option.

## Method-to-action map

```ts
export const IAM_METHOD_ACTION_MAP: Readonly<Record<string, string>> = {
  GET: 'read',
  HEAD: 'read',
  OPTIONS: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
}
```

`iamActionForMethod` uppercases the method before the lookup, then returns the mapped action or `IAM_UNKNOWN_ACTION`.

```ts
export const IAM_UNKNOWN_ACTION: typeof IAM_RESERVED_REFUSAL = IAM_RESERVED_REFUSAL // === 'unknown'
```

**An unmapped method does not fall back to `'read'`.** It yields the reserved refusal token, which `authorize` and `permissions` refuse before consulting any policy, in either engine mode, with `onDeny` firing on a reason containing `reserved refusal token`. A string that merely looks unmatchable would not do: `'*'` matches every string, so a wildcard admin rule - `.on('*').of('*')` - turned the sentinel back into an allow on exactly the code path built to refuse it. The cost is that an action genuinely named `'unknown'` can no longer be granted.

The uppercase is doing two jobs. A hand-rolled client sending `delete` would miss the map, which is why case-insensitivity is a security property here rather than a nicety; and because `IAM_METHOD_ACTION_MAP` is an object literal, `__proto__`, `constructor`, `toString`, `valueOf` and `hasOwnProperty` are all reachable through it - every inherited key is lowercase, so `.toUpperCase()` is what makes the lookup miss.

Override per route with `getAction` (Express, Hono), a rule `action` (Next.js middleware), or an explicit `action` in `@IamAuthorize` (Nest).

## Derive a resource from a path

```ts
export function iamDefaultResource(pathname: string | undefined): {
  type: string; id: string | undefined; attributes: Record<string, never>
}
```

Three steps, in order:

1. `iamPathIsAmbiguous(raw)` - if the raw path contains a segment that *is* a dot-segment, contains a literal backslash, decodes into a dot-segment, or decodes into another separator, escape or NUL, return `IAM_UNKNOWN_RESOURCE` immediately. A malformed percent-escape counts as ambiguous too.
2. `iamNormalizePathname(raw)` - decode once, collapse slash runs, resolve dot segments, preserve a trailing slash.
3. If any surviving segment still contains a `%` (double-encoding residue), return `IAM_UNKNOWN_RESOURCE`. Otherwise `{ type: parts[0] ?? 'root', id: parts[1] }`.

| Input | `type` | `id` |
| --- | --- | --- |
| `/posts/42` | `posts` | `42` |
| `/posts` | `posts` | `undefined` |
| `/` or `undefined` | `root` | `undefined` |
| `/posts/../admin/secret` | `unknown` | `undefined` |
| `/posts/%2e%2e/admin` | `unknown` | `undefined` |
| `/posts/%252e%252e/admin` | `unknown` | `undefined` |
| `/posts\..\admin` | `unknown` | `undefined` |
| `//admin` | `admin` | `undefined` |
| `/%61dmin` | `admin` | `undefined` |
| `/posts/hello%20world` | `posts` | `hello world` |

`id` is the **second** path segment, not the last: `/orgs/o1/members/m2` derives `{ type: 'orgs', id: 'o1' }`.

Step 1 refuses rather than resolves, and that is the whole design. A traversal has no safe resolution at this layer because the routers disagree with each other - Express served `/admin` for `/admin/../public` while a resolving helper had authorized `public`, and Nest read `admin` from a raw path that Hono and Next served as `/public`. Authorized as one resource, served as another.

The literal backslash case is worth restating: the WHATWG URL parser rewrites `\` to `/` in a special-scheme URL *before* resolving dot segments, so `new URL('http://x/posts\\..\\admin').pathname` is `/admin`. `%5C` was already refused; the plain character - the easier one to send - was not, until it joined the same check.

## Admin edge validators

Every string arriving from an admin body or a path parameter goes through one of these before the engine sees it, and all four adapters apply the identical rules.

| Check | Rule | Code in `issues` |
| --- | --- | --- |
| body is a JSON object | not an array, not `null`, not a primitive | `NOT_AN_OBJECT` |
| required field | a string, non-empty | `INVALID_FIELD` |
| required field | not whitespace-only | `BLANK_FIELD` |
| any field | at most `IAM_MAX_ADMIN_FIELD_LENGTH` (1024) | `FIELD_TOO_LONG` |
| optional field (`scope`) | absent is fine; explicit `null` is refused | `INVALID_FIELD` |
| path parameter | present, non-empty, not blank, at most 1024 | `MISSING_PARAM` / `BLANK_PARAM` / `PARAM_TOO_LONG` |
| request body bytes | parse as JSON | `MALFORMED_JSON` |

Three of those encode a real incident:

* **Blank is refused, not trimmed.** All four adapters once took `length === 0` as the emptiness test, so `{"roleId": "   "}` wrote a real grant to a role nobody can name - not `""`, so nothing downstream refused it, and it renders as nothing at all in an admin UI. Trimming instead would be worse: the caller would get back a grant on an id they did not send.
* **1024 is the engine's own cap.** Hono once capped `roleId` and `scope` at 128 inline while the others let the engine's 1024 decide, so the same 200-character request was a 400 on one adapter and a 500 on two. Nothing the engine would accept is now refused at the edge.
* **`scope: null` is a 400; an absent `scope` means unscoped.** Reading `null` as absent made Express the one adapter that turned a client's `null` into a global role assignment. A client written against Hono that spells "unset" as `null` would widen every grant it makes the day the deployment moves. The refusal message carries the fix verbatim - omit the field entirely - and reaches the client in `issues`, because the message alone goes to `onError`, which a client never sees.

`iamReadJsonBody` is called by Hono and Next only. They are the two adapters that parse the body themselves, *inside* the audited handler, so a truncated upload or a form post carrying `Content-Type: application/json` used to raise a `SyntaxError` out of the handler and answer 500. Express and Nest never see it, because their hosts parse the body first.

## Admin audit pipeline

The four admin surfaces share one mutation pipeline built from three helpers. It is described once here; the framework pages only list what differs.

### `IamAdminAudit` types

```ts
export namespace IamAdminAudit {
  export type Action = 'create' | 'update' | 'delete' | 'replace'
  export type Target = 'policy' | 'role' | 'assignment' | 'role-assignment' | 'attributes'

  export interface IEvent {
    actor?: unknown
    action: Action
    target: Target
    targetId?: string
    ts: number
    method: string
    path: string
    success: boolean
    error?: string
  }

  export type Hook = (event: IEvent) => void | Promise<void>

  export interface IOptions {
    redactPath?: (path: string) => string
    onAuditHookError?: (err: unknown, event: IEvent) => void
    includeErrorMessage?: boolean
    csrfCheck?: ((req: unknown) => boolean) | false
  }
}
```

`IOptions` is composed into every admin options interface (`IamExpress.IAdminRouterOptions`, `IamHono.IAdminOptions`, `IamNext.IAdminOptions`, `IamNest.IAdminOptions`), so these four knobs behave identically everywhere.

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `csrfCheck` | `((req) => boolean) \| false` | `iamDefaultCsrfCheck` | Run before `authorize` on **every** admin request, reads included. `false` disables the phase; a function replaces it. A predicate that throws is a refusal, not a 500. |
| `redactPath` | `(path: string) => string` | identity | Rewrites `event.path` before the hook sees it. The raw path includes expanded route parameters (subject IDs, role IDs, tenant IDs). |
| `onAuditHookError` | `(err, event) => void` | `console.error` | Sink for a throwing or rejecting `onAdminMutation`. Errors thrown by the sink itself are last-resort logged and never propagate. |
| `includeErrorMessage` | `boolean` | `false` | When `true`, `event.error` is `err.message`. Default is the error class name only, because driver errors can carry SQL or credentials. |

Values of `IEvent` per endpoint:

| Endpoint | `action` | `target` | `targetId` |
| --- | --- | --- | --- |
| `PUT /policies` | `replace` | `policy` | the document's `id` |
| `PUT /roles` | `replace` | `role` | the document's `id` |
| `POST /subjects/:id/roles` | `create` | `role-assignment` | subject `id` param |
| `DELETE /subjects/:id/roles/:roleId` | `delete` | `role-assignment` | subject `id` param |

`ts` is `Date.now()`. GET handlers never fire the hook at all.

`actor` is **not** simply whatever `authorize` returned. `authorize` may return an `IamAdminActor` (a non-blank string, or an object identifying someone), `true`, or a falsy value; all three shapes authorize as they always did, but only a *nameable* value is recorded. `true`, `42`, `[]`, `'   '` and a symbol authorize and record `actor: undefined`, plus a one-time `console.warn` naming the shape - never the value - and telling the operator to return the actor itself. An audit trail that names `true` as the person who changed a policy cannot attribute the mutation to anybody, which is the whole reason the event exists. `iamIsNameableActor` is exported if you want the same test.

`event.path` carries the request URL with route parameters already expanded (`/admin/policies/policy-123/tenant-acme`), so subject, role and tenant ids flow into audit sinks unredacted unless `redactPath` is supplied. Nest is the exception: it uses `req.route?.path ?? req.path ?? ''`, so under express-backed Nest the event carries the *route template* (`/admin/subjects/:id/roles`) and `redactPath` will be operating on a template.

### `iamDefaultCsrfCheck`

```ts
export function iamDefaultCsrfCheck(req: unknown): boolean
```

Reads `sec-fetch-site` from three request shapes: a record headers bag (Express, Nest; first element if array), a fetch-API `Headers` via `.get()` (Next.js), or `c.req.header()` (Hono). Returns `false` only when the value is `'cross-site'` or `'cross-origin'`. Missing header (curl, server-to-server, native apps) and `same-origin`, `same-site`, `none` all pass. `admin-shared.test.ts` covers each shape.

```ts
import { iamDefaultCsrfCheck } from '@gentleduck/iam/server/generic'

// Keep the default behaviour AND require a known Origin.
const allow = new Set(['https://admin.example.com'])
const csrfCheck = (req: Request) =>
  iamDefaultCsrfCheck(req) && allow.has(req.headers.get('origin') ?? '')
```

Non-browser callers omit `Sec-Fetch-Site` and pass; they must be gated by bearer or mTLS auth in `authorize`.

### `iamNoticeCsrfDefaultIfNeeded`

```ts
export function iamNoticeCsrfDefaultIfNeeded(csrfCheckPassed: boolean): void
```

Logs one `console.info` line per process the first time an admin factory is constructed without an explicit `csrfCheck` (any value, including `false`, suppresses it). The message names the 2.1.0 behaviour change. You only need to call it from a custom integration.

### `iamRunAdminAuthz`

```ts
export async function iamRunAdminAuthz<TReq>(
  req: TReq,
  csrfCheck: ((req: TReq) => boolean) | null,
  authorize: (req: TReq) => unknown | Promise<unknown>,
): Promise<IamIAdminAuthzResult>

export type IamIAdminAuthzResult =
  | { phase: 'forbidden' }
  | { phase: 'unauthorized' }
  | { phase: 'error'; error: Error }
  | { phase: 'ok'; actor: unknown }
```

Order is fixed: CSRF first - `authorize` is never called when it fails, and no audit event fires - then `authorize`. Any falsy return (`false`, `0`, `''`, `null`, `undefined`, `NaN`) is `unauthorized`. A throw is wrapped into `{ phase: 'error' }` with a real `Error` even when a non-Error was thrown; a *CSRF predicate* that throws is `forbidden` instead, because a predicate that cannot answer has not said yes.

Express, Hono and Next write 403, 401 and 500 for the three phases. Nest throws instead, with both `status` and `statusCode` set on the error - `statusCode` because Nest's base filter routes a non-`HttpException` to `handleUnknownError`, whose only non-500 branch duck-types `err.statusCode && err.message`.

### `iamWithAdminAudit`

```ts
export async function iamWithAdminAudit<T>(
  ctx: {
    actor: unknown
    action: IamAdminAudit.Action
    target: IamAdminAudit.Target
    targetId?: string
    method: string
    path: string
    onAdminMutation?: IamAdminAudit.Hook
    redactPath?: (path: string) => string
    onAuditHookError?: (err: unknown, event: IamAdminAudit.IEvent) => void
    includeErrorMessage?: boolean
  },
  handler: () => Promise<T>,
): Promise<T>
```

Runs `handler` in try/catch/finally. On failure it re-throws the original error and records `error` via `iamErrorToAuditString`. The audit event always fires from `finally`, so a failed save is still audited.

Success is not simply "did not throw". `refusalStatus` duck-types a numeric `status >= 400` on the handler's **return value** and records `success: false` with `error: 'HTTP 

The redactor runs before the hook (`redactPath rewrites event.path before the hook is called`). A throwing redactor is treated as a hook error and the hook is skipped. The hook's promise is never awaited by the request path.

### `iamErrorToAuditString`

```ts
export function iamErrorToAuditString(err: unknown, includeMessage?: boolean): string
```

| Input | `includeMessage` omitted | `includeMessage: true` |
| --- | --- | --- |
| `Error` instance | constructor name (`'TypeError'`, `'PolicyValidationError'`) | `err.message` |
| `undefined` / `null` | `'undefined'` / `'null'` | same |
| string | `'string'` | `'<non-Error string> ' + value`, capped at 256 chars plus `...` |
| number, boolean, symbol | `typeof` (`'number'`, …) | `'<non-Error number> ' + value`, same cap |
| other object | `'object'` | `'<non-Error object> ' + JSON.stringify(value)`; circular values fall back to `String(value)` |

The default is the class name rather than the message because downstream driver errors carry credentials, query fragments and SQL inside `err.message`. `includeErrorMessage` governs the audit string only - it never changes what the caller receives, which is a fixed `'Internal server error'`.

## When to use

* Several runtimes share one authorisation layer (Edge plus Node plus worker).
* A framework not covered by the four wrappers (Fastify, Koa, Elysia, gRPC).
* Background jobs and queue consumers that need `can()` without a request.
* Tests that want a quick subject-bound checker.
* Building your own admin surface that must keep CSRF, audit, and error-string semantics identical to the shipped ones.

## When not to use

* If Express, Hono, Next.js, or NestJS defaults fit your routing, use the wrapper; it already composes these helpers.
* For attribute-based checks on loaded records, call `engine.can()` or `engine.check()` directly with real `resource.attributes`; the helpers here always pass `attributes: {}`.

## API reference

| Export | Kind | Purpose |
| --- | --- | --- |
| `IAM_METHOD_ACTION_MAP` | `Readonly<Record<string, string>>` | CRUD map used by every wrapper |
| `IAM_UNKNOWN_ACTION`, `IAM_UNKNOWN_RESOURCE` | `'unknown'` | The engine's reserved refusal token, returned when a method or path cannot be derived |
| `iamActionForMethod(method)` | function | Uppercase, then look up; refusal token on a miss |
| `iamDefaultResource(pathname)` | function | `{ type, id, attributes }` from a path, or the refusal token |
| `iamPathIsAmbiguous(raw)` | function | Traversal / double-encoding / backslash detector |
| `iamNormalizePathname(raw)` | function | Decode once, collapse slash runs, resolve dot segments |
| `iamIsSubjectId(value)` | type guard | Non-blank string; the only layer that refuses `'   '` |
| `iamReadJsonBody(read)` | function | Parses a body, raising a `MALFORMED_JSON` validation error |
| `iamRequireStringField`, `iamOptionalStringField`, `iamRequirePathParam` | functions | The shared admin edge validators |
| `IAM_MAX_ADMIN_FIELD_LENGTH` | `1024` | The engine's own cap, applied at the edge so nothing the engine accepts is refused earlier |
| `iamIsNameableActor(value)` | type guard | Whether an `authorize` return value can be recorded as `event.actor` |
| `createIamSubjectCan(engine, subjectId, environment?)` | function | Subject-bound `can(action, resource, resourceId?, scope?)` |
| `generateIamPermissionMap(engine, subjectId, checks, environment?)` | function | Wraps `engine.permissions()` |
| `iamExtractEnvironment(req)` | function | `{ ip, userAgent, timestamp }` with forwarded-IP normalisation |
| `iamDefaultCsrfCheck(req)` | function | `Sec-Fetch-Site` predicate |
| `iamNoticeCsrfDefaultIfNeeded(passed)` | function | One-time console notice |
| `iamRunAdminAuthz(req, csrfCheck, authorize)` | function | CSRF then authorize; discriminated result |
| `iamWithAdminAudit(ctx, handler)` | function | try/catch/finally audit wrapper |
| `iamFireAdminMutation(hook, event, opts?)` | function | Fire-and-forget hook invoker |
| `iamErrorToAuditString(err, includeMessage?)` | function | Safe error string for audit sinks |
| `IamAdminAudit` | namespace | `Action`, `Target`, `IEvent`, `Hook`, `IOptions` |
| `IamIAdminAuthzForbidden`, `IamIAdminAuthzUnauthorized`, `IamIAdminAuthzError`, `IamIAdminAuthzOk`, `IamIAdminAuthzResult` | types | Phases of `iamRunAdminAuthz` |

## Gotchas

* `generateIamPermissionMap` is typed over the engine's mode, but at runtime it holds only the checked keys. Consume it as `IamClient.PartialPermissionMap` on the client, which every client accepts directly.
* `iamExtractEnvironment` never throws on missing input; `iamExtractEnvironment({})` returns `{ ip: undefined, userAgent: undefined, timestamp }`.
* `iamReadJsonBody` deliberately does not repeat the parser's own message: it quotes the offending bytes, which is caller-controlled content on its way into an operator's log.
* The CSRF notice is process-global; a second engine in the same process will not log it again.

## See also

* [Server integrations overview](/duck-iam/integrations/server)
* [Express](/duck-iam/integrations/server/express), [Hono](/duck-iam/integrations/server/hono), [Next.js](/duck-iam/integrations/server/next), [NestJS](/duck-iam/integrations/server/nest)
* [PermissionMap reference](/duck-iam/integrations/client/permission-map)
* [Engine methods](/duck-iam/advanced/engine/methods) for `can`, `check`, and `permissions`
* [Admin API](/duck-iam/advanced/engine/admin) for what the admin endpoints call
* [Production checklist](/duck-iam/guides/production)