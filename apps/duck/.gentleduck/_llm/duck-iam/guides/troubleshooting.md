Every message quoted below is a literal string thrown or logged by `@gentleduck/iam`. Search this page for the text between the brackets - the tag tells you which subsystem produced it.

## Start here

Pick your branch from the tag in the message, or from the fact that nothing was thrown at all.

The two branches under "Did something throw?" behave differently. A throw is a configuration or input problem and is always reproducible from a unit test; the tag in the message routes you to the right table below. A wrong decision with no throw is a policy problem, and the only reliable instrument is `explain()` - which is why the "mode development?" node exists: production mode never builds a trace, so a production-only bug has to be reproduced on a dev-mode replica before you can see `targetMatch`, `conditionsMet`, or the `conditions` array.

## Diagnostic toolbox

| Tool | Signature | What it tells you |
| --- | --- | --- |
| `engine.explain()` | `(subjectId, action, resource, environment?, scope?)` | Per-policy and per-rule trace: `targetMatch`, `actionMatch`, `resourceMatch`, `conditionsMet`, `decidingRuleId`. Development mode only. |
| `access.validateRoles()` | `(roles)` | `IamValidate.IResult` - `{ valid, issues }` with closed-set codes for the whole role catalog, including cycles and dangling parents. |
| `access.validatePolicy()` | `(policy)` | Same shape, for one policy: unreachable targets, unresolvable fields, bad operators, limit breaches. |
| `engine.stats.get()` | `()` | `{ policies, roles, rbacPolicy, mergedPolicies, subjects }`, each `{ hits, misses, size }`. Cache health, nothing else. |
| `engine.healthCheck()` | `()` | `{ ok, adapter, cacheHitRate, adapterLatencyMs, lastError?, compiledTable? }`. Adapter reachability, the last error the engine swallowed, and - only when the table could not be built - why. It never consults the invalidator, so `ok: true` says nothing about whether this replica is still subscribed. |
| `engine.preload()` | `({ validator?: boolean })` | Warms the caches at boot and surfaces adapter failures before the first request. Pass `{ validator: true }` to run the validators over what the adapter returned. |
| `engine.getEffectiveRoles()` | `(subjectId, scope?)` | The flattened role list after inheritance and scope merging - the fastest way to prove a role is or is not reaching the subject. |

Start with `explain()`. Nine times out of ten the trace names the rule and the failed condition outright.

## Engine configuration and startup

