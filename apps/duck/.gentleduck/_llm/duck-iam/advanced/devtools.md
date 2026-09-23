`@gentleduck/iam/dt` is a React devtools panel that inspects a live engine from inside your
app: a flow log of recent checks, an interactive decision tester with the full explain
trace, and browsable policies, roles, subjects, and cache telemetry. It refuses to render
without an explicit development signal, and there is no prop to override that.

## Two builds, opposite contracts

The package ships **two** devtools builds that render the same six panels over the same
engine. Conflating them produces a panel of unstyled boxes, or a package that will not

| | `@gentleduck/iam/dt` (v1) | `@gentleduck/iam/dt/v2` |
|---|---|---|
| Runtime deps | React only | React, `@gentleduck/registry-ui`, `@gentleduck/libs`, `lucide-react` — all optional peers |
| Styling | one `

v1 needs `react` and nothing else. It does not import `@gentleduck/registry-ui`,
`@gentleduck/libs` or `lucide-react`, and a lint sweep over `src/dt` fails the build if a
module ever does — that self-containment is the whole reason v1 exists.

```tsx
import { IamDevtools } from '@gentleduck/iam/dt'

export function App() {
  return (
    <>
      <YourApp />
      <IamDevtools engine={engine} />
    </>
  )
}
```

That renders a floating launcher in the bottom-right. Opening it slides a resizable,
dockable panel in from the bottom.

The panel reads your entire authorization model — every policy body, every role and its
permissions, arbitrary subjects' attributes — and the Subjects panel *writes*: it can
assign and revoke roles and overwrite attributes through `engine.admin`. Shipping it to a
deployed environment is CWE-200 (information exposure) and CWE-489 (leftover debug code).

The guard below default-blocks, so a bundle that accidentally imports `/dt` still renders
nothing. Do not rely on that alone: keep the import behind your own bundler condition too,
so the code never ships at all.

## The production guard

`isDevtoolsAllowed` runs before any hook in both `IamDevtools` and `IamDevtoolsInner`, in a
thin wrapper so the inner component's hook order stays unconditional. It returns `true`
**only** on an explicit positive development signal.

Read the diagram as three rules:

1. A bundler-set `NODE_ENV=production` always blocks, whatever the engine says.
2. Either `NODE_ENV=development` **or** an engine constructed with `mode: 'development'` is
   enough to allow. Neither is required if the other holds.
3. Absence of any signal blocks. `process` being undefined in a raw-browser bundle is not a
   development signal, and neither is `NODE_ENV=test`.

`iam-devtools.test.tsx` pins every branch, including the two that used to fail open: no
`process` and no engine `mode` renders nothing, and `NODE_ENV=test` with no engine `mode`
renders nothing.

```ts
export function isDevtoolsAllowed(engine: IamIDevtoolsEngine): boolean
/** @deprecated Prefer isDevtoolsAllowed. Inverse: true means do NOT mount. */
export function isDevtoolsBlocked(engine: IamIDevtoolsEngine): boolean
```

Neither is exported from `@gentleduck/iam/dt`'s barrel; they are internal to the guard.
There is **no** escape hatch: no prop, no window flag, no environment variable. To use the
panel in a deployed environment, run a development build behind an admin-only route.

Belt and braces, with the import itself gated:

```tsx
const IamDevtools =
  process.env.NODE_ENV === 'development'
    ? (await import('@gentleduck/iam/dt')).IamDevtools
    : () => null
