duck-iam ships its types inside per-module namespaces and its runtime values as flat names. This page is the map for 5.9.0: every exported namespace, its members, and the flat runtime exports, one line each, with the import path each comes from. Use it as the type-import contract when you write adapters, wrappers, or your own tooling on top of the engine.

## Naming convention

Three rules hold across the whole package.

1. **Interfaces carry the `I` prefix** - `IPolicy`, `IRule`, `IDecision`, `IAccessRequest`, `IConfig`.
2. **Type aliases stay bare** - `Effect`, `Operator`, `Mode`, `PolicyCombine`, `CombiningAlgorithm`, `ValidationCode`.
3. **Runtime values are flat and `Iam`-prefixed** - `IamEngine`, `IamMemoryAdapter`, `IamLRUCache`, `iamBuildPermissionKey`. Free functions carry the prefix too (`iamEvaluateFast`, `iamIndexPolicy`, `iamResolveValue`), and constants use the screaming form (`IAM_MAX_CONDITION_DEPTH`). Namespaces are type-only; they add nothing to the bundle.

```ts
import type { AccessControl, IamRequest } from '@gentleduck/iam'

function decide(policy: AccessControl.IPolicy, req: IamRequest.IAccessRequest): AccessControl.IDecision {
  // ...
}
```

Namespaces exist so short member names can repeat without colliding. `IConfig` is a member of `IamEngineTypes`, `IamHttp`, `IamRedis`, `IamDrizzle`, `IamRedisInvalidator`, and `IamMetrics`; `IResult` is a member of both `Explain` and `IamValidate`. The namespace prefix is what disambiguates them at the call site.

## Where each namespace lives

Namespaces are grouped by the `exports` entry that publishes them.

The root entry re-exports everything in `@gentleduck/iam/core`, so `AccessControl` through `Evaluate` are reachable from either specifier. `IamValidate` is a special case: `core/index.ts` re-exports the namespace as a type only and deliberately does **not** re-export the validator functions, so importing `validatePolicy` requires the `@gentleduck/iam/core/validate` subpath. Everything under `adapters/*`, `server/*`, `client/*`, `invalidators/*`, and `observability/*` is only reachable through its own subpath.

## Core namespaces

### `AccessControl`

`import type { AccessControl } from '@gentleduck/iam'` - the policy and decision vocabulary.

| Namespaced name | Kind | One line |
|---|---|---|
| `AccessControl.Effect` | type | `'allow' \| 'deny'` - the outcome a matched rule produces |
| `AccessControl.Operator` | type | The 19 comparison operators the condition engine accepts |
| `AccessControl.ICondition` | interface | Leaf condition: `field` dot-path, `operator`, optional `value` |
| `AccessControl.IConditionAll` | interface | `{ all: [...] }` group - every child must hold |
| `AccessControl.IConditionAny` | interface | `{ any: [...] }` group - at least one child must hold |
| `AccessControl.IConditionNone` | interface | `{ none: [...] }` group - no child may hold |
| `AccessControl.IConditionGroup` | type | Union of the three named group arms; exactly one key present |
| `AccessControl.IRule` | interface | `id`, `effect`, `priority`, `actions`, `resources`, `conditions`, optional `description` / `metadata` |
| `AccessControl.CombiningAlgorithm` | type | Intra-policy conflict resolution: `deny-overrides`, `allow-overrides`, `first-match`, `highest-priority` |
| `AccessControl.PolicyCombine` | type | Cross-policy strategy: `and`, `allow-overrides`, `first-applicable` |
| `AccessControl.IPolicy` | interface | Named rule set plus `algorithm`, optional `version` and `targets` |
| `AccessControl.IPermission` | interface | One RBAC grant: `action`, `resource`, optional `scope` and `conditions` |
| `AccessControl.IRole` | interface | RBAC role: `id`, `name`, `permissions`, optional `inherits`, `scope`, `metadata` |
| `AccessControl.IDecision` | interface | `allowed`, `effect`, `reason`, `duration`, `timestamp`, optional `rule`, `policy`, `applicable` |
| `AccessControl.Mode` | type | `'development' \| 'production'` |
| `AccessControl.ModeResult` | type | Mode-conditional return: `boolean` in production, `IDecision` in development |
| `AccessControl.ModePermissionMap` | type | Mode-conditional map: `Record<string, boolean>` in production, `IamClient.PermissionMap` in development |
| `AccessControl.OpFn` | type | Signature of one operator implementation - `(field, value) => boolean` |
| `AccessControl.PolicyErrorHandler` | type | The `(error, policyId) => void` callback a throwing policy is routed to |