| Symptom | Cause | Fix |
| --- | --- | --- |
| ``[@gentleduck/iam:engine] defaultEffect 'allow' is a fail-open footgun. Pass `allowFailOpen: true` to confirm intent.`` | `new IamEngine({ defaultEffect: 'allow' })` without the companion flag. The constructor refuses to build. | This is a guard, not a default - `defaultEffect` is `'deny'` and should stay there. If you genuinely want an allow-by-default engine, add `allowFailOpen: true` and accept the startup warning. See [fail-closed defaults](/duck-iam/guides/production#fail-closed-defaults). |
| `[@gentleduck/iam:engine] engine configured with defaultEffect: 'allow' (fail-open). Every request with no applicable policy will be allowed.` (console warning) | The opt-in above succeeded. The warning fires on every boot by design so the configuration is greppable in logs. | Nothing to fix if intentional. If it is not intentional, remove both `defaultEffect: 'allow'` and `allowFailOpen`. |
| `[@gentleduck/iam:engine] policyCombine 'first-applicable' requires mode 'development'; the production fast path cannot represent it correctly.` | `policyCombine: 'first-applicable'` with `mode: 'production'`. | Use `'and'` or `'allow-overrides'` in production, or keep the deployment on `mode: 'development'`. |
| `[@gentleduck/iam:engine] maxPolicies must be a finite number >= 1` | The value was `NaN`, `Infinity`, `0`, or negative - usually `Number(process.env.IAM_MAX_POLICIES)` on an unset variable. | Parse and default explicitly: `Number(process.env.IAM_MAX_POLICIES ?? 10000)`. The same guard exists for `maxRoles`, `adapterTimeoutMs`, and `maxConcurrentSubjectLoads`. |
| `[@gentleduck/iam:engine] maxConcurrentSubjectLoads must be 0 (unbounded) or a finite number >= 1` | Same `NaN` path, or someone passed `-1` meaning "off". | `0` is the "unbounded" sentinel, not `-1`. |
| `[@gentleduck/iam:invalidator:redis] tenantId must match /^[A-Za-z0-9_-]{1,64}$/ (got "...")` | A tenant slug with a `:`, `*`, or `?` in it. The shape check exists because those characters would inject into the pub/sub channel pattern. | Slugify the tenant id before passing it. |
| `[@gentleduck/iam:metrics] sampleSize must be a positive integer (got X)` | `iamCreateMetricsAggregator({ sampleSize })` with a float, zero, or `NaN`. | Pass an integer; the default is fine for most deployments. |
| `[@gentleduck/iam:http] baseUrl scheme must be http: or https:, got X` / `baseUrl must not contain a query string or fragment` / `invalid baseUrl "..."` | Malformed policy-service URL. | Give a bare origin plus path, no query. |
| `[@gentleduck/iam:http] baseUrl host "..." resolves to a private/loopback range - set allowPrivateHosts: true to opt in` | SSRF guard. Pointing the HTTP adapter at `localhost` or an RFC1918 address is blocked unless you say so. | For local development set `allowPrivateHosts: true`. In production, fix the URL. |
| ``[@gentleduck/iam:http] `allowedHosts` not set - any host accepted. Pass `init.allowedHosts` for SSRF defense in depth.`` (console warning) | The HTTP adapter was constructed without a host allowlist. | Pass `allowedHosts: ['policies.internal']`. |
| ``[@gentleduck/iam:invalidator:redis] `secret` not set on channel "<channel>" - accepting unsigned pub/sub. Anyone with PUBLISH rights on the channel can wipe caches. Pass `secret` to require HMAC-SHA256.`` (console warning) | The Redis invalidator is running unsigned on that channel. The warning latches per channel, so one process running one invalidator per tenant reports each unsigned channel. | **Set `secret` in production.** Without it, any client with `PUBLISH` on the channel can force every replica to flush and re-read - a cheap denial-of-service and a cache-poisoning primitive. See [multi-instance invalidation](/duck-iam/guides/production#multi-instance-cache-invalidation). |
| `[@gentleduck/iam:file] IamFileAdapter constructed without rootDir. Any caller deriving the path from request data should set rootDir for defence in depth.` (console warning) | No `rootDir` containment on the file adapter. | Pass `rootDir`; the adapter then rejects any path that escapes it. |

The `allowFailOpen` flag exists so that turning the engine fail-open takes two
deliberate edits and leaves a permanent startup warning. It is not a
performance switch and not a convenience for local development - a
fail-open engine allows every request no policy covers, including
requests for actions you have not written policies for yet.

## Roles and policies rejected at build time

| Symptom | Cause | Fix |
| --- | --- | --- |
| `[@gentleduck/iam:builder] PolicyBuilder.build("<id>") rejected by validator - ...` | `build()` runs `validatePolicy()` and refuses to return an invalid policy. The codes after the dash are the real diagnosis. | Read the codes in the tables below. Call `access.validatePolicy(draft)` in a test to get the structured issues instead of a concatenated string. |
| `[@gentleduck/iam:builder] RoleBuilder.build(): role rejected by validator - ...` | Same for roles. | Same. |
| `UNREACHABLE_TARGET` - `Target admits "X" on "Y" but no allow rule covers it, so every request matching it is denied by this policy. Add a rule that allows it, or narrow the target.` | The policy `target` is wider than its rules. Because the policy is applicable but has no allow, it falls to `defaultEffect` and vetoes the request under `policyCombine: 'and'`. | This is an **error**, not a warning - it fails the build. Either add the missing allow rule or shrink the target. The single most common cause of "my role grants it but the check still denies". |
| `DANGLING_INHERIT` - `Role "X" inherits from "Y" which does not exist` | `.inherits('viewer')` where no role with id `viewer` is in the set being validated. Inheritance takes ids, not role objects. | Validate the whole catalog together: `access.validateRoles(allRoles)`, not role by role. |
| `CIRCULAR_INHERIT` - `Circular inheritance detected involving role "X" (cycle includes "Y")` | An inheritance cycle. | Break the edge named in the message. |
| `INHERITANCE_TOO_DEEP` - `Role "X" has an inheritance chain N deep; the runtime caps at 32 and silently drops anything past it` | The chain exceeds `MAX_INHERITANCE_DEPTH` (**32**, not 16). | Flatten the hierarchy. Anything past the cap is dropped at runtime without an error, which is why the validator is loud about it. |
| `UNRESOLVABLE_FIELD` - `Condition field "X" has no resolvable root (expected subject/resource/environment, or shorthand action/scope)` | A dot-path rooted at something that does not exist, such as `user.id` or `ctx.tenant`. Only `subject`, `resource`, and `environment` are resolvable roots. | Rewrite as `subject.id`, `resource.attributes.ownerId`, `environment.ip`. Use the `when()` helpers (`attr`, `resourceAttr`, `env`) so the prefix is added for you. |
| `INVALID_RULE` - `Rule "priority" must be a finite number (NaN/Infinity break highest-priority ranking)` | A computed priority that came out `NaN`. | Priorities must be finite. Only `highest-priority` reads them, but the validator checks always. |
| `INVALID_RULE` - ``Rule must have a "conditions" object (use `{ all: [] }` for an unconditional rule)`` | A hand-written rule object with no `conditions` key. | Builders always emit one; if you are constructing rules literally, add `conditions: { all: [] }`. |
| `LIMIT_EXCEEDED` | A policy blew `POLICY_LIMITS`: 1,000 rules per policy, 100 actions per rule, 100 resources per rule, 1,000 action-x-resource pairs per rule. | The Cartesian cap usually bites first: `.on(...10 actions).of(...110 resources)` is 1,100 pairs. Split the policy. |
| `INVALID_OPERATOR` / `INVALID_EFFECT` / `INVALID_ALGORITHM` / `INVALID_TYPE` | A string that is not in the closed set - typically from JSON loaded off an adapter rather than built with the builders. | Validate adapter rows at boot with `engine.preload({ validator: true })`. |
| `ERR_REGEX_CATASTROPHIC` | A `matches` pattern with more than 4 unbounded quantifiers, or longer than 128 characters. | Anchor the pattern and bound the quantifiers. Regexes are also cached, capped at 256 compiled entries. |
| `BROAD_ALLOW` / `EMPTY_ROLE` | Warnings, not errors. `valid` stays `true`. | Review, then ignore or fix. `BROAD_ALLOW` on an intentional superuser policy is expected. |

## Runtime denials and throws

| Symptom | Cause | Fix |
| --- | --- | --- |
| `explain() is not available in production mode` | `engine.explain()` on an engine built with `mode: 'production'`. The compiled table has no trace to give. | Reproduce on a development-mode engine over the same adapter, or keep one dev-mode replica out of the load balancer for diagnosis. |
| `[@gentleduck/iam:compiled] compileTable(): N roles exceeds the 32-role limit the compiled table's 32-bit grant mask can address without bit-index aliasing (role N and role N+32 would silently share a bit). Reduce the role count, or route this deployment through mode: 'development' instead.` | Production mode packs role grants into a 32-bit mask. Beyond 32 roles the bit indices alias. | Either drop to 32 roles or fewer, or run `mode: 'development'`. The throw happens inside `authorize()`, so it surfaces through `onError` and the request **fails closed** - you get denials, not silent aliasing. Watch for it in the first minutes after adding a role. |
| `[@gentleduck/iam:engine] permissions() refuses batches >1024 checks` | A permission map built from an unbounded list. | Chunk the checks, or narrow what the page actually needs. |
| `[@gentleduck/iam:engine] permissions(): subjectId must be a non-empty string <=1024 chars` / `explain(): subjectId must be a non-empty string <=1024 chars` | An empty string, `undefined` coerced, or an oversized opaque id. | Resolve the identity before calling; do not pass a raw header value. |
| `<name> must be a non-empty string (got ...)` / `<name> exceeds 1024-char cap` | Action, resource type, resource id, or scope failed the input guard. | Same - validate at the edge. |
| `attributes must be a plain object` / `attributes must have <=256 keys` / `attributes nesting depth N exceeds cap (16)` | A whole ORM row or a deeply nested document was passed as `resource.attributes`. | Project down to the fields your conditions actually read. This also makes the check faster. |
| `[@gentleduck/iam:engine] <label> timed out after 5000ms` | An adapter call exceeded `adapterTimeoutMs`. | The request denies (fail-closed). Fix the adapter or raise the timeout, and alert on the rate - a slow policy store turns into a site-wide outage of allows. |
| `[@gentleduck/iam:engine] adapter returned N policies; maxPolicies is M. Raise the limit or fix the adapter.` | The policy store grew past the cap, or a query lost its tenant filter and returned every tenant's rows. | Check the second cause first. Only raise `maxPolicies` once you have confirmed the count is legitimate. The same message exists for roles. |
| `[@gentleduck/iam:engine] subject load shed: N concurrent subject loads already in flight (cap M); rejecting new load for "<id>"` | `maxConcurrentSubjectLoads` back-pressure. A cold cache plus a traffic spike stampedes the adapter. | The shed request denies. Raise the cap, warm with `preload()`, raise `cacheTTL`, or fix whatever caused the mass invalidation. |
| `[@gentleduck/iam:conditions] matches input on field "X" is N bytes (> MAX_REGEX_INPUT_LENGTH=...); policy dropped as NotApplicable.` | A `matches` condition was pointed at a large attribute (a body, a blob of JSON). | Note the policy is dropped as **NotApplicable**, not denied - under `policyCombine: 'and'` that means it stops voting entirely. Match against a short, bounded field. |
| `unsupported snapshot schemaVersion X; expected 1` | `admin.import()` was handed a snapshot from a future version. | Export and import with matching versions. `ISnapshot.schemaVersion` is `1`. |

## Adapters and transports

| Symptom | Cause | Fix |
| --- | --- | --- |
| `[@gentleduck/iam:http] circuit open - refusing request` | Five consecutive failures tripped the breaker; it refuses for `circuitBreakerCooldownMs` (30s default). | The policy service is down. Every check in the window denies. Alert on this string. |
| `[@gentleduck/iam:http] circuit half-open probe in flight` | Cooldown elapsed and one probe is testing the service; concurrent callers are refused rather than piling on. | Transient by design. If it never clears, the service is still unhealthy. |
| `[@gentleduck/iam:http] HTTP 401: ...` / `HTTP 403: ...` | The `headers` you passed the HTTP adapter are wrong or expired. | Refresh the credential. Headers are static per instance - rebuild the adapter to rotate. |
| `[@gentleduck/iam:http] response body exceeds 4 MiB cap` | The policy endpoint returned more than the read cap. | Paginate the endpoint or move to a database adapter. |
| `[@gentleduck/iam:http] getSubjectRoles for "<id>" returned <type> (expected JSON array)` | The endpoint returned an object or a bare string. | Return a JSON array of role ids. |
| `[@gentleduck/iam:redis] role / scope must not contain NUL bytes` | A NUL byte in a role or scope id - almost always a truncated buffer or a fuzzing input. | Validate at the edge. Redis keys cannot represent it safely. |
| `[@gentleduck/iam:redis] corrupted attributes for "<id>" (JSON parse failed)` / `(not a JSON object)` | Someone wrote to the attribute key outside the adapter. Same message shape exists for `iam:drizzle`, `iam:file`, and `iam:prisma`. | Only write attributes through `engine.admin.setAttributes()`. |
| `[@gentleduck/iam:redis] dropped malformed row "<id>": <message>` (console warning) | One row failed shape validation on load. The rest of the catalog still loads. | Fix the row. The engine deliberately does not fail the whole load for one bad row, so this warning is easy to miss - alert on it. |
| `[@gentleduck/iam:file] IamFileAdapter path "<resolved>" escapes rootDir "<rootDir>"` / `path contains a ".." segment` / `path must be supplied as an absolute path` | Path traversal containment on the file adapter. | Pass an absolute path inside `rootDir`. |
| ``[@gentleduck/iam:invalidator:redis] subscribe to "<channel>" failed (<message>) - this node will not receive invalidations until a later subscribe() succeeds. Pass `onSubscribeError` to handle this.`` (console warning) | The pub/sub subscribe was rejected - NOAUTH, a bad ACL, an unreachable broker. The node receives nothing. | Page on it. Until a later `subscribe()` succeeds this replica serves pre-revocation decisions for up to one `cacheTTL` and `healthCheck()` still reports `ok: true`. |
| `[@gentleduck/iam:invalidator:redis] dropping unverifiable message on channel "<channel>" (<reason>). N prior drops coalesced.` (console warning) | An inbound invalidation was refused. The reason names which gate. | Wire `onMessageDropped` and read the reason. See [failure modes](/duck-iam/integrations/invalidators/redis#failure-modes). |

## Framework and client integration

| Symptom | Cause | Fix |
| --- | --- | --- |
| ``[@gentleduck/iam] iamAdminRouter requires an `authorize` callback. Mounting admin endpoints unauthenticated is never safe.`` | `iamAdminRouter(engine, {})`. The same guard exists as `iamBindAdminRouter` (Hono), `createIamAdminHandlers` (Next), and `createIamAdminOperations` (Nest). | Supply an `authorize` callback that checks the caller is an operator. Read-only admin endpoints leak your whole policy set; mutating ones let a caller grant themselves anything. |
| `[@gentleduck/iam:next] opts.getUserId is required - deriving identity from request headers is unsafe. Wire it from your auth middleware (cookie session, JWT, etc.).` | `withIamAccess()` without `getUserId`. | Derive the id from a verified session, never from `x-user-id`. See [identity sourcing](/duck-iam/guides/production#identity-sourcing-never-trust-client-headers). |
| `{ "error": "Forbidden (CSRF check failed)" }` with HTTP 403 on an admin route | The default `Sec-Fetch-Site` CSRF check rejected the request. Since 2.1.0 it is on by default. | For a browser admin UI, send same-origin requests. For a bearer-token or mTLS API, pass `csrfCheck: false`. For a custom origin allowlist, pass a predicate. |
| ``[@gentleduck/iam] admin router: default CSRF check enabled - ... Pass `csrfCheck: false` for bearer-token/mTLS APIs, or supply a custom predicate. See SECURITY.md "Admin router CSRF" section. (2.1.0 behavior change)`` (console notice, once per process) | You did not pass `csrfCheck` at all, so the default is active. | Make the choice explicitly and the notice stops. |
| `[@gentleduck/iam:vue] useAccess() called without provideAccess(). Use provideAccess() in a parent component or install the plugin.` | The composable was called outside the provider tree. | Wrap the app, or install the plugin. |
| `Failed to fetch permissions: <status>` (vanilla client) | The permissions endpoint returned a non-2xx. | Check the endpoint URL and that the session cookie is being sent. |
| `[@gentleduck/iam:engine] <hook> hook threw - swallowed to preserve decision` (console error) | One of your hooks threw. The decision is unaffected by design - a broken audit hook must not turn into a broken authorization system. | Fix the hook. Alert on this string; a silently failing `onDeny` means a silently empty audit log. |

## The check is wrong but nothing threw

No error message means the engine did exactly what your policies said. Work the trace.

A revoke that took effect on the pod you wrote it from and nowhere else is not
a policy problem. That replica's invalidation is not arriving - a subscribe
that failed, a connection killed and never restored, or a `secret` rolled to
only part of the fleet. The engine never re-issues SUBSCRIBE, and
`healthCheck()` does not consult the invalidator, so a deaf node reports
`ok: true` while serving pre-revocation decisions for up to one `cacheTTL`.
Check `PUBSUB NUMSUB <channel>` against the replica count before reading a
trace. The mirror case is a fresh grant that denies on the other pods.

```ts
const trace = await engine.explain('user-bob', 'update', {
  type: 'post',
  id: 'post-1',
  attributes: { ownerId: 'user-bob' },
})

console.dir(trace, { depth: null })
```

Read `trace.policies` in order:

| What you see | What it means | What to do |
| --- | --- | --- |
| `policies` is empty | No policy is applicable. The decision came from `defaultEffect`. | Either the action/resource pair has no policy at all, or every policy's `target` excluded it. |
| `targetMatch: false` | The policy's `target` did not admit this request. | Widen the target - and re-check for `UNREACHABLE_TARGET` afterwards. |
| `actionMatch: false` or `resourceMatch: false` on every rule | The policy is applicable by target but no rule covers the shape, so the policy returns `applicable: false` and abstains. | Add the rule. Note the policy is **not** denying here - it is abstaining. |
| `conditionsMet: false` with the condition listed | A condition evaluated false. The `conditions` array shows exactly which. | The three usual causes are below. |
| `decidingRuleId` naming a deny you did not expect | A rule matched under `deny-overrides`. | Look at that rule's conditions, or reorder under a different algorithm. |
| The policy allowed but the request was still denied | Another applicable policy denied. Under `policyCombine: 'and'` every applicable policy must allow. | Scan the whole `policies` array, not just the one you were editing. |

The three conditions that fail most often:

* **Strict equality.** `eq` is `===` with no coercion. `subject.id` of `'42'` against `resource.attributes.ownerId` of `42` is false. So is `'Admin'` against `'admin'`.
* **Numeric-only comparison.** `gt`, `gte`, `lt`, `lte` return false unless **both** operands are numbers. An ISO-8601 date compared with `gte` never matches. Use `before` / `after`, which coerce to epoch milliseconds.
* **A missing attribute.** `resolve()` returns `null` for a path that does not exist, and only `exists` treats `null` specially. If the resource was passed as `{ type: 'post', attributes: {} }`, every `resource.attributes.*` condition is comparing against `null`.

Before debugging conditions, confirm the grant is even present:
`await engine.getEffectiveRoles('user-bob', 'org-1')` returns the flattened
list after inheritance and scope merging. If the role you expect is missing,
the problem is assignment or scope, not the policy. Remember that a role
assigned with a scope only applies when the check passes that same scope, and
that `scopeMode` defaults to `'flat'` - exact match, no ancestor walk.

## Checks are slower than expected

`engine.stats.get()` returns `{ hits, misses, size }` for each of the five caches - `policies`, `roles`, `rbacPolicy`, `mergedPolicies`, `subjects`. There is no error counter; use `healthCheck().lastError` and the `onError` hook for that.

* **High `subjects` miss rate** - only the subject cache is bounded by `maxCacheSize` (default 1000). If you have more active subjects than that, raise it.
* **High miss rate everywhere** - `cacheTTL` (default 60 seconds, not milliseconds) is too short, or an invalidator is flushing more than it needs to.
* **`size` at zero after a while** - something is calling `engine.cache.invalidate()` or publishing broad invalidation events. Check the invalidator channel.
* **Good hit rates but still slow** - you are in `mode: 'development'`, which allocates a full decision object per check. Production mode is roughly 7x faster. See [modes](/duck-iam/advanced/engine/modes) and [benchmarks](/duck-iam/benchmarks).
* **A UI permission map dominating the profile** - pass `{ telemetry: false }` to `engine.permissions()` to skip per-check `onMetrics`.

Cold-start latency is a separate problem: call `await engine.preload()` at boot so the first real request does not pay the adapter round trip.

## Getting help

* Run [`engine.explain()`](/duck-iam/advanced/explain) and include the trace in the report.
* Include `engine.healthCheck()` output and the engine's `mode`, `policyCombine`, and `defaultEffect`.
* File issues at [github.com/gentleeduck/gentleduck/issues](https://github.com/gentleeduck/gentleduck/issues).

## See also

* [Cookbook](/duck-iam/guides/cookbook) - the working shapes of the recipes that go wrong here
* [Production hardening](/duck-iam/guides/production) - the configuration most of these errors are about
* [Validation](/duck-iam/advanced/validation) - the full issue-code reference
* [Explain](/duck-iam/advanced/explain) - the trace structure in detail