```

## Wiring an engine

The panel does not take an `IamEngine` directly. It takes `IamIDevtoolsEngine`, a minimal
structural surface so any concrete `Engine<...>` can be passed without variance problems:

```ts
export interface IamIDevtoolsEngine {
  can(subjectId, action, resource, environment?, scope?): Promise<unknown>
  explain(subjectId, action, resource, environment?, scope?): Promise<Explain.IResult>
  stats: {
    get(): Record<string, { hits: number; misses: number; size: number }>
    reset(): void
  }
  admin: {
    listPolicies(): Promise<AccessControl.IPolicy[]>
    listRoles(): Promise<AccessControl.IRole[]>
    getPolicy(id: string): Promise<AccessControl.IPolicy | null>
    getRole(id: string): Promise<AccessControl.IRole | null>
    assignRole(subjectId: string, roleId: string, scope?: string): Promise<void>
    revokeRole(subjectId: string, roleId: string, scope?: string): Promise<void>
    setAttributes(subjectId: string, attrs: IamPrimitives.Attributes): Promise<void>
    getAttributes(subjectId: string): Promise<IamPrimitives.Attributes>
    export(): Promise<unknown>
  }
}
```

`stats` is the engine's observability facet with `get()` and `reset()` — the same shape
`IamEngine` has carried since 3.0.0, so a real engine satisfies this interface structurally
and needs no shim.

It has not always matched. The interface used to declare the flat `stats()` / `resetStats()`
pair the engine replaced, so the Telemetry panel called `engine.stats()` on a property that
is an object: opening that tab against any real engine threw
`engine.stats is not a function` from a `useState` initializer and took the whole overlay
down. Every devtools test at the time handed in a hand-rolled mock implementing the dead
shape, so nothing caught it. If you write your own mock, mirror the engine rather than this
page.

Pass the engine directly, adding `mode` when `NODE_ENV` does not supply a development
signal:

```tsx
<IamDevtools engine={engine} />
```

## Props

`IamDevtools` accepts everything `IamDevtoolsInner` does, plus the chrome props.

### `IIamDevtoolsInnerProps`

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `engine` | `IamIDevtoolsEngine` | required | The engine every panel reads from. |
| `metrics` | `IamIDevtoolsMetrics` | — | Aggregator with `snapshot()` and `reset()`. Without it, the Metrics panel shows cache stats only. |
| `flow` | `IamIFlowRecorder` | — | Recorder backing the Flow panel. Without it, the Flow tab shows a wiring hint. |
| `initialPanel` | `IamPanelKey` | `'flow'` | Which tab opens first: `flow`, `decision`, `policies`, `roles`, `subjects`, `metrics`. |
| `defaultRequest` | `Partial

Two panels write. Subjects mutates the store through `engine.admin`, and Metrics' reset
button clears the running engine's real counters through `engine.stats.reset()` — which is
why the guard covers that tab too.

### Flow

Reads `flow.list()` and re-reads on every `flow.subscribe` notification, so the list is
push-driven, not polled. Newest entry first. Filter by free text across subject id, action,
resource, and resource id; toggle allow and deny with two pills that also show their counts.
Selecting an entry shows the subject, scope, reason, deciding policy and rule, environment,
and the raw entry, with a copy-to-clipboard button. Relative timestamps tick once a second.
Without a `flow` prop the tab renders a hint telling you to bind a recorder to
`afterEvaluate`.

### Decision

The interactive tester. It builds an `IamIDecisionInput` from the form — subject id, action,
scope, resource type, resource id, `resource.attributes` JSON, environment JSON — and calls
`engine.explain(subjectId, action, resource, environment)`. A non-empty scope field is
merged into the environment object as `{ scope }`. Both JSON textareas parse through
`safeParseJson`, so a syntax error becomes an inline `attributes JSON: ...` message rather
than a crash. The result renders as an allow/deny badge, the `summary` string, the full
trace tree, and a collapsible raw `Explain.IResult`.

Because it calls `explain()`, the engine must be in `development` mode or the call throws
and the error surfaces in the panel. See [explain traces](/duck-iam/advanced/explain) for
what every field means.

### Trace tree

`IamTraceTree` renders one `Explain.IResult`. Policies show name, `targetMatch`, per-policy
`result`, `algorithm`, `decidingRuleId`, and `reason`. Rules show `effect`, `ruleId`, three
badges for `actionMatch` / `resourceMatch` / `conditionsMet`, the priority, and a `matched`
badge; matched rules start expanded. Condition groups show their logic and result and
auto-expand to depth 2; leaves show `PASS` / `FAIL`, the field, the operator, and
`expected` vs `actual` side by side. It is exported separately so you can render a trace of
your own anywhere.

### Policies

Calls `engine.admin.listPolicies()` on mount and on the refresh button. Filters by id or
name. The detail view shows the id, name, algorithm, version, description, and every rule —
each expandable to its description and its condition tree — plus a collapsible raw JSON view.

### Roles

Calls `engine.admin.listRoles()` on mount and on refresh. Filters by id or name. The detail
view shows the role's scope badge, description, `inherits` list, and every permission as
`action on resource` with a scope badge and a `cond` badge where conditions exist; a
permission with conditions or a scope expands to show them.

### Subjects

The panel that writes to the store. Enter a subject id and load to fetch
`engine.admin.getAttributes(subjectId)`. From there you can edit the attribute JSON and save
it through `setAttributes`, or assign and revoke a role with an optional scope through
`assignRole` / `revokeRole`. Every adapter error surfaces as an inline alert; successes show
a status line such as `assigned editor @ org-acme`.

### Metrics

The tab is labelled *Metrics*; the pane titles itself *Telemetry*. It polls
`engine.stats.get()` every `pollMs` and, when a `metrics` aggregator is wired, its
`snapshot()` too. The reset button calls `engine.stats.reset()` and `metrics?.reset()`.

It polls rather than subscribes deliberately: the engine publishes no metrics event, and a
hook firing per decision would put devtools rendering on the hot path of every check.

