`@gentleduck/auth` and `@gentleduck/iam` are separate packages with zero code-level coupling - duck-auth imports nothing from duck-iam, and lists it only as an optional peer dependency. The seam between them is one function you write in your app: a projection from an auth-side identity plus session into an iam-side subject. This page shows that function, the request sequence around it, and the two places the pairing usually goes wrong.

## The split

* **[duck-auth](/duck-auth)** owns identities, credentials, sessions, MFA, providers, orgs, and the runtime that proves who the caller is.
* **duck-iam** owns roles, policies, conditions, and the engine that decides what the caller may do.

Keeping them separate means either can be swapped without touching the other. duck-auth states the contract explicitly in its orgs facet: each membership carries org-scoped roles, apps that pair iam project an `identity x org` pair into a subject whose roles come from `Membership.roles`, and the projection lives in app code.

## The request sequence

One guarded request, from cookie to decision.

Authentication runs first and is a hard gate - `resolveSession` returning `null` ends the request before the engine is consulted. Authorization runs second and never re-checks identity; it trusts the subject the projection handed it. That ordering is the whole contract: duck-iam has no concept of a credential, and duck-auth has no concept of a policy.

## Two ways to reach the engine

The projection is not always needed. Pick a lane based on where role assignments live.

`can()` takes a subject **ID** and resolves roles through the iam adapter - the subject cache, the TTL, and `engine.cache.invalidateSubject()` all apply. `authorize()` takes a fully-built `IamRequest.IAccessRequest` including the subject, so nothing is resolved and nothing is cached; you own freshness. Use `can()` when duck-iam is the system of record for role assignments. Use `authorize()` with a projection when duck-auth org memberships are.

## `projectToSubject`

The verified shapes:

```ts title="src/lib/project-to-subject.ts"
import type { Identities, Org, Sessions } from '@gentleduck/auth/core'
import type { IamRequest } from '@gentleduck/iam/core'

type Profile = {
  username: string
  email: string
  displayName?: string
  signupSource?: 'web' | 'cli' | 'api'
}

export function projectToSubject(
  identity: Identities.Me<Profile>,
  session: Sessions.Me,
  membership?: Org.Membership | null,
): IamRequest.ISubject {
  return {
    id: identity.id,
    // Global roles. Empty here because this app keeps every grant org-scoped.
    roles: [],
    // Org-scoped grants. `engine.authorize` merges the entries whose `scope`
    // matches `request.scope` into the effective role list.
    scopedRoles: membership
      ? membership.roles.map((role) => ({ role, scope: membership.orgId }))
      : [],
    attributes: {
      email: identity.profile.email,
      emailVerified: identity.emailVerified,
      // AAL is 1 | 2 | 3 (NIST 800-63B). Policies gate on it.
      aal: session.aal,
      // No `amr` field exists; the equivalent is the completed factor methods.
      factors: session.factors.map((f) => f.method),
      sessionKind: session.kind, // 'guest' | 'user' | 'apikey'
      fresh: session.fresh,
      tenantId: session.tenantId ?? '',
      impersonating: session.actingAs !== null,
    },
  }
}
```

The namespace is `Identities`, plural. It was exported as `Identity` for a while and renamed to match the name it carries in its own declaration and in every error message; `Identity` no longer resolves.

### Field by field

| iam `ISubject` field | duck-auth source | Note |
|---|---|---|
| `id` | `identity.id` | The auth identity ID doubles as the iam subject ID |
| `roles` | none | Identities carry **no** `roles` field. Roles exist only on `Org.Membership.roles` |
| `scopedRoles` | `membership.roles` mapped to `{ role, scope }` | `scope` is your org ID; `IScopedRole` also accepts per-grant `attributes` |
| `attributes.email` | `identity.profile.email` | There is **no** top-level `identity.email`; email lives inside `profile` |
| `attributes.emailVerified` | `identity.emailVerified` | This one **is** top-level |
| `attributes.aal` | `session.aal` | `1` | `2` | `3`, not the string `'aal2'` |
| `attributes.factors` | `session.factors[].method` | There is **no** `session.amr` |
| `attributes.sessionKind` | `session.kind` | `'guest'` | `'user'` | `'apikey'`. There is no `'m2m'` |
| `attributes.tenantId` | `session.tenantId` | Tenant lives on the **session**, not the identity |

`IamRequest.ISubject` has exactly four fields: `id`, `roles`, `scopedRoles?`, `attributes`. It has no `tenantId` of its own - thread the tenant through `attributes` and through the request's `scope`. Everything a policy condition needs to read must be inside `attributes`, reachable at the dot-path `subject.attributes.<key>`.