### `IamRequest`

`import type { IamRequest } from '@gentleduck/iam'` - the request the engine evaluates.

| Namespaced name | Kind | One line |
|---|---|---|
| `IamRequest.IScopedRole` | interface | A role assignment restricted to a scope, with optional per-grant `attributes` |
| `IamRequest.ISubject` | interface | Resolved subject: `id`, effective `roles`, optional `scopedRoles`, `attributes` |
| `IamRequest.IResource` | interface | Target resource: `type`, optional `id`, `attributes` |
| `IamRequest.IEnvironment` | interface | Request-level bag: `ip`, `userAgent`, `timestamp`, `now`, plus arbitrary keys |
| `IamRequest.IAccessRequest` | interface | `subject` + `action` + `resource` + optional `scope` and `environment` |

### `IamPrimitives`

`import type { IamPrimitives } from '@gentleduck/iam'` - the leaves of the type system.

| Namespaced name | Kind | One line |
|---|---|---|
| `IamPrimitives.Scalar` | type | `string \| number \| boolean \| null` |
| `IamPrimitives.AttributeValue` | type | `Scalar \| Scalar[] \| Record<string, Scalar>` - anything an attribute bag may hold |
| `IamPrimitives.Attributes` | type | `Record<string, AttributeValue>` |

### `IamClient`

`import type { IamClient } from '@gentleduck/iam'` - permission-map keys shared by server and client.

| Namespaced name | Kind | One line |
|---|---|---|
| `IamClient.PermissionKey` | type | The four key shapes: `action:resource`, `action:resource:id`, `scope:action:resource`, `scope:action:resource:id` |
| `IamClient.PermissionMap` | type | `Record<PermissionKey, boolean>` - the full (theoretical) map |
| `IamClient.PartialPermissionMap` | type | `Partial<PermissionMap>` - what `engine.permissions()` actually returns |
| `IamClient.IPermissionCheck` | interface | One batch entry: `action`, `resource`, optional `resourceId`, optional `scope` |

### `IamAdapter`

`import type { IamAdapter } from '@gentleduck/iam'` - the storage contract.

| Namespaced name | Kind | One line |
|---|---|---|
| `IamAdapter.IReadOptions` | interface | `{ signal?: AbortSignal }` - read-time cancellation token from the engine |
| `IamAdapter.IAssignOptions` | interface | `startsAt`, `expiresAt`, `attributes` extras for `assignRole` |
| `IamAdapter.IPolicyStore` | interface | `listPolicies`, `getPolicy`, `savePolicy`, `deletePolicy` |
| `IamAdapter.IRoleStore` | interface | `listRoles`, `getRole`, `saveRole`, `deleteRole` |
| `IamAdapter.ISubjectStore` | interface | Role assignments and attributes; `getSubjectScopedRoles` and `updateAssignmentScope` are optional |
| `IamAdapter.IAdapter` | interface | The three stores combined - what `IamEngineTypes.IConfig.adapter` expects |
| `IamAdapter.RowErrorHandler` | type | Callback for a stored row that fails to parse, so one bad row does not sink a list read |
| `IamAdapter.ITripleRow` | interface | The `(subjectId, roleId, scope)` triple shared by the batch assignment shapes |
| `IamAdapter.IAssignRow` / `IRevokeRow` | interface | One row of a batch `assignRoles` / `revokeRoles` call |
| `IamAdapter.IRevokeOptions` | interface | Revoke-side counterpart of `IAssignOptions` |
| `IamAdapter.IActorOptions` | interface | Who performed the write, carried through to the `onMutation` audit event |