Without an aggregator the evaluation tiles say so rather than rendering zeroes that look
like real measurements. Neither build surfaces `snapshot.failOpen`, the count of allows
attributable solely to `defaultEffect: 'allow'` — read it from the aggregator yourself if
you are watching for silent policy-set breakage.

| Tile | Source |
|---|---|
| `evals` | `snapshot.total` |
| `allow rate` | `snapshot.allow / snapshot.total`, with the allow and deny counts as a hint |
| `window` | `snapshot.samples` |
| `max`, `p50`, `p95`, `p99` | the matching `snapshot` fields, in ms |
| `deny` | `snapshot.deny` |

Below that, one card per engine cache — `policies`, `roles`, `rbacPolicy`,
`mergedPolicies`, `subjects` — with a hit-rate badge (green above 80%, blue above 50%,
amber otherwise), the size, and the raw hit/miss counts. A collapsible raw view dumps both
objects.

## Wiring the flow recorder

```ts
export interface IamIFlowRecorder {
  record(entry: Omit<IamIFlowEntry, 'id' | 'ts'> & { ts?: number }): IamIFlowEntry
  list(): readonly IamIFlowEntry[]
  get(id: number): IamIFlowEntry | undefined
  clear(): void
  subscribe(listener: () => void): () => void
}

export function iamCreateFlowRecorder(options?: IamIFlowRecorderOptions): IamIFlowRecorder
```

| Option | Type | Default | Meaning |
|---|---|---|---|
| `bufferSize` | `number` | `250` | Ring size. New entries go to the front; the oldest are dropped. Must be a positive integer — `0`, `-1`, `1.5`, `NaN` and `Infinity` all throw `RangeError` at construction, because unchecked they make the trim comparison always false and the "ring" grows without bound for the life of the process. |

`IamIFlowEntry` fields: `id` (monotonic from 1), `ts` (`Date.now()` unless you pass one),
`subjectId`, `action`, `resource`, `resourceId?`, `scope?`, `allowed`, `durationMs?`,
`reason?`, `decidingPolicy?`, `decidingRule?`, `environment?`.

There is no built-in engine binding — wire it in the `afterEvaluate` hook yourself:

```tsx
import { iamCreateFlowRecorder } from '@gentleduck/iam/dt'
import { IamEngine } from '@gentleduck/iam'

const flow = iamCreateFlowRecorder({ bufferSize: 500 })

const engine = new IamEngine({
  adapter,
  mode: 'development',
  hooks: {
    afterEvaluate: (request, decision) => {
      flow.record({
        subjectId: request.subject.id,
        action: request.action,
        resource: request.resource.type,
        resourceId: request.resource.id,
        scope: request.scope,
        allowed: decision.allowed,
        durationMs: decision.duration,
        reason: decision.reason,
        decidingPolicy: decision.policy,
        decidingRule: decision.rule?.id,
        environment: request.environment,
      })
    },
  },
})
```

`afterEvaluate` fires in `development` mode only, which lines up exactly with when the panel
can render. A listener that throws is caught and logged with
`[@gentleduck/iam:dt:flow] listener threw - continuing`, so one broken subscriber cannot
break the recorder.

## Wiring metrics

`IamIDevtoolsMetrics` is `{ snapshot(): IamMetrics.ISnapshot; reset(): void }`, which the
shipped aggregator satisfies exactly:

```tsx
import { iamCreateMetricsAggregator } from '@gentleduck/iam/observability/metrics'

const metrics = iamCreateMetricsAggregator({ sampleSize: 2000 })

const engine = new IamEngine({
  adapter,
  mode: 'development',
  hooks: { onMetrics: metrics.record },
})

<IamDevtools engine={engine} metrics={metrics} />
```

`onMetrics` is cheap in both modes, so the same wiring works in production for a real
telemetry sink even though the panel will not render there. See
[metrics aggregator](/duck-iam/integrations/observability/metrics).

## Embedding in your own admin UI

Every panel is exported individually, so you can compose them into an existing shell instead
of using the floating overlay. `IamDevtoolsInner` gives you the tab bar with no chrome:

```tsx
import { IamDevtoolsInner } from '@gentleduck/iam/dt'

<div className="h-[600px]">
  <IamDevtoolsInner engine={engine} flow={flow} metrics={metrics} embedded />
</div>
```

Or drive the panels yourself:

```tsx
import {
  IamDecisionInspector,
  IamFlowPanel,
  IamMetricsPanel,
  IamPoliciesPanel,
  IamRolesPanel,
  IamSubjectsPanel,
  IamTraceTree,
} from '@gentleduck/iam/dt'

<Tabs>
  <Tab title="Decision"><IamDecisionInspector engine={engine} /></Tab>
  <Tab title="Flow"><IamFlowPanel flow={flow} /></Tab>
  <Tab title="Metrics"><IamMetricsPanel engine={engine} metrics={metrics} /></Tab>
</Tabs>
```

