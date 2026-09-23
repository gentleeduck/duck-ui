Roles answer "is Bob an editor". They cannot answer "may Bob update *this* document". That needs attributes: who owns the document, what state it is in, when the request arrived. This chapter adds two ABAC policies to DocDuck and shows how they combine with the roles from chapter 2.

## Learning goals

* Write a policy with `definePolicy`, rules with `.rule()`, and conditions with the `When` builder.
* Read a condition as three parts: field, operator, value.
* Know all nineteen operators and how each behaves on missing or wrong-typed data.
* Use `$`-variables to compare one part of the request against another.
* Pick a combining algorithm for a policy, and know how policies combine with each other.
* Avoid the deny-only policy trap that silently denies everything it targets.

## Where policies sit

allow-overridesfrom roles"]
  REQ --> P1["document-ownershipdeny-overrides"]
  REQ --> P2["document-lifecycledeny-overrides"]
  RBAC --> C{"policyCombine: and"}
  P1 --> C
  P2 --> C
  C --> |"every applicable policy allows"| A["ALLOW"]
  C --> |"any applicable policy denies"| D["DENY"]`}
/>

Each policy decides on its own, using its own combining algorithm over its own rules. The engine then merges those verdicts with `policyCombine`, which defaults to `'and'`: every applicable policy must allow. A policy that has nothing to say is marked not applicable and skipped rather than counted as a deny.

## Writing the policies

**Ownership: only the author, or an admin, may write**

Create `src/policies.ts`:

```ts title="src/policies.ts"
import { definePolicy } from '@gentleduck/iam'

export const ownershipPolicy = definePolicy('document-ownership')
  .name('Document ownership')
  .desc('Writes to a document are limited to its author, unless the subject is an admin')
  .version(1)
  .algorithm('deny-overrides')
  .target({ actions: ['update', 'delete', 'share'], resources: ['document'] })
  .rule('deny-non-owner-write', (r) =>
    r
      .deny()
      .desc('Only the author may write, admins excepted')
      .priority(100)
      .on('update', 'delete', 'share')
      .of('document')
      .when((w) =>
        w.resourceAttr('ownerId', 'neq', '$subject.id').not((n) => n.role('admin')),
      ),
  )
  .rule('allow-owner-write', (r) =>
    r
      .allow()
      .desc('Nothing above objected, so this policy consents')
      .priority(1)
      .on('update', 'delete', 'share')
      .of('document'),
  )
  .build()
```

The deny rule fires when the document's `ownerId` differs from the subject's ID **and**
the subject is not an admin. The second rule is the policy's consent vote - keep reading,
it is not optional.

**Lifecycle: drafts are private, archives are frozen**

```ts title="src/policies.ts"
export const lifecyclePolicy = definePolicy('document-lifecycle')
  .name('Document lifecycle')
  .desc('Drafts are visible only to their author; archived documents are read-only')
  .version(1)
  .algorithm('deny-overrides')
  .target({ resources: ['document'] })
  .rule('deny-foreign-drafts', (r) =>
    r
      .deny()
      .desc('A draft is visible only to its author')
      .priority(60)
      .on('read')
      .of('document')
      .when((w) =>
        w
          .resourceAttr('status', 'eq', 'draft')
          .resourceAttr('ownerId', 'neq', '$subject.id'),
      ),
  )
  .rule('deny-archived-writes', (r) =>
    r
      .deny()
      .desc('Archived documents cannot be modified')
      .priority(60)
      .on('update', 'delete', 'share')
      .of('document')
      .when((w) => w.resourceAttr('status', 'eq', 'archived')),
  )
  .rule('allow-otherwise', (r) =>
    r.allow().desc('No lifecycle objection').priority(1).on('*').of('document'),
  )
  .build()

export const policies = [ownershipPolicy, lifecyclePolicy]
```

**Wire them into the adapter**

```ts title="src/access.ts"
import { IamEngine } from '@gentleduck/iam'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import { policies } from './policies'
import { roles } from './roles'

export const adapter = new IamMemoryAdapter({
  roles,
  policies,
  assignments: {
    alice: ['viewer'],
    bob: ['editor'],
    carol: ['admin'],
  },
})

export const engine = new IamEngine({ adapter, mode: 'development' })
```

`mode: 'development'` is what makes `engine.explain()` below available; it throws in
production mode.

**Run the matrix**

```ts title="src/main.ts"
import { engine } from './access'

const bobDoc = { type: 'document', id: 'doc-1', attributes: { ownerId: 'bob', status: 'published' } }
const aliceDoc = { type: 'document', id: 'doc-2', attributes: { ownerId: 'alice', status: 'published' } }
const aliceDraft = { type: 'document', id: 'doc-3', attributes: { ownerId: 'alice', status: 'draft' } }
const archived = { type: 'document', id: 'doc-4', attributes: { ownerId: 'bob', status: 'archived' } }

