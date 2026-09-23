duck-iam (`@gentleduck/iam`, version 5.9.0) decides what an authenticated subject may do. It runs role-based and attribute-based access control through one evaluation pipeline, loads its catalog from a pluggable adapter, and ships server middleware and client permission maps for the common frameworks.

## What duck-iam is

An authorization engine. You declare your actions, resources, roles, and scopes once; define roles with permissions and policies with rules and conditions; then ask the engine questions:

```ts
await engine.can('user-1', 'read', { type: 'post', attributes: {} }) // boolean
```

Actions, resources, scopes, and role IDs are constrained at compile time through const type parameters on `createIam()`. A misspelled action fails the type check before it can fail a request.

duck-iam is not authentication. It answers "may this subject do this?", never "who is this?". Pair it with [duck-auth](/duck-auth/introduction) for the identity half; the [auth bridge guide](/duck-iam/guides/auth-bridge) wires the two together.

## Why one engine for roles and policies

RBAC is simple and rigid: it cannot express "editors may update only their own posts". ABAC is expressive and verbose: writing every ordinary role grant as a policy rule is tedious.

duck-iam does both, and does not keep two code paths. Roles are compiled into a synthetic policy by `rolesToPolicy()`, so a role grant and an attribute policy hit the same evaluator, the same condition operators, and the same combining algorithms. There is no second set of semantics to reason about.