When you write attributes through `engine.admin.setAttributes()` the engine enforces a plain-object shape, at most 256 own keys, and nesting depth at most 16, throwing `[@gentleduck/iam:engine] attributes must have <=256 keys` and friends. Keep the projection flat and small; `session.factors` mapped to method strings rather than the raw objects is the reason for the `.map` above.

## Use it in a handler

```ts title="src/routes/delete-post.ts"
import { AuthError } from '@gentleduck/auth/core'
import { auth } from '~/lib/auth'
import { engine } from '~/lib/engine'
import { projectToSubject } from '~/lib/project-to-subject'

app.delete('/api/orgs/:orgId/posts/:id', async (req, res, next) => {
  try {
    const ctx = await auth.resolveSession({ headers: req.headers })
    if (!ctx || !ctx.identity) throw new AuthError('AUTH_UNAUTHENTICATED')

    const membership = await auth.orgs?.resolveMembership(req.params.orgId, ctx.identity.id)
    const subject = projectToSubject(ctx.identity, ctx.session, membership)
    const post = await getPost(req.params.id)

    const decision = await engine.authorize({
      subject,
      action: 'delete',
      resource: { type: 'post', id: post.id, attributes: { ownerId: post.ownerId, status: post.status } },
      scope: req.params.orgId,
    })

    const allowed = typeof decision === 'boolean' ? decision : decision.allowed
    if (!allowed) return res.status(403).json({ error: 'Forbidden' })

    await deletePost(req.params.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
```

Three things this snippet gets right that are easy to get wrong:

* `resolveSession` takes a `{ headers: Headers }`-shaped object, not a framework request. It returns `{ session, identity, anomaly? } | null`, and `identity` can be `null` on a live guest session - check both.
* `auth.orgs` is `OrgsImpl | null`. It is only constructed when `cfg.stores.orgs` was supplied, so the optional call is not defensive noise.
* `authorize()` returns `AccessControl.IDecision` in development mode and a plain `boolean` in production mode. Narrow before reading `.allowed`, or use `engine.can()` which is always boolean.

`AuthError` codes are underscored (`AUTH_UNAUTHENTICATED`, `AUTH_AAL_INSUFFICIENT`, `AUTH_SESSION_REVOKED`), not slashed, and each carries an HTTP `status`. Map an auth failure to 401 and an iam deny to 403; collapsing the two hides which layer refused, which is the first thing you need during an incident.

## Conditions that read session state

Because AAL and factor methods land in `subject.attributes`, a policy can gate on them directly.

```ts title="src/lib/policies.ts"
import { access } from './access'

export const highRiskPolicy = access
  .definePolicy('high-risk')
  .name('Step-up required for destructive actions')
  .algorithm('deny-overrides')
  .rule('require-aal2', (r) =>
    r
      .deny()
      .on('delete')
      .of('post', 'user')
      .when((w) => w.attr('aal', 'lt', 2))
      .desc('Block destructive actions below AAL2'),
  )
  .rule('require-fresh', (r) =>
    r
      .deny()
      .on('delete')
      .of('user')
      .when((w) => w.attr('fresh', 'eq', false))
      .desc('Block destructive actions on a stale session'),
  )
  .build()
```

`w.attr('aal', 'lt', 2)` compiles to the condition `subject.attributes.aal lt 2`. `lt` returns `false` unless both operands are numbers, so projecting `session.aal` as the number it is - not as a string like `'aal2'` - is what makes this rule work at all. See [condition operators](/duck-iam/core/policies/conditions).

## Driving step-up from an iam deny

duck-iam tells you *that* a rule denied and *which* rule; duck-auth performs the step-up. Wire them through the explain trace.

```ts
const trace = await engine.explain(subject.id, 'delete', {
  type: 'user',
  id: targetId,
  attributes: {},
})

// Find the deny rule that fired, by the rule ID you chose in the policy.
const steppedUp = trace.policies.some((p) =>
  p.rules.some((rule) => rule.matched && rule.effect === 'deny' && rule.ruleId === 'require-aal2'),
)

if (steppedUp) {
  const outcome = await auth.flows.checkStepUp(session, { aal: 2, methods: ['totp'] })
  if (!outcome.satisfied) {
    // outcome.reason is 'mfa-required' | 'fresh-required'; outcome.methods lists what will satisfy it.
    return res.status(401).json({ code: 'AUTH_STEP_UP_REQUIRED', methods: outcome.methods })
  }
}
```

`Explain.IRuleTrace` carries `ruleId`, `effect`, `matched`, `actionMatch`, `resourceMatch`, `conditionsMet`, and the full `conditions` group with actual versus expected per comparison. Naming your deny rules is what makes this pattern maintainable - the rule ID is the step-up signal. `explain()` throws in production mode, so run this path in development, or keep a development-mode engine alongside for diagnostics only.