### `DotPath`

`import type { DotPath } from '@gentleduck/iam'` - the type machinery behind typed field paths, typed `$`-references, and typed attribute keys. See [typed context](/duck-iam/advanced/config/context) for how these are wired into the builders.

| Namespaced name | Kind | One line |
|---|---|---|
| `DotPath.DotPaths` | type | Union of every reachable path through `T`; arrays and functions are leaves, index signatures produce `never` |
| `DotPath.PathValue` | type | Value type at a dot path in `T`, or `never` if the path does not exist |
| `DotPath.FlexibleDotPaths` | type | `DotPaths<T>` when the context is closed; adds `(string & {})` when any branch has an open index signature |
| `DotPath.DollarPaths` | type | Every member of `DotPaths<TContext>` with a `$` prepended - the cross-reference union |
| `DotPath.FlexibleDollarPaths` | type | `DollarPaths<TContext> \| (string & {})`, used at method signatures so the IDE renders the literals |
| `DotPath.ConditionValue` | type | Adapts a value type for builder inputs, adding `$`-paths only to the string-capable half |
| `DotPath.FieldValue` | type | `ConditionValue` applied at a context dot path; falls back to `AttributeValue` on mismatch |
| `DotPath.SubjectAttrShape` | type | Extracts `TContext['subject']['attributes']`, or `never` |
| `DotPath.ResourceAttrShape` | type | Extracts `TContext['resource']['attributes']`, or `never` |
| `DotPath.EnvAttrShape` | type | Extracts `TContext['environment']`, or `never` |
| `DotPath.SubjectAttrs` | type | Dot-path keys into the subject attribute bag - the `key` argument of `When.attr()` |
| `DotPath.ResourceAttrs` | type | Dot-path keys into the resource attribute bag |
| `DotPath.EnvAttrs` | type | Dot-path keys into the environment bag - the `key` argument of `When.env()` |
| `DotPath.ResourceAttrMap` | type | Extracts the optional `TContext['resourceAttributes']` per-resource map, or `never` |
| `DotPath.ResolvedResourceAttrs` | type | Resource attribute shape narrowed to one resource; merged union for `'*'` and unknown resources |
| `DotPath.ResolvedResourceAttrPaths` | type | Dot-path keys into `ResolvedResourceAttrs` - the `key` argument of `When.resourceAttr()` |
| `DotPath.AttrValueAt` | type | Raw value at a dot path inside an attribute bag; `never` on an invalid path |
| `DotPath.AttrValue` | type | `AttrValueAt` with `undefined` stripped, falling back to `AttributeValue` |
| `DotPath.IAnyAttributes` | interface | Open attribute bag - `[key: string]: IamPrimitives.AttributeValue` |
| `DotPath.IDefaultContext` | interface | Default context shape (`action`, `subject`, `resource`, `environment`, `scope`) with open bags |

### `IamConfig`

`import type { IamConfig } from '@gentleduck/iam'` - the shapes around `createIam()`.

| Namespaced name | Kind | One line |
|---|---|---|
| `IamConfig.IAccessConfigInput` | interface | Input to `createIam()`: `actions`, `resources`, optional `scopes`, `roles`, `context` |
| `IamConfig.IAccessConfig` | interface | What `createIam()` returns - four readonly arrays and eight methods |

### `IamEngineTypes`

`import type { IamEngineTypes } from '@gentleduck/iam'` - engine configuration and lifecycle. The class itself is the flat `IamEngine`; the namespace is suffixed `Types` to avoid the clash. Documented in depth under [engine](/duck-iam/advanced/engine).