* **Role inheritance** — `admin` inherits `editor` inherits `viewer`; permissions cascade. Depth is capped by `MAX_INHERITANCE_DEPTH` (32) and cycles are cut by a shallowest-depth memo, so a bad role graph cannot hang a check.
* **Policies with conditions** — allow `delete` on `post` when `resource.attributes.ownerId` equals `$subject.id`.
* **Four in-policy combining algorithms** — `deny-overrides`, `allow-overrides`, `first-match`, `highest-priority`.
* **Three cross-policy combine modes** — `and` (default), `allow-overrides`, `first-applicable`.
* **19 condition operators** — `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `contains`, `not_contains`, `starts_with`, `ends_with`, `matches`, `exists`, `not_exists`, `subset_of`, `superset_of`, `before`, `after`.
* **Scoped roles** — one subject can be `admin` in `org-1` and `viewer` in `org-2`.
* **Explain traces** — `engine.explain()` returns which policies were considered, which rules matched, and which conditions passed or failed, with actual versus expected values.

## Feature map

| Feature | What it means |
| --- | --- |
| Unified RBAC + ABAC | Roles and policies share one pipeline. Roles are converted to a synthetic RBAC policy at load time and combined with your own policies. |
| Type-safe config | `createIam()` constrains actions, resources, scopes, and role IDs at the type level and threads them through every builder. |
| Combining algorithms | Four in-policy algorithms; three cross-policy modes via `IamEngineTypes.IConfig.policyCombine`. |
| Multi-tenant scopes | Scoped role assignments: different roles per organization, workspace, or project. |
| Pluggable adapters | Memory, file, Prisma, Drizzle, Redis, HTTP, or your own implementation of `IamAdapter.IAdapter`. `IamAdapter.IReadOptions.signal` carries per-call `AbortSignal` cancellation. |
| Server and client integrations | Express, Hono, NestJS, Next.js middleware; React, Vue, and vanilla clients. Each ships its own typed namespace, for example `IamExpress`, `IamReactClient`. |
| Evaluation hooks | `beforeEvaluate`, `afterEvaluate`, `onDeny`, `onError`, `onPolicyError`, `onMetrics`, `onMutation`. `onMetrics` is primitive-only and fires in both modes; `onMutation` fires after every `engine.admin` write. |
| Development and production mode | Both take their verdict from the compiled table. Development also runs the interpreter to recover the `reason`, `policy`, and `rule` provenance the table erases, returns `AccessControl.IDecision` objects, and enables `explain()`. Production returns plain booleans. |
| Validation and limits | `validateRoles()` and `validatePolicy()` emit `IamValidate.IIssue` with closed-set codes. `POLICY_LIMITS` caps rule, action, and resource counts; `MAX_INHERITANCE_DEPTH` caps role chains. |
| Operability surface | `engine.preload()`, `engine.healthCheck()`, `engine.stats.get()`, `engine.cache.invalidate*()`, `engine.admin.export()` and `import()`, `IConfig.invalidator`, adapter timeouts, explicit fail-open opt-in. |

## System architecture

The engine sits between your request handlers and your policy storage. Everything above the adapter line is in-process and cache-backed; the adapter is the only thing that talks to a database.

**Engine.** Construct an `IamEngine` with an `IamEngineTypes.IConfig`, then call `can()`, `check()`, `permissions()`, `explain()`, or `authorize()`. `RES` and `LOAD` are the cache-backed loaders; a steady-state request hits cache and never reaches `AD`.

**Adapter.** The storage backend, implementing policy, role, and subject stores. `IamMemoryAdapter` is for tests and small apps; `IamPrismaAdapter` and `IamDrizzleAdapter` back production databases; `IamHttpAdapter` reads from a remote authorization service.

**Policies.** ABAC rules grouped into policy objects. Each policy carries a combining algorithm and a rule list; each rule carries an effect, target actions and resources, conditions, and a priority. Policies evaluate independently, then `EV` combines them with `policyCombine`.

**Roles.** RBAC definitions with permissions and optional inheritance, converted into a synthetic policy so they meet your own policies inside `EV`. Role permissions may carry conditions of their own.

**Invalidator and metrics.** `INV` broadcasts cache invalidation across nodes so a policy write on one instance is visible on all of them. `MET` aggregates the `onMetrics` events that `HOOK` emits.

## How a check flows

A call to `engine.can()` walks five layers: entry validation, catalog load, subject preparation, evaluation, and reporting. It fails closed at every one of them — an adapter timeout, a subject-resolution failure, or a throwing hook resolves to deny, never to allow.

1. **Resolve subject.** Load assigned roles, scoped roles, and attributes; close roles over `inherits`.
2. **Enrich scoped roles.** When the request carries a scope, merge the roles assigned in that scope.
3. **Load the catalog.** Fetch policies, generate the RBAC policy from roles, and merge. Concurrent misses collapse into one adapter call.
4. **Evaluate.** Skip policies whose targets do not match, match rules by action and resource, evaluate conditions, apply each policy's algorithm, then combine across policies. Under the default `and`, any deny is final; policies that do not apply are skipped rather than folded in as default-deny.
5. **Report.** Return an `AccessControl.IDecision` in development mode or a plain boolean in production, and fire the reporting hooks.

The [evaluation pipeline](/duck-iam/core/evaluation) page walks each layer with the source; [rule matching](/duck-iam/core/rule-matching) covers step 4 in detail.

## Quick example

```ts
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import { createIam } from '@gentleduck/iam/core'

const access = createIam({
  actions: ['create', 'read', 'update', 'delete', 'manage'] as const,
  resources: ['post', 'comment', 'user'] as const,
  roles: ['viewer', 'editor', 'admin'] as const,
})

const viewer = access.defineRole('viewer').grantRead('post', 'comment').build()
const editor = access.defineRole('editor').inherits('viewer').grant('create', 'post').grant('update', 'post').build()
const admin = access.defineRole('admin').inherits('editor').grant('delete', 'post').grant('manage', 'user').build()

const adapter = new IamMemoryAdapter({
  roles: [viewer, editor, admin],
  assignments: { 'user-1': ['editor'], 'user-2': ['viewer'] },
})

const engine = access.createEngine({ adapter })