async function main() {
  console.log(await engine.can('bob', 'update', bobDoc))      // true
  console.log(await engine.can('bob', 'update', aliceDoc))    // false - not the owner
  console.log(await engine.can('carol', 'update', aliceDoc))  // true  - admin exception
  console.log(await engine.can('bob', 'read', aliceDoc))      // true  - published
  console.log(await engine.can('bob', 'read', aliceDraft))    // false - someone else's draft
  console.log(await engine.can('alice', 'read', aliceDraft))  // true  - her own draft
  console.log(await engine.can('bob', 'update', archived))    // false - frozen
  console.log(await engine.can('alice', 'update', aliceDoc))  // false - viewer has no update grant
}

void main()
```

## What just happened

Take the denial - Bob updating Alice's document - and ask the engine to narrate it:

```ts
const trace = await engine.explain('bob', 'update', aliceDoc)
console.log(trace.summary)
```

```text
DENIED: "bob" attempting update on document
  Roles: [editor, viewer]
  __rbac__ [allow-overrides]: Allowed by rule "__rbac__#5" (1/16 rules matched)
  document-ownership [deny-overrides]: Denied by rule "deny-non-owner-write" (2/2 rules matched)
  document-lifecycle [deny-overrides]: Allowed by rule "allow-otherwise" (1/3 rules matched)
  Result: Denied by rule "deny-non-owner-write"
```

1. `__rbac__` allows: Bob's `editor` role grants `update` on `document`.
2. `document-ownership` is applicable - its targets cover `update` on `document`. Both its rules match by shape; the deny rule's conditions hold (`ownerId` is `alice`, not `bob`; Bob is not an admin), so `deny-overrides` returns the deny.
3. `document-lifecycle` is applicable too, and its `allow-otherwise` rule matches, so it consents.
4. `policyCombine: 'and'` returns the first deny it meets. Overall: denied.

Remove `allow-owner-write` and Bob can no longer update *his own* document either. With only the deny rule left, the policy is still applicable for `update` on `document` - the rule's action and resource shape matches - but no rule *matched*, so `deny-overrides` falls through to `defaultEffect: 'deny'`. Under `policyCombine: 'and'` that is a deny vote, and the decision reads `No matching rules. Defaulted to deny` with `policy: 'document-ownership'` and no `rule`.

A policy that can deny must also be able to consent. Give every restriction policy a low-priority catch-all allow, or narrow its `target` so tightly that it is never applicable when its deny rules cannot fire.

A policy is skipped entirely - `applicable: false` - in exactly two cases: its `targets` do not match the request, or none of its rules covers this action and resource at all. Anything else counts as a vote.

## How a condition works

resource.attributes.ownerId"] --> RES["resolve(request, path)"]
  V["value$subject.id"] --> RESV["resolveValueleading dollar means resolve too"]
  RES --> |"'alice'"| OP["operator neq"]
  RESV --> |"'bob'"| OP
  OP --> R["true - the deny rule'scondition group holds"]`}
/>

```ts
interface ICondition {
  readonly field: string
  readonly operator: AccessControl.Operator
  readonly value?: IamPrimitives.AttributeValue
}
```

### Field resolution

| Path | Resolves to |
| --- | --- |
| `subject.id` | The subject ID |
| `subject.roles` | The effective role array |
| `subject.attributes.

```ts
// AND (the default for .when)
.when((w) => w.isOwner().resourceAttr('status', 'neq', 'archived'))

// OR
.whenAny((w) => w.role('admin').isOwner())

// NOT, nested inside an AND
.when((w) => w.isOwner().not((n) => n.role('suspended')))

