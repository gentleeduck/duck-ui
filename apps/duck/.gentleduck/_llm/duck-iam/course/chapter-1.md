DocDuck starts with one question: may Alice read a document? This chapter builds the smallest thing that can answer it - a role, an adapter, an engine - and then takes the answer apart.

## Learning goals

* Define a role with `defineRole` and understand what `build()` returns.
* Seed `IamMemoryAdapter` with roles and assignments.
* Construct an `IamEngine` and read its defaults.
* Tell `engine.can` and `engine.check` apart, and read a decision.
* Know why an unmatched action is denied.

## The three moving parts

Everything in duck-iam sits between a **subject** (who is asking), a **request** (what they want), and an **adapter** (where the roles and policies live).

allowed: false"]`}
/>

The engine owns no data. It asks the adapter for Alice's roles, turns those roles into policy, evaluates the request against that policy, and returns a decision. Swap `IamMemoryAdapter` for Prisma or Drizzle later and nothing else in this diagram changes.

## Step by step

**Define a role**

Create `src/roles.ts`:

```ts title="src/roles.ts"
import { defineRole } from '@gentleduck/iam'

export const viewer = defineRole('viewer')
  .name('Viewer')
  .desc('Read-only access to documents and teams')
  .grant('read', 'document')
  .grant('read', 'team')
  .build()

export const roles = [viewer]
```

`defineRole(id)` returns a `RoleBuilder`. Chain `.grant(action, resource)` for each
permission, then `.build()`. The result is a plain `AccessControl.IRole` record - no
methods, no hidden state, safe to serialise into a database or send over HTTP.

`.build()` runs the role validator and **throws** if the role is malformed, so a typo
fails where you wrote it rather than at the first request.

**Seed an adapter**

The engine reads everything through an adapter. `IamMemoryAdapter` keeps it all in `Map`s.

```ts title="src/access.ts"
import { IamEngine } from '@gentleduck/iam'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import { roles } from './roles'

export const adapter = new IamMemoryAdapter({
  roles,
  assignments: {
    alice: ['viewer'],
  },
})

export const engine = new IamEngine({ adapter, mode: 'development' })
```

`assignments` maps a subject ID to the role IDs it holds. A subject can hold several:
`alice: ['viewer', 'commenter']`. The adapter also accepts `policies` (chapter 3) and
`attributes` (a per-subject attribute bag).

`mode` defaults to `'production'`, which returns bare booleans and skips the reason
strings. Every chapter through 7 sets `'development'` explicitly, because the course
reads decisions and traces. Chapter 8 switches it back.

**Ask the question**

Create `src/main.ts`:

```ts title="src/main.ts"
import { engine } from './access'

async function main() {
  const canRead = await engine.can('alice', 'read', {
    type: 'document',
    attributes: {},
  })
  console.log('alice can read a document:', canRead)
  // alice can read a document: true

  const canDelete = await engine.can('alice', 'delete', {
    type: 'document',
    attributes: {},
  })
  console.log('alice can delete a document:', canDelete)
  // alice can delete a document: false
}

void main()
```

Run it:

```bash
npx tsx src/main.ts
```

## can versus check

| Method | Returns in `development` | Returns in `production` | Use it when |
| --- | --- | --- | --- |
| `engine.can(...)` | `boolean` | `boolean` | yes or no is the whole answer |
| `engine.check(...)` | `AccessControl.IDecision` | `boolean` | you want the reason, the deciding rule, and timing |

Both take the same five arguments:

```ts
engine.can(subjectId, action, resource, environment?, scope?): Promise<boolean>
engine.check(subjectId, action, resource, environment?, scope?): Promise<AccessControl.ModeResult<TMode>>
```

`environment` arrives in chapter 3 and `scope` in chapter 5. Add the decision to `src/main.ts`:

```ts title="src/main.ts"
const decision = await engine.check('alice', 'read', { type: 'document', attributes: {} })

console.log(decision.allowed)   // true
console.log(decision.effect)    // 'allow'
console.log(decision.policy)    // '__rbac__'
console.log(decision.reason)    // Allowed by rule "__rbac__#0"
console.log(decision.duration)  // 0.12 (milliseconds)
console.log(decision.timestamp) // 1772668800000
```

