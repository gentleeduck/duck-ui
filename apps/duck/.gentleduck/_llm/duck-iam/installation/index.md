`@gentleduck/iam` is one package with 27 export paths. The core engine, builders, and types come from the root; every adapter, server integration, client, invalidator, the metrics aggregator, and the devtools panels live behind their own subpath so you only bundle what you import.

## Requirements

| Requirement | Version | Why |
| --- | --- | --- |
| Node.js | 18 or newer | Declared in `engines`. The engine uses `AbortController` for adapter timeouts. |
| TypeScript | 5.0 or newer | `createIam()` relies on const type parameters, which landed in TypeScript 5.0. |
| Module resolution | `bundler` or `nodenext` | Subpath exports are declared through the `exports` map only. |

The core engine has no runtime dependencies. The package's single `dependencies` entry is `uuid`, imported solely by the Drizzle schema helpers in `adapters/drizzle/{pg,mysql,sqlite}`; if you do not use Drizzle it never loads.

## Install

That is the whole install for the core engine, the memory adapter, the file adapter, the HTTP adapter, the Redis adapter, the Prisma adapter, and every server integration. Only Drizzle and the devtools panels need anything extra; see [optional peer dependencies](#optional-peer-dependencies).

## Your first check

Declare your permission schema

`createIam()` takes your actions, resources, and optionally scopes and role IDs as `as const` arrays, and returns builders constrained to them.

```ts title="src/lib/access.ts"
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import { createIam } from '@gentleduck/iam/core'

const access = createIam({
  actions: ['create', 'read', 'update', 'delete', 'manage'] as const,
  resources: ['post', 'comment', 'user', 'team'] as const,
  roles: ['viewer', 'editor', 'admin'] as const,
  scopes: ['org'] as const,
})
```

Define roles

Role builders are chainable and end in `build()`. `grantRead()` grants `read` on each resource; `grantCRUD()` grants create, read, update, and delete; `grantAll()` grants `*`.

```ts title="src/lib/access.ts"
const viewer = access.defineRole('viewer').grantRead('post', 'comment').build()

const editor = access
  .defineRole('editor')
  .inherits('viewer')
  .grant('create', 'post')
  .grant('update', 'post')
  .grant('create', 'comment')
  .build()

const admin = access
  .defineRole('admin')
  .inherits('editor')
  .grant('delete', 'post')
  .grant('delete', 'comment')
  .grantCRUD('user')
  .grant('manage', 'team')
  .build()
```

Create an adapter and the engine

`IamMemoryAdapter` seeds roles, policies, assignments, and subject attributes from a plain object. Pass `mode: 'production'` outside development; it defaults to `'development'`.

```ts title="src/lib/access.ts"
const adapter = new IamMemoryAdapter({
  roles: [viewer, editor, admin],
  assignments: {
    'user-1': ['admin'],
    'user-2': ['editor'],
    'user-3': ['viewer'],
  },
})

export const engine = access.createEngine({
  adapter,
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
})
```

Ask the engine questions

```ts
// Plain boolean, in both modes.
await engine.can('user-2', 'create', { type: 'post', attributes: {} }) // true
await engine.can('user-2', 'delete', { type: 'post', attributes: {} }) // false

// Full decision in development mode, plain boolean in production mode.
const decision = await engine.check('user-2', 'delete', { type: 'post', attributes: {} })

// Development mode only; throws in production mode.
const trace = await engine.explain('user-2', 'delete', { type: 'post', attributes: {} })
```

Batch checks for a UI gate

`permissions()` resolves the subject and loads the catalog once for the whole batch. Keys are built by `iamBuildPermissionKey`, so they read `[scope:]action:resource[:resourceId]`.

```ts
const map = await engine.permissions('user-2', [
  { action: 'create', resource: 'post' },
  { action: 'update', resource: 'post' },
  { action: 'delete', resource: 'post' },
  { action: 'manage', resource: 'team' },
])
// { 'create:post': true, 'update:post': true, 'delete:post': false, 'manage:team': false }
```

A batch of more than 1024 checks throws rather than failing closed: an oversized batch is a caller bug, not a denied request.

## The export map

Subpaths group into six families. Nothing in one family pulls in another.

`ROOT` re-exports `CORE` plus the cache and permission-key helpers. `COPT` holds the four optional core chunks that the barrel deliberately keeps out of the hot path. `AD`, `SRV`, `CLI`, `OPS`, and `DT` are reachable only by their own specifier.

### Every export path

| Export path | Main exports | Peer dependency | Runtime notes |
| --- | --- | --- | --- |
| `@gentleduck/iam` | Everything from `core`, plus `IamLRUCache`, `iamLRUCache`, `iamBuildPermissionKey`, `iamParsePermissionKey`, `iamSplitPermissionKey` | none | Pulls the whole core barrel; prefer `core` plus subpaths. |
| `@gentleduck/iam/core` | `createIam`, `IamEngine`, `iamEngine`, `iamFlushSharedCaches`, `defineRole`, `definePolicy`, `defineRule`, `when`, `evaluate`, `evaluateFast`, `evaluatePolicy`, `evaluatePolicyFast`, `indexPolicy`, `rolesToPolicy`, `resolveEffectiveRoles`, `MAX_INHERITANCE_DEPTH`, `resolve`, `matchesAction`, `matchesResource`, `explainEvaluation`, `POLICY_JSON_SCHEMA`, all type namespaces | none | Runs anywhere with ES2022. `core/validate` is intentionally not re-exported here. |
| `@gentleduck/iam/core/validate` | `validatePolicy`, `validateRole`, `validateRoles`, `parsePolicyRow`, `parseRoleRow`, `detectCatastrophicRegex`, `POLICY_LIMITS`, `VALID_ALGORITHMS`, `VALID_EFFECTS`, `VALID_OPERATORS`, `IamValidate` | none | Roughly 12 KB. Lazily loaded by `engine.admin` write paths; import directly only for standalone validation tooling. |
| `@gentleduck/iam/core/builder` | `PolicyBuilder`, `RoleBuilder`, `RuleBuilder`, `When`, `definePolicy`, `defineRole`, `defineRule`, `when` | none | Roughly 9 KB, config-time only. Apps that store policies as JSON never need it. |
| `@gentleduck/iam/core/explain` | `explainEvaluation`, `escapeHtml`, `Explain` | none | Development-mode tracer, a separate chunk. `escapeHtml` exists because trace strings carry request-supplied values. |
| `@gentleduck/iam/core/schema` | `POLICY_JSON_SCHEMA` | none | JSON Schema Draft 2020-12 document for `AccessControl.IPolicy`. |
| `@gentleduck/iam/adapters/memory` | `IamMemoryAdapter`, `iamMemoryAdapter`, `IamMemory` | none | In-process. Tests, demos, small single-node apps. |
| `@gentleduck/iam/adapters/file` | `IamFileAdapter`, `iamFileAdapter`, `IamFile` | none | You inject the filesystem driver, for example `await import('node:fs/promises')`. Statically imports `node:path`, so non-Node runtimes need that alias. |
| `@gentleduck/iam/adapters/prisma` | `IamPrismaAdapter`, `iamPrismaAdapter`, `IamPrisma` | none declared | Takes your Prisma client as a structural type (`IamPrisma.ILike`); `@prisma/client` is never imported by the package. Expects `accessPolicy`, `accessRole`, `accessAssignment`, and `accessSubjectAttr` models. |
| `@gentleduck/iam/adapters/drizzle` | `IamDrizzleAdapter`, `iamDrizzleAdapter`, `createIamDrizzleAdapter`, `IamDrizzle` | `drizzle-orm` | Type-only import of `drizzle-orm`, so the runtime cost is zero, but the types will not resolve without it installed. |
| `@gentleduck/iam/adapters/drizzle/pg` | `iamPolicies`, `iamRoles`, `iamAssignments`, `iamSubjectAttrs`, `combineAlgorithm`, `Pg` | `drizzle-orm` | Runtime import of `drizzle-orm/pg-core` and `uuid`. Postgres table definitions for `drizzle-kit`. |
| `@gentleduck/iam/adapters/drizzle/mysql` | `iamPolicies`, `iamRoles`, `iamAssignments`, `iamSubjectAttrs`, `Mysql` | `drizzle-orm` | Runtime import of `drizzle-orm/mysql-core` and `uuid`. |
| `@gentleduck/iam/adapters/drizzle/sqlite` | `iamPolicies`, `iamRoles`, `iamAssignments`, `iamSubjectAttrs`, `IAM_COMBINE_ALGORITHMS`, `Sqlite` | `drizzle-orm` | Runtime import of `drizzle-orm/sqlite-core` and `uuid`. Pass `json: 'string'` on the adapter for SQLite text columns. |
| `@gentleduck/iam/adapters/redis` | `IamRedisAdapter`, `iamRedisAdapter`, `IamRedis` | none declared | Takes your Redis client as a structural type (`IamRedis.ILike`); ioredis and node-redis v4 both satisfy it. |
| `@gentleduck/iam/adapters/http` | `IamHttpAdapter`, `iamHttpAdapter`, `IamHttp` | none | Uses `globalThis.fetch`, overridable through `config.fetch`. Ships retry, per-request timeout, and a circuit breaker. |
| `@gentleduck/iam/invalidators/redis` | `createIamRedisInvalidator`, `IamRedisInvalidator` | none declared | Takes a Redis pub/sub client. Statically imports `node:crypto` for the HMAC on broadcast messages, so it is Node-only. |
| `@gentleduck/iam/observability/metrics` | `iamCreateMetricsAggregator`, `IamMetrics` | none | Aggregates p50, p95, and p99 over `onMetrics` events. |
| `@gentleduck/iam/server/express` | `iamAccessMiddleware`, `iamGuard`, `iamAdminRouter`, `IamExpress` | none declared | Works against a minimal request shape; `express` is never imported. You pass the router factory in. |
| `@gentleduck/iam/server/nest` | `IamAuthorize`, `iamNestAccessGuard`, `createIamEngineProvider`, `createIamAdminOperations`, `IAM_ACCESS_METADATA_KEY`, `IAM_ACCESS_ENGINE_TOKEN`, `NestRequest`, `IamNest` | none declared | Decorator and guard are plain functions; `@nestjs/common` is never imported. |
| `@gentleduck/iam/server/hono` | `iamAccessMiddleware`, `iamGuard`, `iamBindAdminRouter`, `IamHono` | none declared | Works against a minimal context shape; `hono` is never imported. |
| `@gentleduck/iam/server/next` | `withIamAccess`, `createIamNextMiddleware`, `createIamAdminHandlers`, `IamNext` | none declared | App Router handlers and middleware; `next` is never imported. |
| `@gentleduck/iam/server/generic` | `createIamSubjectCan`, `iamExtractEnvironment`, `iamFireAdminMutation`, `iamDefaultCsrfCheck`, `iamNoticeCsrfDefaultIfNeeded`, `iamErrorToAuditString`, `IAM_METHOD_ACTION_MAP`, `IamAdminAudit` | none | The primitives the four framework wrappers are built on. Use it for a framework that has no wrapper. |
| `@gentleduck/iam/client/react` | `createIamAccessControl`, `createIamPermissionChecker`, `iamBuildPermissionKey`, `IamReactClient` | `react` (yours) | Only a type-only import of `ReactNode`; you pass the React namespace into `createIamAccessControl(React)`, so the package never pins a React copy. |
| `@gentleduck/iam/client/vue` | `createIamVueAccess`, `IAM_ACCESS_INJECTION_KEY` | `vue` (yours) | You pass the Vue API into `createIamVueAccess(vue)`; `vue` is never imported. |
| `@gentleduck/iam/client/vanilla` | `IamAccessClient`, `iamAccessClient` | none | Framework-free permission-map consumer, including `IamAccessClient.fromServer(url)`. |
| `@gentleduck/iam/dt` | `IamDevtools`, `IamDevtoolsInner`, `iamCreateFlowRecorder`, `iamEnsureDevtoolsStyles`, `IamDecisionInspector`, `IamFlowPanel`, `IamMetricsPanel`, `IamPoliciesPanel`, `IamRolesPanel`, `IamSubjectsPanel`, `IamTraceTree` | `react` | Devtools v1. Imports React for real, but nothing else: it injects the one stylesheet it owns. Development builds only. |
| `@gentleduck/iam/dt/v2` | `IamDevtoolsV2`, `IamDevtoolsInnerV2`, `iamCreateFlowRecorder`, `IamDecisionInspectorV2`, `IamFlowPanelV2`, `IamMetricsPanelV2`, `IamPoliciesPanelV2`, `IamRolesPanelV2`, `IamSubjectsPanelV2`, `IamTraceTreeV2` | `react`, `@gentleduck/libs`, `@gentleduck/registry-ui`, `lucide-react` | The same six panels rebuilt on duck-ui, so they inherit the host app's theme. Needs Tailwind v4 configured to scan this package: `@source "../node_modules/@gentleduck/iam/dist/dt/v2";` |

Every path also has a CommonJS build; `require('@gentleduck/iam/core')` resolves to `dist/core/index.cjs` with its own `.d.cts` types.

### Optional peer dependencies

Every peer is marked optional in `peerDependenciesMeta`, so a plain install never warns about the ones you do not use.

| Peer | Declared range | Needed by |
| --- | --- | --- |
| `drizzle-orm` | `>=0.30.0` | `adapters/drizzle` (types) and the three dialect schema entries (runtime). |
| `react` | `^19.2.6` | `dt` and `dt/v2`. The React client only imports a type. |
| `@gentleduck/libs` | `>=0.2.0` | `dt/v2`, for `cn()`. |
| `@gentleduck/registry-ui` | `>=0.5.0` | `dt/v2`, for the panel's UI components. |
| `lucide-react` | `>=0.400.0` | `dt/v2`, for the panel's icons. |

Install them only alongside the entry points that need them.

The v1 devtools panel needs only React:

The v2 panel needs the duck-ui trio as well:

Prisma and Redis are not peer dependencies at all. Both adapters accept your client through a structural interface, so you install `@prisma/client` or `ioredis` for your own reasons and hand the instance over:

```ts
import { IamPrismaAdapter } from '@gentleduck/iam/adapters/prisma'
import { IamRedisAdapter } from '@gentleduck/iam/adapters/redis'

const prismaAdapter = new IamPrismaAdapter({ prisma })
const redisAdapter = new IamRedisAdapter({ client: redis, keyPrefix: 'iam:' })
```

## Import examples

```ts
// Core: engine, config, builders, evaluators, types.
import { createIam, IamEngine, defineRole, definePolicy, when } from '@gentleduck/iam/core'

// Optional core chunks.
import { validatePolicy } from '@gentleduck/iam/core/validate'
import { POLICY_JSON_SCHEMA } from '@gentleduck/iam/core/schema'

// Storage adapters.
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import { IamFileAdapter } from '@gentleduck/iam/adapters/file'
import { IamPrismaAdapter } from '@gentleduck/iam/adapters/prisma'
import { IamDrizzleAdapter } from '@gentleduck/iam/adapters/drizzle'
import { IamRedisAdapter } from '@gentleduck/iam/adapters/redis'
import { IamHttpAdapter } from '@gentleduck/iam/adapters/http'

// Drizzle schemas, one dialect per entry.
import * as schema from '@gentleduck/iam/adapters/drizzle/pg'

// Server integrations.
import { iamGuard, iamAdminRouter } from '@gentleduck/iam/server/express'
import { iamGuard as honoGuard, iamBindAdminRouter } from '@gentleduck/iam/server/hono'
import { IamAuthorize, iamNestAccessGuard } from '@gentleduck/iam/server/nest'
import { withIamAccess, createIamAdminHandlers } from '@gentleduck/iam/server/next'
import { createIamSubjectCan } from '@gentleduck/iam/server/generic'

// Clients.
import { createIamAccessControl } from '@gentleduck/iam/client/react'
import { createIamVueAccess } from '@gentleduck/iam/client/vue'
import { IamAccessClient } from '@gentleduck/iam/client/vanilla'

// Operability.
import { createIamRedisInvalidator } from '@gentleduck/iam/invalidators/redis'
import { iamCreateMetricsAggregator } from '@gentleduck/iam/observability/metrics'
```

## Runtime notes

* **Node.** Everything works. `invalidators/redis` and `adapters/file` are the two Node-coupled entries, through `node:crypto` and `node:path`.
* **Edge and workers.** `core`, `adapters/memory`, `adapters/http`, `adapters/redis`, and every server integration run without Node built-ins. The HTTP adapter uses the platform `fetch`.
* **Browser.** Ship only `client/react`, `client/vue`, or `client/vanilla`. They consume a `PermissionMap` the server produced; the engine, the adapters, and your policy catalog never enter the browser bundle.

## TypeScript setup

```json title="tsconfig.json"
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

`strict` keeps const type parameter inference working for the role and policy builders. `bundler` resolution reads the `exports` map; `nodenext` works too. With `node10`-style resolution the subpaths will not resolve at all.

## Verify the install

```ts title="scripts/verify-iam.ts"
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import { createIam } from '@gentleduck/iam/core'

const access = createIam({ actions: ['read'] as const, resources: ['post'] as const, roles: ['viewer'] as const })
const viewer = access.defineRole('viewer').grant('read', 'post').build()
const engine = access.createEngine({
  adapter: new IamMemoryAdapter({ roles: [viewer], assignments: { u1: ['viewer'] } }),
  mode: 'production',
})

console.log(await engine.can('u1', 'read', { type: 'post', attributes: {} })) // true
console.log(await engine.healthCheck())
```

`healthCheck()` returns adapter latency and cache hit rate, which makes it a usable `/healthz` probe as well as an install check.

## Gotchas

`@gentleduck/iam` re-exports `core` plus `IamLRUCache`, `iamLRUCache`, `iamBuildPermissionKey`, `iamParsePermissionKey`, and `iamSplitPermissionKey`. Importing `IamMemoryAdapter`, middleware, or a client from the root fails. Use the subpath.

* Barrel imports cost roughly 41 KB gzipped. Subpath imports plus tree-shaking land real deployments at 15 to 25 KB; see [benchmarks](/duck-iam/benchmarks).
* `mode` defaults to `'development'`, which allocates a decision object per policy per request. Set it from your environment as shown above.
* SQLite Drizzle deployments must pass `json: 'string'` to the adapter, because the SQLite schema stores JSON columns as text.
* The devtools entries pull React for real, and `dt/v2` pulls duck-ui and `lucide-react` on top. Keep either behind a development-only import so it cannot reach a production bundle.

## See also

* [Introduction](/duck-iam/introduction) — the model and the docs routing map.
* [Quick start](/duck-iam/guides) — the end-to-end walkthrough after this page.
* [Adapters](/duck-iam/integrations/adapters) — choosing and configuring storage.
* [createIam()](/duck-iam/advanced/config/access-config) — every option on the config factory.

## Installation FAQ

Do I need every peer dependency?

No. All five declared peers are optional, and only `drizzle-orm` and the devtools dependencies are ever required.
Prisma and Redis are not peers at all: those adapters accept your client through a structural interface.

Why do the package requirements differ from the repository's tooling requirements?

The published package targets Node 18 and newer. The monorepo also builds docs, examples, and workspace
tooling that may need newer Node or Bun versions.

Can I import only the pieces I need?

Yes, and you should. Every adapter, server integration, and client is its own entry, so framework-specific
code stays opt-in and tree-shakes cleanly.

Do I have to use createIam() on day one?

No. The standalone builders `defineRole`, `definePolicy`, `defineRule`, and `when` work without it, and you
can construct `IamEngine` directly. Adopt `createIam()` when you want compile-time validation of actions,
resources, scopes, and role IDs.

What should I seed first in a new project?

Stable role definitions, a small set of core policies, and the assignments needed to boot the app. Subject
attributes can arrive later, as your domain data does.

Why is autocomplete weak right after installing?

Autocomplete comes from type information, not from the install. Pass `as const` arrays to `createIam()` for
actions, resources, scopes, and roles, and add the `context` phantom field if you want typed dot-paths and
`$`-reference suggestions.