| Namespaced name | Kind | One line |
|---|---|---|
| `IamEngineTypes.IConfig` | interface | Engine options: `adapter`, `defaultEffect`, `cacheTTL`, `maxCacheSize`, `hooks`, `mode`, `policyCombine`, `maxPolicies`, `maxRoles`, `allowFailOpen`, `adapterTimeoutMs`, `maxConcurrentSubjectLoads`, `invalidator`, `scopeMode`, `scopeCombine` |
| `IamEngineTypes.IHooks` | interface | `beforeEvaluate`, `afterEvaluate`, `onDeny`, `onError`, `onPolicyError`, `onMetrics`, `onMutation` |
| `IamEngineTypes.IMetricsEvent` | interface | Primitive-only event: `subjectId`, `action`, `resource`, `allowed`, `durationMs`, `mode`, `failOpen` |
| `IamEngineTypes.IAdmin` | interface | The `engine.admin` surface - policy, role, assignment, attribute, export and import methods |
| `IamEngineTypes.ISnapshot` | interface | Schema-versioned config snapshot: `schemaVersion`, `exportedAt`, `policies`, `roles` |
| `IamEngineTypes.IImportOptions` | interface | `{ mode?: 'merge' \| 'replace' }` |
| `IamEngineTypes.IImportResult` | interface | `policiesAdded`, `policiesDeleted`, `rolesAdded`, `rolesDeleted` |
| `IamEngineTypes.IInvalidator` | interface | Cross-instance invalidation contract - `publish` and `subscribe` |
| `IamEngineTypes.IInvalidateAll` | interface | `{ kind: 'all' }` |
| `IamEngineTypes.IInvalidatePolicies` | interface | `{ kind: 'policies' }` |
| `IamEngineTypes.IInvalidateRoles` | interface | `{ kind: 'roles', roleId? }` |
| `IamEngineTypes.IInvalidateSubject` | interface | `{ kind: 'subject', subjectId }` |
| `IamEngineTypes.IInvalidateEvent` | type | Discriminated union of the four invalidate events, keyed on `kind` |
| `IamEngineTypes.IHealth` | interface | `engine.healthCheck()` output: `ok`, `adapter`, `cacheHitRate`, `adapterLatencyMs`, optional `lastError` and `compiledTable` (present only when the 32-role limit has been tripped) |
| `IamEngineTypes.IMutationEvent` | type | Union of the eight admin-write events, keyed on `type`: policy saved/deleted, role saved/deleted, role assigned/revoked, role scope changed, attributes set |
| `IamEngineTypes.IMutationBase` | interface | The fields every `IMutationEvent` arm carries |
| `IamEngineTypes.IAssignRow` / `IRevokeRow` / `IMoveRow` | type / interface | Batch rows for `admin.assignRoles`, `revokeRoles`, and scope moves |
| `IamEngineTypes.IAssignOptions` / `IRevokeOptions` / `IActorOptions` | type / interface | Per-write extras: validity window, attributes, and the acting principal |

### `Evaluate`

`import type { Evaluate } from '@gentleduck/iam'` - internals of the evaluation pass, exported so tooling can type against them.

| Namespaced name | Kind | One line |
|---|---|---|
| `Evaluate.Combiner` | type | Signature of one combining-algorithm implementation |
| `Evaluate.IIndexedRule` | interface | A rule plus its pre-split `actions` / `resources` sets and wildcard flags |
| `Evaluate.IPolicyRuleIndex` | interface | Per-policy lookup index: literal buckets, two half-wildcard buckets, `wildcardBoth`, and `precomputed` |

### `Explain`

`import type { Explain } from '@gentleduck/iam'` (values from `@gentleduck/iam/core/explain`) - the explain trace. See [explain](/duck-iam/advanced/explain).