The trace contains full rule contents, condition operands, and the subject's attributes, and its `summary` string interpolates IDs verbatim. Log it, do not ship it. See [explain](/duck-iam/advanced/explain).

After MFA completes, `auth.flows.completeStepUp({ currentSid, method: 'totp', code })` rotates the session; re-project and re-authorize with the new session.

## Multi-tenancy

Thread one identifier through both libraries. On the duck-auth side, tenant scope arrives as a `TenantContext` (`{ tenantId?: string }`) that store methods receive on every call, and lands on `session.tenantId`. On the duck-iam side the same value is the request `scope`.

```ts
const ctx = await auth.resolveSession({ headers: req.headers }, { expectedTenantId: tenant.id })
// A session belonging to another tenant resolves to `null` rather than throwing.

const orgs = (await auth.orgs?.listForIdentity(ctx.identity.id, { tenantId: tenant.id })) ?? []
const memberships = await Promise.all(
  orgs.map((org) => auth.orgs?.resolveMembership(org.id, ctx.identity.id, { tenantId: tenant.id })),
)

const subject: IamRequest.ISubject = {
  id: ctx.identity.id,
  roles: [],
  scopedRoles: memberships
    .filter((m): m is NonNullable<typeof m> => m != null)
    .flatMap((m) => m.roles.map((role) => ({ role, scope: m.orgId }))),
  attributes: { tenantId: tenant.id },
}

await engine.authorize({ subject, action: 'delete', resource, scope: 'org-123' })
```

One identity being `admin` in `org-1` and `viewer` in `org-2` is the native shape - the engine merges only the scoped entries whose scope matches the request. Under the engine's `scopeMode: 'hierarchical'`, a grant on `'org-1'` also applies to `'org-1.team-2'`. See [scoped roles](/duck-iam/core/roles/scoped).

`auth.orgs.addMember()` and `setRoles()` sanitize the role list without throwing: non-strings dropped, empty and over-128-character entries dropped, capped at 64 roles. A typo'd role never surfaces as an error - it just does not grant anything. Validate against your iam role catalog before writing, and run [`access.validateRoles()`](/duck-iam/advanced/validation) at boot.

## Caching the projection

Building the subject is a plain-object allocation, but `resolveMembership` is an adapter round-trip. For handlers that authorize several times, project once per request and reuse it.

```ts
export async function subjectForRequest(req: Req): Promise<IamRequest.ISubject> {
  if (req._iamSubject) return req._iamSubject
  const ctx = await auth.resolveSession({ headers: req.headers })
  if (!ctx?.identity) throw new AuthError('AUTH_UNAUTHENTICATED')
  const membership = await auth.orgs?.resolveMembership(req.params.orgId, ctx.identity.id)
  req._iamSubject = projectToSubject(ctx.identity, ctx.session, membership)
  return req._iamSubject
}
```

Do not cache across requests. The session's `aal`, `fresh`, and `actingAs` fields change under step-up, rotation, and impersonation; a stale projection authorizes against a session state that no longer exists. If you need cross-request caching, cache on the iam side instead - move assignments into the iam adapter and use `engine.can()`, where invalidation is a first-class operation.

## Impersonation

`auth.flows.impersonate()` requires an `authorize` predicate that the caller supplies; duck-auth's own comment says iam consumers wire `engine.authorize()` there and warns never to pass `() => true`. The resulting session carries `actingAs: { realIdentityId, startedAt, reason, expiresAt }`, which the projection above surfaces as `subject.attributes.impersonating`. Gate destructive actions on it:

```ts
.rule('no-destructive-while-impersonating', (r) =>
  r.deny().on('delete').of('billing', 'user').when((w) => w.attr('impersonating', 'eq', true)),
)
```

duck-auth's event envelope also carries an optional `iamDecisionId` field for correlating an authorization decision with an audit event - the one data-level hook between the two packages.

## When you do not need duck-iam

One role per user, no per-resource conditions, no multi-tenancy: drive permissions off the membership directly.

```ts
const membership = await auth.orgs?.resolveMembership(orgId, identity.id)
if (!membership?.roles.includes('admin')) return res.status(403).end()
if (session.aal < 2) throw new AuthError('AUTH_AAL_INSUFFICIENT', { required: 2, have: session.aal })
```

Adopt duck-iam when you need conditions ("editors may delete only their own posts"), several combining policies, or an audit trace of why a request was refused.

## See also

* [Bridging guide on the duck-auth side](/duck-auth/guides/iam-bridge)
* [Quick start](/duck-iam/guides) - where the engine and roles in these snippets come from
* [Scoped roles](/duck-iam/core/roles/scoped) - how `scopedRoles` and `scope` are matched
* [Explain](/duck-iam/advanced/explain) - the trace shape used for step-up detection
* [Production hardening](/duck-iam/guides/production) - identity sourcing rules for the guarded path