Panel prop signatures, exactly:

| Component | Props |
|---|---|
| `IamFlowPanel` | `{ flow: IamIFlowRecorder }` |
| `IamDecisionInspector` | `{ engine: IamIDevtoolsEngine; defaults?: Partial<IamIDecisionInput> }` |
| `IamPoliciesPanel` | `{ engine: IamIDevtoolsEngine }` |
| `IamRolesPanel` | `{ engine: IamIDevtoolsEngine }` |
| `IamSubjectsPanel` | `{ engine: IamIDevtoolsEngine }` |
| `IamMetricsPanel` | `{ engine: IamIDevtoolsEngine; metrics?: IamIDevtoolsMetrics; pollMs?: number }` |
| `IamTraceTree` | `{ result: Explain.IResult }` |

`IamMetricsPanel` requires `engine` — cache stats come from it, and only the evaluation
tiles come from `metrics`.

Every panel that takes an `engine` runs `isDevtoolsAllowed` itself, not only `IamDevtools`
and `IamDevtoolsInner`: Decision, Policies, Roles, Subjects and Metrics each return `null`
without a development signal. Guarding only the shells meant a panel composed into someone
else's admin UI reached the engine with no check anywhere in its path. `IamFlowPanel` and
`IamTraceTree` are the two exceptions, and they take no engine — they render a buffer and a
trace you already hold.

## Full export list

```ts
// components
export { IamDevtools }            // floating, dockable, persisted panel
export { IamDevtoolsInner }       // tab bar + panels, no chrome
export { IamDecisionInspector, IamFlowPanel, IamMetricsPanel }
export { IamPoliciesPanel, IamRolesPanel, IamSubjectsPanel, IamTraceTree }

// runtime helpers
export { iamCreateFlowRecorder }
export { iamEnsureDevtoolsStyles }  // inject the stylesheet ahead of mount

// types
export type { IIamDevtoolsProps, IIamDevtoolsInnerProps }
export type { ButtonPosition, PanelPosition, IamPanelKey, IamDevtoolsTheme }
export type { IamIDevtoolsEngine, IamIDevtoolsMetrics, IamIDecisionInput }
export type { IamIFlowEntry, IamIFlowRecorder, IamIFlowRecorderOptions }
```

The internal UI primitives under `dt/components` (`JsonTree`, `SplitView`, `Badge`, the
icons) are not part of the public barrel, and neither are `isDevtoolsAllowed` /
`isDevtoolsBlocked`.

`@gentleduck/iam/dt/v2` mirrors this list with `V2` suffixes and omits
`iamEnsureDevtoolsStyles` and `IamDevtoolsTheme`, which have no meaning in a build with no
stylesheet of its own.

## Gotchas

* **Do not mock `stats` as a callable.** Both the engine and `IamIDevtoolsEngine` spell it
  `stats.get()` / `stats.reset()`. A mock implementing the removed flat pair throws from a
  `useState` initializer the moment Telemetry opens.
* **v1 and v2 are not interchangeable.** v1 brings its own stylesheet and reads no host
  token; v2 brings no stylesheet and needs an `@source` line plus the duck-ui token set.
  Importing v2 without configuring Tailwind renders unstyled boxes.
* **`hideButton` does not open the panel.** It only hides the launcher; the panel still
  starts closed unless `initialIsOpen` is set or a persisted `_OPEN` says otherwise.
* **`position` is sticky when passed.** An effect re-applies the prop whenever it changes,
  so a hard-coded `position` overrides the user's dock choice on every render pass that
  changes it. Omit the prop to let the dock button win.
* **The guard runs per render, not per import.** Importing `/dt` still pulls the code into
  your bundle. Gate the import too.
* **Individual panels are guarded too.** Every engine-taking panel calls `isDevtoolsAllowed`
  itself, so composing `IamPoliciesPanel` into your own admin UI does not bypass it. That
  is a floor, not a licence: gate the import as well.
* **The Subjects panel is a write surface.** It can grant any role to any subject. Treat
  mounting it as granting admin.

## See also

* [Explain traces](/duck-iam/advanced/explain) — the trace format the Decision panel renders.
* [Metrics aggregator](/duck-iam/integrations/observability/metrics) — the source for the Metrics tiles.
* [Engine hooks](/duck-iam/advanced/engine/hooks) — `afterEvaluate` and `onMetrics`, the two the panel depends on.
* [Engine admin API](/duck-iam/advanced/engine/admin) — everything the Policies, Roles, and Subjects panels call.
* [Engine modes](/duck-iam/advanced/engine/modes) — why `development` mode is required.