`can` returns `false` and `check` returns a synthesized deny when `subjectId` is not a non-empty string of at most 1024 characters, and again when the adapter throws while resolving the subject. The `onError` hook fires (chapter 4); the caller never sees a rejected promise or an accidental allow.

## What just happened

closes over inherits"]
  R4 --> P["rolesToPolicy()"]
  P --> P2["synthetic policy __rbac__algorithm allow-overrides"]
  P2 --> EV["evaluate(policies, request)"]
  EV --> D1["read on documentfirst rbac rule matchesALLOW"]
  EV --> D2["delete on documentno rule matchesdefaultEffect DENY"]`}
/>

1. **Resolve the subject.** The engine calls `adapter.getSubjectRoles`, `adapter.getSubjectAttributes`, and `adapter.listRoles` in parallel, then closes the assigned roles over their `inherits` chain (chapter 2). The result is an `IamRequest.ISubject`: `id`, `roles`, `attributes`, and optional `scopedRoles`. It is cached per subject.
2. **Convert roles to policy.** `rolesToPolicy()` turns every permission of every role into an ABAC rule inside one synthetic policy with `id: '__rbac__'`, `name: 'RBAC Policies'`, and `algorithm: 'allow-overrides'`.
3. **Evaluate.** The request runs against every policy - the synthetic one plus anything the adapter stores. Rules whose action and resource match are collected and combined by the policy's algorithm.
4. **Decide.** `read` on `document` matches; the decision is allow. `delete` matches nothing, so the engine falls back to `defaultEffect`, which is `'deny'`.

### The synthetic `__rbac__` policy

Roles do not run directly. This is what your `viewer` role becomes:

```ts
{
  id: '__rbac__',
  name: 'RBAC Policies',
  description: 'Auto-generated from role definitions',
  algorithm: 'allow-overrides',
  rules: [
    {
      id: '__rbac__#0',
      effect: 'allow',
      description: 'Viewer: read on document',
      priority: 10,
      actions: ['read'],
      resources: ['document'],
      conditions: { all: [{ field: 'subject.roles', operator: 'contains', value: 'viewer' }] },
    },
    {
      id: '__rbac__#1',
      effect: 'allow',
      description: 'Viewer: read on team',
      priority: 10,
      actions: ['read'],
      resources: ['team'],
      conditions: { all: [{ field: 'subject.roles', operator: 'contains', value: 'viewer' }] },
    },
  ],
}
```

Rule IDs are a monotonic counter, `__rbac__#0`, `__rbac__#1`, and so on - not derived from the role or action names, because those can contain dots and would produce ambiguous IDs. That ID is what you see in `decision.reason`.

RBAC and ABAC are the same machine. A role is shorthand for a policy.

## The decision object

```ts
interface IDecision {
  readonly allowed: boolean
  readonly effect: 'allow' | 'deny'
  readonly rule?: AccessControl.IRule
  readonly policy?: string
  readonly reason: string
  readonly duration: number
  readonly timestamp: number
  readonly applicable?: boolean
  readonly failure?: 'input' | 'resolution' | 'evaluation'
}
```

| Field | Meaning |
| --- | --- |
| `allowed` | The verdict. |
| `effect` | The same verdict as `'allow'` or `'deny'`. |
| `rule` | The rule that decided, when one did. Absent when the default effect fired. |
| `policy` | The ID of the deciding policy, for example `'__rbac__'`. |
| `reason` | Human-readable, and stable enough to assert on in tests: `Allowed by rule "X"`, `Denied by rule "X"`, `No matching rules. Defaulted to deny`. |
| `duration` | Evaluation time in milliseconds, from `performance.now()`. |
| `timestamp` | `Date.now()` at the moment of the decision. |
| `applicable` | `false` marks a policy that had nothing to say - its targets did not match, or none of its rules covered this action and resource. The cross-policy combiner skips those instead of counting them as a vote. |
| `failure` | Set when the deny was synthesized rather than decided: `'input'` for a malformed `subjectId`, `'resolution'` when the adapter failed, `'evaluation'` when the pipeline threw. |

## The resource object

```ts
interface IResource<TResource extends string = string> {
  readonly type: TResource
  readonly id?: string
  readonly attributes: Readonly<IamPrimitives.Attributes>
}
```