await engine.can('user-1', 'read', { type: 'post', attributes: {} }) // true, inherited from viewer
await engine.can('user-1', 'create', { type: 'post', attributes: {} }) // true, direct editor grant
await engine.can('user-2', 'create', { type: 'post', attributes: {} }) // false, viewer cannot create
await engine.can('user-1', 'delete', { type: 'post', attributes: {} }) // false, only admin may delete
```

Adapters, server middleware, and clients live behind subpath imports; the root barrel exports only the core surface. See [installation](/duck-iam/installation) for the full export map.

## Which page do I need

| Area | Page | What it covers |
| --- | --- | --- |
| Getting started | [Installation](/duck-iam/installation) | Every export path, its peer dependencies, and your first check. |
| Getting started | [How it compares](/duck-iam/comparison) | Where duck-iam sits against Casbin, CASL, Oso, OPA, Cedar, and AccessControl.js, and when to pick something else. |
| Getting started | [Types and namespaces](/duck-iam/types) | The complete namespace and type map, one line per member. |
| Core | [Core concepts](/duck-iam/core) | The model: subjects, roles, policies, rules, decisions. |
| Core | [Primitives](/duck-iam/core/primitives) | Attribute values, resources, environments, and their type constraints. |
| Core | [Evaluation pipeline](/duck-iam/core/evaluation) | The five layers of a check, in order, with fail-closed behaviour. |
| Core | [Rule matching](/duck-iam/core/rule-matching) | Target matching, wildcards, the rule index, and the precomputed table. |
| Core | [Cross-policy combination](/duck-iam/core/cross-policy) | `and`, `allow-overrides`, `first-applicable`, and NotApplicable handling. |
| Core | [Policies](/duck-iam/core/policies) | Building policies, rules, targets, conditions, nesting, algorithms, `$`-variables. |
| Core | [Roles](/duck-iam/core/roles) | Defining roles, inheritance, type-safe roles, scoped roles, conditional permissions, `rolesToPolicy`. |
| Guides | [Quick start](/duck-iam/guides) | End to end: roles, policies, middleware, client hooks. |
| Guides | [Production hardening](/duck-iam/guides/production) | TTL trade-offs, multi-node invalidation, fail-closed defaults, SLO targets. |
| Guides | [Pairing with duck-auth](/duck-iam/guides/auth-bridge) | Projecting an authenticated session onto a duck-iam subject. |
| Guides | [Cookbook](/duck-iam/guides/cookbook) | Owner-only access, public versus private, time-bound grants, MFA gates. |
| Guides | [Troubleshooting](/duck-iam/guides/troubleshooting) | Symptom, cause, and fix for the errors the engine actually throws. |
| Course | [Course](/duck-iam/course) | Eight chapters building one app from first check to production readiness. |
| Advanced | [Config](/duck-iam/advanced/config) | `createIam()` options, its methods, typed context, typed `$`-paths. |
| Advanced | [Engine](/duck-iam/advanced/engine) | Methods, caching, hooks, mode switching, and the admin API. |
| Advanced | [Explain and debug](/duck-iam/advanced/explain) | The `Explain.IResult` shape and how to read a trace. |
| Advanced | [Validation](/duck-iam/advanced/validation) | `validatePolicy`, `validateRoles`, and every issue code. |
| Advanced | [JSON schema](/duck-iam/advanced/json-schema) | `POLICY_JSON_SCHEMA` and its consumers. |
| Advanced | [Utilities](/duck-iam/advanced/utilities) | Exported helpers: caches, permission keys, shared-cache flushing. |
| Advanced | [Devtools panel](/duck-iam/advanced/devtools) | Mounting `IamDevtools`, its panels, and why it must not ship to production. |
| Integrations | [Adapters](/duck-iam/integrations/adapters) | Memory, file, Drizzle, Prisma, Redis, HTTP, and writing your own. |
| Integrations | [Server](/duck-iam/integrations/server) | Express, Hono, NestJS, Next.js, and the generic helpers underneath them. |
| Integrations | [Client](/duck-iam/integrations/client) | `PermissionMap`, and the vanilla, React, and Vue consumers. |
| Integrations | [Metrics aggregator](/duck-iam/integrations/observability/metrics) | p50, p95, p99 over `onMetrics` events. |
| Integrations | [Redis invalidator](/duck-iam/integrations/invalidators/redis) | Cross-instance cache invalidation over pub/sub. |
| Benchmarks | [Benchmarks](/duck-iam/benchmarks) | Measured numbers, the methodology behind them, and where the time goes. |
| Changelog | [Changelog](/duck-iam/changelog) | Every release from 1.0.0 to 5.9.0. |

## Gotchas

`IamEngineTypes.IConfig.mode` defaults to `'production'`. It used to default to `'development'`, so an engine that never set it ran the interpreter alongside the table and allocated an `AccessControl.IDecision` per policy per request. Rich decisions and `explain()` are now opt-in: pass `mode: 'development'` to get them. See [modes](/duck-iam/advanced/engine/modes).

* `engine.explain()` throws in production mode. That is deliberate: the tracer is a lazily imported chunk that production bundles never load.
* The root barrel `@gentleduck/iam` exports the core surface only. Adapters, server middleware, clients, invalidators, metrics, and the devtools live behind subpaths, and importing the barrel pulls roughly 41 KB gzipped where subpath imports land at 15 to 25 KB.
* `defaultEffect: 'allow'` throws at construction unless you also pass `allowFailOpen: true`, and even then logs a startup warning. Failing open is opt-in and loud on purpose.
* The compiled table addresses roles with a 32-bit grant mask, so a catalog over 32 roles cannot be compiled. Nothing denies and nothing throws to the caller: the engine warns once, drops to the interpreter for every subsequent request in both modes, and reports it on `healthCheck().compiledTable`. Verdicts are unchanged; the O(1) lookup is not. The flag is latched for the life of the engine — deleting roles back under 32 does not restore the table, only a new engine does.

## See also

* [Installation](/duck-iam/installation) — every export path and its peer dependencies.
* [Core concepts](/duck-iam/core) — the model in depth.
* [Quick start](/duck-iam/guides) — the end-to-end walkthrough.
* [How it compares](/duck-iam/comparison) — the honest trade-offs against other engines.
* [@gentleduck/auth](/duck-auth/introduction) — the identity half. duck-auth proves who the caller is; duck-iam decides what they may do.

## Quick FAQ

Is duck-iam meant for full-stack apps or backend-only services?

Both. The engine is server-side, but the package also ships server integrations, client permission-map
consumers, and adapters that fit monoliths, APIs, full-stack apps, and shared authorization services.

How does duck-iam stay framework-agnostic without hard runtime dependencies?

It uses minimal request and context interfaces instead of importing whole server frameworks. The React and
Vue integrations take the framework API as an argument rather than importing it, and the server
integrations work against small request shapes, so you only pay for the subpaths you import.

Which adapter should I start with?

Start with `IamMemoryAdapter` for tests, local development, and prototypes. Move to `IamPrismaAdapter` or
`IamDrizzleAdapter` when policies, roles, and assignments need to persist. Use `IamHttpAdapter` when the
authorization catalog already lives behind a separate service.

Can I keep my app tables and access tables in the same database?

Yes. duck-iam needs its own policies, roles, assignments, and subject-attribute storage. Those tables or
models can live alongside the rest of your application data.

Is it RBAC or ABAC?

Both, in one evaluation pass. `rolesToPolicy()` compiles roles into ABAC rules, so a role grant and an
attribute policy go through the same evaluator and combine with the same algorithms. There is no second
code path to reason about.

Can it accidentally allow something?

It fails closed by default: `defaultEffect` is `deny`, and evaluation errors, adapter timeouts, and
subject-resolution failures all resolve to deny. A single broken policy is treated as not applicable and
routed to the `onPolicyError` hook rather than taking down every check.

## Contributing

Issues and pull requests go to the [GitHub repository](https://github.com/gentleeduck/duck-iam). Security disclosures follow the process in the package's `SECURITY.md`.