| Namespaced name | Kind | One line |
|---|---|---|
| `Explain.ILeafTrace` | interface | One evaluated condition leaf with its resolved actual and expected values |
| `Explain.IGroupTrace` | interface | One `all` / `any` / `none` node with its children |
| `Explain.Trace` | type | `ILeafTrace \| IGroupTrace` |
| `Explain.IRuleTrace` | interface | One rule: whether its target and conditions matched, plus the condition trace |
| `Explain.IPolicyTrace` | interface | One policy: applicability, algorithm, and its rule traces |
| `Explain.IResult` | interface | Whole-request trace: subject info, policy traces, final decision, human summary |
| `Explain.ISubjectInfo` | interface | The resolved subject as the trace saw it |

### `IamValidate`

`import type { IamValidate } from '@gentleduck/iam'`; the validator functions come from `@gentleduck/iam/core/validate`. See [validation](/duck-iam/advanced/validation).

| Namespaced name | Kind | One line |
|---|---|---|
| `IamValidate.ValidationCode` | type | The closed set of 24 machine-readable issue codes |
| `IamValidate.IIssue` | interface | `type` (`'error' \| 'warning'`), `code`, `message`, optional `roleId`, optional `path` |
| `IamValidate.IResult` | interface | `valid` (false only when an error-level issue exists) and `issues` |

## Integration namespaces

Each integration subpath publishes its own option-bag namespace. All are type-only.

| Namespace | Import path | Members |
|---|---|---|
| `IamMemory` | `@gentleduck/iam/adapters/memory` | `IInit` - seed `policies`, `roles`, `assignments`, `attributes` |
| `IamFile` | `@gentleduck/iam/adapters/file` | `IFS` (minimal `node:fs/promises` surface), `IInit`, `IState` (on-disk document shape) |
| `IamPrisma` | `@gentleduck/iam/adapters/prisma` | `IPolicyRow`, `IRoleRow`, `IAssignmentRow`, `IAttrRow`, `ILike` (structural Prisma client) |
| `IamDrizzle` | `@gentleduck/iam/adapters/drizzle` | `IConfig`, `PolicyRow`, `RoleRow`, `AssignmentRow`, `AttrRow`, `DrizzleTable`, `AnyDrizzleDb` |
| `Pg` | `@gentleduck/iam/adapters/drizzle/pg` | `PolicyRow`, `RoleRow`, `AssignmentRow`, `AttrRow` |
| `Mysql` | `@gentleduck/iam/adapters/drizzle/mysql` | `PolicyRow`, `RoleRow`, `AssignmentRow`, `AttrRow` |
| `Sqlite` | `@gentleduck/iam/adapters/drizzle/sqlite` | `PolicyRow`, `RoleRow`, `AssignmentRow`, `AttrRow` |
| `IamRedis` | `@gentleduck/iam/adapters/redis` | `ILike` (ioredis / node-redis common surface), `IConfig` |
| `IamHttp` | `@gentleduck/iam/adapters/http` | `IConfig` - endpoint, fetch override, retry, circuit-breaker tuning |
| `IamRedisInvalidator` | `@gentleduck/iam/invalidators/redis` | `IPubSubLike`, `IConfig` |
| `IamMetrics` | `@gentleduck/iam/observability/metrics` | `IAggregator`, `ISnapshot`, `IConfig` |
| `IamExpress` | `@gentleduck/iam/server/express` | `IOptions`, `IAdminAuthorize`, `IAdminRouterOptions` |
| `IamHono` | `@gentleduck/iam/server/hono` | `IOptions`, `IAdminAuthorize`, `IAdminOptions`, `IRouterLike` |
| `IamNest` | `@gentleduck/iam/server/nest` | `IAuthorizeMeta`, `IGuardOptions`, `IAdminAuthorize`, `IAdminOptions` |
| `IamNext` | `@gentleduck/iam/server/next` | `IWithAccessOptions`, `IMiddlewareOptions`, `IAdminAuthorize`, `IAdminOptions` |
| `IamAdminAudit` | `@gentleduck/iam/server/generic` | `Action`, `Target`, `IEvent`, `Hook`, `IOptions` |
| `IamReactClient` | `@gentleduck/iam/client/react` | `PermissionMap`, `PermissionKey`, `PermissionCheck`, `IChecker`, `IContextValue` |