// admin OR (editor AND owner)
.when((w) => w.or((o) => o.role('admin').and((a) => a.role('editor').isOwner())))
```

Groups nest up to `MAX_CONDITION_DEPTH`, which is 10; the comparison is `>=`, so a tree exactly ten groups deep evaluates and eleven throws `IamConditionGroupError`. It throws rather than answering `false` for the reason above - a `false` inside a `none` group is a grant. `validateRoles` and `validatePolicy` enforce the same bound at authoring time, so a policy that builds cannot hit it at runtime.

## The RuleBuilder API

```ts
definePolicy('example').rule('my-rule', (r) =>
  r
    .deny()                       // or .allow(); allow is the default
    .desc('why this rule exists')
    .priority(100)                // default 10
    .on('update', 'delete')       // default ['*']
    .of('document')               // default ['*']
    .forScope('team-acme')        // chapter 5
    .when((w) => w.isOwner())     // all-of group
    .meta({ owner: 'platform' }),
)
```

| Method | Default | Notes |
| --- | --- | --- |
| `.allow()` / `.deny()` | `allow` | The rule's effect. |
| `.desc(d)` | - | Surfaced in explain traces. |
| `.priority(n)` | `10` | Ranks matches under `first-match` and `highest-priority`. A non-finite priority ranks as `0`. |
| `.on(...actions)` | `['*']` | Replaces the list, does not append. |
| `.of(...resources)` | `['*']` | Also narrows the type of `.resourceAttr()` when the config is typed. |
| `.forScope(...scopes)` | none | Prepends `scope eq s` or `scope in [...]`. Passing only `'*'` is a no-op. |
| `.when(fn)` / `.whenAny(fn)` | empty `all` group | `all` versus `any` semantics. The later call wins. |
| `.meta(m)` | - | Never evaluated. |
| `.build()` | - | Merges any `forScope` condition into the group, so call order does not matter. |

`defineRule(id)` builds a rule outside a policy; `.addRule(rule)` puts a prebuilt rule into one. Rules are plain data and can be shared across policies.

## The PolicyBuilder API

| Method | Default | Notes |
| --- | --- | --- |
| `.name(n)` | the policy ID | Display name. |
| `.desc(d)` | - | Documentation only. |
| `.version(v)` | - | Your own change tracking; the engine ignores it. |
| `.algorithm(a)` | `'deny-overrides'` | How this policy's own rules combine. |
| `.target(t)` | matches everything | `actions`, `resources`, `roles` - each optional, each an OR within itself, all ANDed together. |
| `.rule(id, fn)` | - | Inline rule. |
| `.addRule(rule)` | - | Prebuilt rule. |
| `.build()` | - | Validates the whole policy and throws on error-level issues. |

`PolicyBuilder.build()` runs the full policy validator and throws a message naming the policy ID and every failing code, for example `INVALID_OPERATOR` or `UNRESOLVABLE_FIELD`. Warnings do not throw: `BROAD_ALLOW` fires when a rule allows `'*'` on `'*'` with no conditions, and limits are 1000 rules per policy, 100 actions and 100 resources per rule.

`targets.resources` uses the plain matcher, not the dot-aware hierarchical one that rule resources use. A target of `['document']` will not cover `document.draft`.

## Combining algorithms

else defaultEffect"]
  A --> |"allow-overrides"| D2["first allow, else first deny,else defaultEffect"]
  A --> |"first-match"| D3["highest priority match,ties by source order"]
  A --> |"highest-priority"| D4["highest priority match"]`}
/>

| Algorithm | Use it for |
| --- | --- |
| `deny-overrides` | Restriction policies. The default, and what both DocDuck policies use. |
| `allow-overrides` | Permissive layers. The synthetic `__rbac__` policy uses this - any role that grants the permission is enough. |
| `first-match` | Ordered, firewall-style lists. Despite the name it ranks by priority first and only falls back to source order on ties. |
| `highest-priority` | Emergency overrides layered over a stable rule set. |

When no rule matched, every algorithm returns `defaultEffect` with the reason `No matching rules. Defaulted to deny`.

## Combining policies

`policyCombine` is engine-level and defaults to `'and'`.

| Value | Behaviour |
| --- | --- |
| `'and'` | Every applicable policy must allow. The first deny wins and short-circuits. |
| `'allow-overrides'` | The first applicable allow wins; a deny only stands if nothing allowed. |
| `'first-applicable'` | The first policy that actually matched a rule decides. Development mode only - the production compiled table cannot represent it, and the constructor throws if you pair them. |

Not-applicable policies are skipped under all three. When nothing was applicable at all, the reason reads `No policy applicable. Defaulted to deny`.

## Try it

1. Delete `allow-owner-write` and rerun the matrix. Every write, including Bob's own, becomes `false`. Put it back.
2. Add a suspension rule to `document-ownership`: deny every write when `subject.attributes.status` is `'suspended'`. Seed the adapter with `attributes: { bob: { status: 'suspended' } }` and confirm Bob loses write access to his own document.
3. Add an expiry rule: deny `read` when `resource.attributes.expiresAt` is `before` `'$environment.now'`. Pass an explicit `environment` of `{ now: Date.parse('2030-01-01') }` and watch the same document flip.
4. Switch `document-lifecycle` to `algorithm('highest-priority')` and give `allow-otherwise` a priority of `100`. The deny rules stop mattering - that is the algorithm doing exactly what it says.

## See also

* [Building policies](/duck-iam/core/policies/building) - the builder reference
* [Rules](/duck-iam/core/policies/rules) and [targets](/duck-iam/core/policies/targets)
* [Conditions](/duck-iam/core/policies/conditions) - the full operator semantics table
* [Dollar variables](/duck-iam/core/policies/dollar-variables) and [nesting](/duck-iam/core/policies/nesting)
* [Combining algorithms](/duck-iam/core/policies/combining-algorithms) and [cross-policy combination](/duck-iam/core/cross-policy)
* [Chapter 4: the engine in depth](/duck-iam/course/chapter-4)