```ts
// Type only - enough for role checks
{ type: 'document', attributes: {} }

// A specific instance
{ type: 'document', id: 'doc-1', attributes: {} }

// With metadata that conditions can read (chapter 3)
{
  type: 'document',
  id: 'doc-1',
  attributes: { ownerId: 'alice', teamId: 'team-acme', status: 'published' },
}
```

`type` is matched against rule resources. `id` identifies the instance and shows up in batch permission keys (chapter 4). `attributes` is where conditions look; `{}` means "no metadata", and a condition reading a missing field resolves to `null`.

`IamPrimitives.Attributes` is `Record<string, AttributeValue>`, where `AttributeValue` is a scalar (`string | number | boolean | null`), an array of scalars, or a flat record of scalars. Nested objects are not part of the model - flatten them before passing them in.

## Engine configuration

`new IamEngine({ adapter })` accepts one options object. Only `adapter` is required.

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `adapter` | `IamAdapter.IAdapter` | required | Where policies, roles, and subject data come from. |
| `mode` | `'development'` or `'production'` | `'production'` | Development returns decisions and enables `explain`; production returns booleans and uses the compiled table. |
| `defaultEffect` | `'allow'` or `'deny'` | `'deny'` | What to return when nothing matched. |
| `cacheTTL` | `number` | `60` | Cache lifetime in seconds. `0` disables caching. |
| `maxCacheSize` | `number` | `1000` | Subject cache capacity, LRU eviction. |
| `policyCombine` | `'and'`, `'allow-overrides'`, `'first-applicable'` | `'and'` | How decisions from separate policies merge (chapter 3). |
| `hooks` | `IamEngineTypes.IHooks` | `{}` | Lifecycle hooks (chapter 4). |
| `maxPolicies` | `number` | `10000` | Ceiling on policies loaded from the adapter. |
| `maxRoles` | `number` | `10000` | Ceiling on roles loaded from the adapter. |
| `adapterTimeoutMs` | `number` | `5000` | Per-adapter-call timeout. `0` disables it. |
| `allowFailOpen` | `boolean` | `false` | Required opt-in for `defaultEffect: 'allow'`. |
| `scopeMode` / `scopeCombine` | see chapter 5 | `'flat'` / `'union'` | Scoped-role matching. |
| `invalidator` | `IamEngineTypes.IInvalidator` | none | Cross-instance cache invalidation. |
| `maxConcurrentSubjectLoads` | `number` | `512` | Cap on concurrent cold subject loads. `0` restores unbounded. |

The constructor throws unless you also pass `allowFailOpen: true`, and even then it logs a startup warning. A fail-open authorization engine turns a buggy condition or an adapter blip into an unintended grant. Leave it on `'deny'`.

## Try it

1. Give Alice a second role. Add `commenter` to `src/roles.ts` with `.grant('create', 'comment')`, put it in the `roles` array, and change the assignment to `alice: ['viewer', 'commenter']`. Confirm `engine.can('alice', 'create', { type: 'comment', attributes: {} })` is `true`.
2. Check an unknown subject: `engine.can('mallory', 'read', { type: 'document', attributes: {} })`. The adapter returns no roles, nothing matches, and the answer is `false` - unknown subjects are denied without any special handling.
3. Print `decision.rule?.id` for the allowed read and confirm it is `__rbac__#0`. Then reorder the two `.grant()` calls in `viewer` and watch the ID change - rule IDs are positional, so never persist them as identifiers.

## Where we are

```
docduck/
  src/
    roles.ts    - role definitions
    access.ts   - adapter + engine
    main.ts     - the script you run
```

Chapter 2 turns that single role into a hierarchy.

## See also

* [Role definition](/duck-iam/core/roles/definition) - the full `RoleBuilder` reference
* [Memory adapter](/duck-iam/integrations/adapters/memory) - every seed option
* [Engine methods](/duck-iam/advanced/engine/methods) - `can`, `check`, `authorize`, and the rest
* [Primitives](/duck-iam/core/primitives) - `ISubject`, `IResource`, `IDecision`, `Attributes`
* [Chapter 2: role hierarchies](/duck-iam/course/chapter-2)