`IamReactClient.PermissionMap` / `PermissionKey` / `PermissionCheck` mirror the `IamClient` members so a React-only app can name the map it receives without adding `@gentleduck/iam/core` to its dependency list for a type alias.

## Flat exports

Everything below is exported under its own name, not through a namespace.

### From `@gentleduck/iam` and `@gentleduck/iam/core`

| Flat name | Kind | One line |
|---|---|---|
| `createIam` | function | The typed-config factory - see [createIam()](/duck-iam/advanced/config/access-config) |
| `IamEngine` / `iamEngine` | class / function | The evaluation engine and its constructor-forwarding factory |
| `iamFlushSharedCaches` | function | Drops the process-wide regex and path caches |
| `PolicyBuilder` / `definePolicy` | class / function | Untyped policy builder and its factory |
| `RoleBuilder` / `defineRole` | class / function | Untyped role builder and its factory |
| `RuleBuilder` / `defineRule` | class / function | Untyped standalone rule builder and its factory |
| `When` / `when` | class / function | Untyped condition builder and its factory |
| `iamChosenWhen` | function | Resolves which builder a condition callback meant - the one it was given or the one it returned - and throws when both carry conditions |
| `iamEvaluate` / `iamEvaluateFast` | function | Full and fast-path evaluation over a policy set |
| `iamEvaluatePolicy` / `iamEvaluatePolicyFast` | function | Full and fast-path evaluation of a single policy |
| `iamIndexPolicy` | function | Builds the `Evaluate.IPolicyRuleIndex` for a policy |
| `iamMatchesUnconditionally` | function | `true` when a rule matches without evaluating conditions - the precompute test |
| `iamEvalConditionGroup` | function | Evaluates a condition tree; fails closed past `IAM_MAX_CONDITION_DEPTH` |
| `iamEvalCondition` | function | Evaluates one leaf condition |
| `iamEvaluateOperator` | function | Applies one operator to a `(field, value)` pair |
| `iamResolveConditionValue` / `iamResolveValue` | function | Resolve a `$`-prefixed condition value against a request |
| `iamIsCondition` | function | Type guard separating a leaf condition from a group |
| `iamIsUserSourcedValue` | function | `true` when a value is a `$`-prefixed reference |
| `iamGetCachedRegex` / `iamClearRegexCache` | function | Compile and memoise a `matches` pattern; drop the shared cache |
| `iamDetectCatastrophicRegex` | function | ReDoS heuristic, also re-exported by `core/validate` as `detectCatastrophicRegex` |
| `VALID_POLICY_COMBINES` | const | `['and', 'allow-overrides', 'first-applicable']` |
| `IAM_CRUD_ACTIONS` | const | `['create', 'read', 'update', 'delete']` - what `.grantCRUD()` expands to |
| `IAM_MAX_CONDITION_DEPTH` | const | `10` - condition nesting cap |
| `IAM_MAX_REGEX_LENGTH` | const | `128` - longest accepted `matches` pattern |
| `IAM_MAX_REGEX_INPUT_LENGTH` | const | `2048` - longest string a `matches` pattern is run against |
| `IAM_REGEX_CACHE_MAX` | const | `256` - regex cache capacity |
| `IAM_MAX_BOUNDED_QUANTIFIER` / `IAM_MAX_UNBOUNDED_QUANTIFIERS` | const | `1000` and `4` - the ReDoS heuristic's two thresholds |
| `IAM_RBAC_POLICY_ID` / `IAM_RBAC_CONDITION_DEPTH` | const | `'__rbac__'` and `1` - the id and condition depth of the policy `rolesToPolicy` generates |
| `resolve` | function | Resolves a dot-path against a request |
| `clearPathCache` | function | Drops the process-wide path-segment cache |
| `PATH_CACHE_MAX` | const | `10_000` - path cache capacity |
| `matchesAction` / `matchesResource` | function | Wildcard target matching |
| `matchesResourceHierarchical` / `matchesScope` | function | Hierarchical resource and scope matching |
| `iamScopeAncestors` / `iamScopeCovers` | function | Expand a dotted scope to its ancestors; test whether one scope covers another |
| `rolesToPolicy` | function | Compiles roles into a single ABAC policy |
| `resolveEffectiveRoles` | function | Expands a role assignment list through `inherits` |
| `MAX_INHERITANCE_DEPTH` | const | `32` - inheritance expansion cap |
| `POLICY_JSON_SCHEMA` | const | Draft 2020-12 schema for `AccessControl.IPolicy` |
| `explainEvaluation` / `iamEscapeHtml` | function | Produces an `Explain.IResult`; escapes trace strings before rendering them |
| `iamCreateEvalCaches` | function | Creates a fresh `IamEvalCaches` - the per-engine `regex` and `path` cache pair |
| `IamLRUCache` / `iamLRUCache` | class / function | TTL LRU used for policies, roles, and subjects |
| `iamBuildPermissionKey` | function | Builds a permission-map key, escaping `:` and `\` per segment |
| `iamSplitPermissionKey` / `iamParsePermissionKey` | function | Split a key into unescaped segments; parse one into `{ scope, action, resource, resourceId }`, or `null` if it is not a key |
| `IamConditionGroupError` | class | A condition group named none of `all` / `any` / `none`, or nested past the depth cap |
| `IamOperandTypeError` | class | An operator was handed an operand of the wrong class |
| `IamPatternRefusedError` | class | A `matches` pattern failed the length or ReDoS heuristic |
| `IamRegexInputTooLargeError` | class | The string under test exceeded `IAM_MAX_REGEX_INPUT_LENGTH` |
| `IamUserSourcedPatternError` | class | A `matches` pattern resolved from a `$`-reference, which is refused |

`iamEvaluate`, `iamEvaluateFast`, `iamEvaluatePolicy`, and `iamEvaluatePolicyFast` are thin wrappers that refuse `defaultEffect: 'allow'` unless you also pass `allowFailOpen: true`, the same gate `IamEngine`'s constructor applies. The raw `evaluate` / `evaluateFast` / `evaluatePolicy` / `evaluatePolicyFast` are deliberately not re-exported from any entry point - exporting them put an ungated fail-open evaluation one import away from the package root.

### From `@gentleduck/iam/core/validate`

| Flat name | Kind | One line |
|---|---|---|
| `validatePolicy` / `validateRole` / `validateRoles` | function | Deep shape and semantic validation, returning `IamValidate.IResult` |
| `parsePolicyRow` / `parseRoleRow` | function | Validate-then-narrow helpers for adapter rows |
| `detectCatastrophicRegex` | function | ReDoS heuristic used by `matches` validation |
| `VALID_ALGORITHMS` / `VALID_EFFECTS` / `VALID_OPERATORS` | const | Accepted enum sets |
| `POLICY_LIMITS` | const | Structural caps: `rulesPerPolicy` 1000, `actionsPerRule` 100, `resourcesPerRule` 100, `cartesianPerRule` 1000 |
| `MAX_FIELD_LENGTH` / `MAX_CONDITION_VALUE_LENGTH` | const | `256` and `1024` - per-field and per-value length caps |
| `MAX_UNBOUNDED_QUANTIFIERS` / `MAX_BOUNDED_QUANTIFIER` | const | `4` and `1000` - the ReDoS heuristic's thresholds |

### From the integration subpaths

| Flat name | Import path | Kind |
|---|---|---|
| `IamMemoryAdapter` / `iamMemoryAdapter` | `adapters/memory` | class / factory |
| `IamFileAdapter` / `iamFileAdapter` | `adapters/file` | class / factory |
| `IamPrismaAdapter` / `iamPrismaAdapter` | `adapters/prisma` | class / factory |
| `IamDrizzleAdapter` / `createIamDrizzleAdapter` / `iamDrizzleAdapter` | `adapters/drizzle` | class / factories |
| `iamPolicies` / `iamRoles` / `iamAssignments` / `iamSubjectAttrs` | `adapters/drizzle/{pg,mysql,sqlite}` | drizzle tables |
| `combineAlgorithm` | `adapters/drizzle/pg` | pg enum |
| `IAM_COMBINE_ALGORITHMS` | `adapters/drizzle/sqlite` | const |
| `IamRedisAdapter` / `iamRedisAdapter` | `adapters/redis` | class / factory |
| `IamHttpAdapter` / `iamHttpAdapter` | `adapters/http` | class / factory |
| `createIamRedisInvalidator` | `invalidators/redis` | function |
| `iamCreateMetricsAggregator` | `observability/metrics` | function |
| `iamAccessMiddleware` / `iamGuard` / `iamAdminRouter` | `server/express` | functions |
| `iamAccessMiddleware` / `iamGuard` / `iamBindAdminRouter` | `server/hono` | functions |
| `IamAuthorize` / `iamNestAccessGuard` / `createIamEngineProvider` / `createIamAdminOperations` | `server/nest` | decorator, guard, providers |
| `IAM_ACCESS_METADATA_KEY` / `IAM_ACCESS_ENGINE_TOKEN` | `server/nest` | consts |
| `withIamAccess` / `checkIamAccess` / `getIamPermissions` | `server/next` | functions |
| `createIamNextMiddleware` / `createIamAdminHandlers` | `server/next` | functions |
| `createIamSubjectCan` / `iamExtractEnvironment` / `iamFireAdminMutation` | `server/generic` | functions |
| `iamDefaultCsrfCheck` / `iamNoticeCsrfDefaultIfNeeded` / `iamErrorToAuditString` | `server/generic` | functions |
| `IAM_METHOD_ACTION_MAP` | `server/generic` | const |
| `IamAdminAudit.IamIAdminAuthzResult` and its four arms | `server/generic` | types in the `IamAdminAudit` namespace, not flat exports |
| `iamRunAdminAuthz` / `iamWithAdminAudit` / `generateIamPermissionMap` | `server/generic` | functions |
| `createIamAccessControl` / `createIamPermissionChecker` | `client/react` | functions |
| `iamAllowedActions` / `iamHasAnyOn` | `client/{react,vue,vanilla}` | functions, re-exported by all three clients |
| `createIamVueAccess` / `IAM_ACCESS_INJECTION_KEY` | `client/vue` | function / symbol |
| `IamAccessClient` / `iamAccessClient` | `client/vanilla` | class / factory |
| `IamDevtools` / `IamDevtoolsInner` and the panel components | `dt` | React components |
| `iamCreateFlowRecorder` | `dt` | function |

## Gotchas

* **`IamValidate` is a type-only re-export from `core`.** `core/index.ts` exports the namespace but not `validatePolicy`; the functions live behind `@gentleduck/iam/core/validate` so the validator chunk stays opt-in.
* **`createIam()` reaches the validator anyway.** The object it returns closes over `validatePolicy` and `validateRoles`, so once you call `createIam` the validator code is retained even though you never imported the subpath. If bundle size is the priority, use the untyped builders and validate at an explicit boundary.
* **`IResult` and `IConfig` are ambiguous without their namespace.** Never destructure them into a bare local alias in shared code.
* **The `Types` suffix appears once.** `IamEngineTypes` is the only namespace named for its class rather than its domain, because `IamEngine` is a runtime class occupying the flat name.

## See also

* [createIam()](/duck-iam/advanced/config/access-config) - the factory whose generics thread these types through every builder.
* [Typed context](/duck-iam/advanced/config/context) - how `DotPath` turns your context interface into autocomplete.
* [Engine methods](/duck-iam/advanced/engine/methods) - the `IamEngineTypes.IConfig` and `IAdmin` surfaces in use.
* [Adapters](/duck-iam/integrations/adapters) - implementing `IamAdapter.IAdapter`.