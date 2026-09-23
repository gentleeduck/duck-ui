An adapter is the only thing the engine needs from your storage: nineteen methods, thirteen of them required, that read and write policies, roles, assignments, and subject attributes. Everything else (caching, timeouts, inheritance, evaluation) lives in the engine, so a custom adapter for DynamoDB, MongoDB, Firestore, Supabase, or an in-house API is usually a few hundred lines.

## Install

The types you need are exported from the root entry: `IamAdapter` (the interface), `AccessControl` (`IPolicy`, `IRole`), `IamPrimitives` (`Attributes`), and `IamRequest` (`IScopedRole`).

## The interface

`IamAdapter.IAdapter` is the union of three stores, each generic over the same `TAction`, `TResource`, `TRole`, `TScope` parameters your engine is typed with.

```ts
import type { AccessControl, IamAdapter, IamPrimitives, IamRequest } from '@gentleduck/iam'

export namespace IamAdapter {
  /** Passed to every read. `signal` aborts when the engine times out or invalidates. Since 2.0.0. */
  export interface IReadOptions {
    readonly signal?: AbortSignal
  }

  /** Who made the write. May be dropped without throwing - it changes no future decision. */
  export interface IActorOptions {
    readonly actor?: string
  }

  /**
   * Optional per-assignment data. An adapter either stores these or throws and
   * names the field; dropping one silently is the failure this exists to stop.
   */
  export interface IAssignOptions extends IActorOptions {
    readonly startsAt?: Date
    readonly expiresAt?: Date
    readonly attributes?: IamPrimitives.Attributes
  }

  export interface IPolicyStore<TAction, TResource, TRole> {
    listPolicies(opts?: IReadOptions): Promise<AccessControl.IPolicy<TAction, TResource, TRole>[]>
    getPolicy(id: string, opts?: IReadOptions): Promise<AccessControl.IPolicy<TAction, TResource, TRole> | null>
    savePolicy(policy: AccessControl.IPolicy<TAction, TResource, TRole>, opts?: IActorOptions): Promise<void>
    deletePolicy(id: string): Promise<void>
  }

  export interface IRoleStore<TAction, TResource, TRole, TScope> {
    listRoles(opts?: IReadOptions): Promise<AccessControl.IRole<TAction, TResource, TRole, TScope>[]>
    getRole(id: string, opts?: IReadOptions): Promise<AccessControl.IRole<TAction, TResource, TRole, TScope> | null>
    saveRole(role: AccessControl.IRole<TAction, TResource, TRole, TScope>, opts?: IActorOptions): Promise<void>
    /** Deletes the role AND every grant naming it. The cascade is contract, not garnish. */
    deleteRole(id: string): Promise<void>
  }

  export interface ISubjectStore<TRole, TScope> {
    getSubjectRoles(subjectId: string, opts?: IReadOptions): Promise<TRole[]>
    getSubjectScopedRoles?(subjectId: string, opts?: IReadOptions): Promise<IamRequest.IScopedRole<TRole, TScope>[]>
    assignRole(subjectId: string, roleId: TRole, scope?: TScope, opts?: IAssignOptions): Promise<void>
    revokeRole(subjectId: string, roleId: TRole, scope?: TScope, opts?: IActorOptions): Promise<void>
    updateAssignmentScope?(
      subjectId: string,
      roleId: TRole,
      fromScope: TScope | undefined,
      toScope: TScope | undefined,
      actor?: string,
    ): Promise<boolean>
    assignRoleMany?(rows: readonly IAssignRow<TRole, TScope>[]): Promise<readonly number[] | null>
    revokeRoleMany?(rows: readonly IRevokeRow<TRole, TScope>[]): Promise<readonly number[] | null>
    getSubjectGrantBoundary?(subjectId: string, opts?: IReadOptions): Promise<number | null>
    getSubjectAttributes(subjectId: string, opts?: IReadOptions): Promise<IamPrimitives.Attributes>
    setSubjectAttributes(subjectId: string, attrs: IamPrimitives.Attributes, opts?: IActorOptions): Promise<void>
  }

  export interface IAdapter<TAction, TResource, TRole, TScope>
    extends IPolicyStore<TAction, TResource, TRole>,
      IRoleStore<TAction, TResource, TRole, TScope>,
      ISubjectStore<TRole, TScope> {
    /** Re-bind to a driver handle, typically a transaction. Absent means `engine.withTransaction` throws. */
    withClient?(client: unknown): IAdapter<TAction, TResource, TRole, TScope>
  }
}
```

`IamRequest.IScopedRole` is `{ role: TRole; scope?: TScope; attributes?: IamPrimitives.Attributes }`. The `attributes` field carries per-grant data that policy conditions read as `subject.scopedRoles[].attributes`; leave it undefined when your storage has none.

## Method by method

| Method | Required | Returns | Contract | Errors |
| --- | --- | --- | --- | --- |
| `listPolicies(opts?)` | yes | every stored policy | Order is irrelevant; the engine sorts nothing and evaluates all. Also used by `engine.healthCheck()` as the liveness probe. | Throw on backend failure, and **throw on a malformed policy row** rather than skipping it (see [Row validation](#row-validation)). |
| `getPolicy(id, opts?)` | yes | policy or `null` | `null` on miss, never `undefined` and never a throw for a missing id. | Backend failure only. |
| `savePolicy(policy)` | yes | `void` | Upsert keyed on `policy.id`; a second save with the same id replaces the first. | Backend failure, or a policy the read path would later refuse - validate before writing, because `loadPolicies` and a direct adapter call both bypass the admin API's checks. |
| `deletePolicy(id)` | yes | `void` | Idempotent; deleting an unknown id resolves. | Backend failure. |
| `listRoles(opts?)` | yes | every stored role | Same as `listPolicies`. | Same as `listPolicies`. |
| `getRole(id, opts?)` | yes | role or `null` | Same as `getPolicy`. | Backend failure. |
| `saveRole(role)` | yes | `void` | Upsert keyed on `role.id`. | Backend failure. |
| `deleteRole(id)` | yes | `void` | Idempotent, and it **cascades**: remove every grant naming the role. All six built-ins do, by FK or by hand. | Backend failure. |
| `getSubjectRoles(subjectId, opts?)` | yes | `TRole[]` | **Unscoped assignments only.** Scoped assignments must not appear here. `[]` for an unknown subject. | Backend failure. |
| `getSubjectScopedRoles?(subjectId, opts?)` | optional | `IScopedRole[]` | **Scoped assignments only**, one entry per `(role, scope)` pair. When absent the engine treats every subject as having no scoped roles, so scope-aware evaluation silently degrades. | Backend failure. |
| `assignRole(subjectId, roleId, scope?, opts?)` | yes | `void` | Idempotent: assigning the same `(role, scope)` twice must not throw or duplicate. Refuse a `roleId` you do not hold, refuse `scope: ''` and `scope: '*'`, and refuse any `opts` field you cannot store. | Backend failure; an unstored role; an unstorable option, named. |
| `revokeRole(subjectId, roleId, scope?)` | yes | `void` | With `scope`: remove only that scoped assignment. Without `scope`: remove **every** assignment of that role, scoped and unscoped. Idempotent. | Backend failure. |
| `updateAssignmentScope?(subjectId, roleId, fromScope, toScope, actor?)` | optional | `boolean` | Move one assignment in a single write. Return `false` when nothing matched `fromScope`, and let `false` mean *nothing was written*; the engine then falls back to `revokeRole` + `assignRole`. `actor` is an audit hint (drizzle writes it to `updated_by`). | Backend failure. |
| `assignRoleMany?(rows)` | optional | `number[]` or `null` | One set-based write. Return the indices into `rows` of the grants actually written, or `null` when your driver cannot say which were new. Indices, not rows, so two rows asking for the same write stay distinguishable. | Refuse the whole batch on one bad row; half-applied is worse. |
| `revokeRoleMany?(rows)` | optional | `number[]` or `null` | The same for revokes. A row with no `scope` revokes the role in every scope. | As above. |
| `getSubjectGrantBoundary?(subjectId, opts?)` | optional | `number` or `null` | Earliest **future** `startsAt` / `expiresAt` across the subject's grants, epoch ms, so the engine caps its cache entry there instead of serving a lapsed grant for a full TTL. `null` when nothing is time-boxed. | Backend failure. |
| `withClient?(client)` | optional | `IAdapter` | Re-make this adapter against an opaque driver handle, keeping every other config field. Return a **new** adapter; a `return this` still commits inside a rolled-back transaction. Absent means `engine.withTransaction` throws. | — |
| `getSubjectAttributes(subjectId, opts?)` | yes | `Attributes` | `{}` for an unknown subject. Return a fresh object, the engine may hold on to it. | Backend failure, or a corrupt stored blob (built-ins throw rather than return `{}` so a bad row does not silently widen access). |
| `setSubjectAttributes(subjectId, attrs)` | yes | `void` | **Merge**, do not replace: keys absent from `attrs` survive, keys present are overwritten. A `null` value clears that key from the policy's point of view. | Backend failure. |

### Policy store

`savePolicy` and `saveRole` are upserts and the engine relies on that: `admin.import({ mode: 'merge' })` is a loop of saves. Do not enforce uniqueness on `name`, the engine keys everything on `id`. Reads receive `IReadOptions`; the engine wraps each read in `adapterTimeoutMs` (default 5000, `0` disables) and rejects with `[@gentleduck/iam:engine] 

Concurrent cold calls for the same subject (or for the policy set) are collapsed into one adapter call: the engine keeps an in-flight map, so a burst of 500 requests for a fresh subject produces one `getSubjectRoles`, not 500. `maxConcurrentSubjectLoads` (default `512`; `0` restores unbounded) caps how many distinct subjects may be loading at once; past the cap a new load is rejected with an error containing `subject load shed`, which surfaces through the fail-closed `onError` path.

Writes go through `engine.admin` and are followed by an invalidation the adapter does not need to know about:

| Admin call | Adapter method | Invalidation |
| --- | --- | --- |
| `savePolicy` / `deletePolicy` | `savePolicy` / `deletePolicy` | policy cache |
| `saveRole` / `deleteRole` | `saveRole` / `deleteRole` | role cache + subjects holding that role id |
| `assignRole` / `revokeRole` | `assignRole(id, role, scope)` / `revokeRole` | that subject |
| `updateAssignmentScope` | `updateAssignmentScope` if defined and it returns `true`, else `revokeRole` + `assignRole` | that subject |
| `setAttributes` | `setSubjectAttributes` | that subject |

The admin API validates policies and roles (`validatePolicy` / `validateRole`) and checks that `attrs` is a plain object before calling you - but it is not the only way into your write methods. `engine.loadPolicies` and a direct adapter call both bypass it, so run your own guard rather than trusting the caller. See [Admin API](/duck-iam/advanced/engine/admin) and [Caching](/duck-iam/advanced/engine/caching).

Every read method receives an optional `{ signal }`. The engine aborts it when `adapterTimeoutMs` elapses and when an invalidation supersedes an in-flight load. Honour the signal if your driver supports it; if you ignore it the engine still times out, but the request keeps running in the background.

## Row validation

Storage can hold rows that no longer match the current policy schema (an old deployment, a manual edit, a migration gone wrong). The built-in adapters run each row through `parsePolicyRow` / `parseRoleRow` from `@gentleduck/iam/core/validate` and report every failure through an `onPolicyError(err, { adapter, rowId })` hook; without a hook they `console.warn`.

What happens next is **not** symmetric, and this is the single most important rule on the page. A malformed **policy** row is reported and then *thrown* - the whole read fails and the engine denies - because the dropped policy may be the one that says NO, and under `policyCombine: 'and'` even an allow-only policy votes deny when none of its rules match. There is no subset of policies an adapter can safely drop without knowing a combine mode it cannot see. A malformed **role** row is reported and dropped, and the rest of the catalog is returned, because role permissions are allow-only: losing one can only cost a subject a grant. A corrupt attribute bag throws for the same reason as a policy - `{}` silently retires every deny rule that tests an attribute.

```ts
import { parsePolicyRow, parseRoleRow } from '@gentleduck/iam/core/validate'

async listPolicies(): Promise<AccessControl.IPolicy[]> {
  const rows = await this.collection.find({}).toArray()
  const out: AccessControl.IPolicy[] = []
  for (const row of rows) {
    const policy = parsePolicyRow(row)
    if (policy === null) {
      // Report, then refuse the whole read: a dropped policy may be the one that denies.
      this.onPolicyError?.(new Error('invalid policy row'), { adapter: 'mongo', rowId: String(row._id) })
      throw new Error(`[@gentleduck/iam:mongo] policy "${row._id}" cannot be read and will not be skipped`)
    }
    out.push(policy)
  }
  return out
}
```

`parsePolicyRow` returns the typed policy or `null`; it does not return a result object, so test it against `null` rather than reading an `ok` field. `parseRoleRow` mirrors it. See the [Validation](/duck-iam/advanced/validation) page for the full contract. These are the same helpers the file, redis, http, prisma, and drizzle adapters use.

## Sketches

### DynamoDB

```ts
import type { AccessControl, IamAdapter, IamPrimitives, IamRequest } from '@gentleduck/iam'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

export class DynamoAdapter<TAction extends string, TResource extends string, TRole extends string, TScope extends string>
  implements IamAdapter.IAdapter<TAction, TResource, TRole, TScope>
{
  constructor(
    private readonly doc: DynamoDBDocument,
    private readonly table: string,
  ) {}

  async listPolicies(): Promise<AccessControl.IPolicy<TAction, TResource, TRole>[]> {
    const res = await this.doc.query({
      TableName: this.table,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': 'POLICY' },
    })
    return (res.Items ?? []).map((i) => i.data as AccessControl.IPolicy<TAction, TResource, TRole>)
  }

  async getPolicy(id: string): Promise<AccessControl.IPolicy<TAction, TResource, TRole> | null> {
    const res = await this.doc.get({ TableName: this.table, Key: { pk: 'POLICY', sk: id } })
    return (res.Item?.data as AccessControl.IPolicy<TAction, TResource, TRole> | undefined) ?? null
  }

  async savePolicy(policy: AccessControl.IPolicy<TAction, TResource, TRole>): Promise<void> {
    await this.doc.put({ TableName: this.table, Item: { pk: 'POLICY', sk: policy.id, data: policy } })
  }

  async deletePolicy(id: string): Promise<void> {
    await this.doc.delete({ TableName: this.table, Key: { pk: 'POLICY', sk: id } })
  }

  // Roles: same pattern with pk = 'ROLE'.

  async getSubjectRoles(subjectId: string): Promise<TRole[]> {
    const res = await this.doc.query({
      TableName: this.table,
      KeyConditionExpression: 'pk = :pk',
      FilterExpression: 'attribute_not_exists(scope)',
      ExpressionAttributeValues: { ':pk': `SUBJECT#${subjectId}` },
    })
    return (res.Items ?? []).map((i) => i.role as TRole)
  }

  async getSubjectScopedRoles(subjectId: string): Promise<IamRequest.IScopedRole<TRole, TScope>[]> {
    const res = await this.doc.query({
      TableName: this.table,
      KeyConditionExpression: 'pk = :pk',
      FilterExpression: 'attribute_exists(scope)',
      ExpressionAttributeValues: { ':pk': `SUBJECT#${subjectId}` },
    })
    return (res.Items ?? []).map((i) => ({ role: i.role as TRole, scope: i.scope as TScope }))
  }

  async assignRole(subjectId: string, roleId: TRole, scope?: TScope): Promise<void> {
    // sk encodes both parts so a repeat put is a no-op: idempotent by construction.
    await this.doc.put({
      TableName: this.table,
      Item: { pk: `SUBJECT#${subjectId}`, sk: `ROLE#${roleId}#${scope ?? ''}`, role: roleId, ...(scope && { scope }) },
    })
  }

  async revokeRole(subjectId: string, roleId: TRole, scope?: TScope): Promise<void> {
    if (scope !== undefined) {
      await this.doc.delete({ TableName: this.table, Key: { pk: `SUBJECT#${subjectId}`, sk: `ROLE#${roleId}#${scope}` } })
      return
    }
    // No scope: remove every assignment of this role.
    const res = await this.doc.query({
      TableName: this.table,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
      ExpressionAttributeValues: { ':pk': `SUBJECT#${subjectId}`, ':prefix': `ROLE#${roleId}#` },
    })
    for (const item of res.Items ?? []) {
      await this.doc.delete({ TableName: this.table, Key: { pk: item.pk, sk: item.sk } })
    }
  }

  async getSubjectAttributes(subjectId: string): Promise<IamPrimitives.Attributes> {
    const res = await this.doc.get({ TableName: this.table, Key: { pk: `SUBJECT#${subjectId}`, sk: 'ATTRS' } })
    return (res.Item?.data as IamPrimitives.Attributes | undefined) ?? {}
  }

  async setSubjectAttributes(subjectId: string, attrs: IamPrimitives.Attributes): Promise<void> {
    // Atomic merge: one UpdateExpression per key, no read-modify-write race.
    const names: Record<string, string> = {}
    const values: Record<string, unknown> = {}
    const sets: string[] = []
    Object.entries(attrs).forEach(([k, v], i) => {
      names[`#k${i}`] = k
      values[`:v${i}`] = v
      sets.push(`#d.#k${i} = :v${i}`)
    })
    names['#d'] = 'data'
    await this.doc.update({
      TableName: this.table,
      Key: { pk: `SUBJECT#${subjectId}`, sk: 'ATTRS' },
      UpdateExpression: `SET ${sets.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  }
}
```

### MongoDB

```ts
import type { AccessControl, IamAdapter, IamPrimitives, IamRequest } from '@gentleduck/iam'
import type { Db } from 'mongodb'

export class MongoAdapter implements IamAdapter.IAdapter {
  constructor(private readonly db: Db) {}

  async listPolicies(): Promise<AccessControl.IPolicy[]> {
    return this.db.collection<AccessControl.IPolicy>('iam_policies').find({}, { projection: { _id: 0 } }).toArray()
  }
  async getPolicy(id: string): Promise<AccessControl.IPolicy | null> {
    return this.db.collection<AccessControl.IPolicy>('iam_policies').findOne({ id }, { projection: { _id: 0 } })
  }
  async savePolicy(policy: AccessControl.IPolicy): Promise<void> {
    await this.db.collection('iam_policies').replaceOne({ id: policy.id }, policy, { upsert: true })
  }
  async deletePolicy(id: string): Promise<void> {
    await this.db.collection('iam_policies').deleteOne({ id })
  }

  // listRoles / getRole / saveRole / deleteRole: identical against 'iam_roles'.

  async getSubjectRoles(subjectId: string): Promise<string[]> {
    const rows = await this.db.collection('iam_assignments').find({ subjectId, scope: null }).toArray()
    return rows.map((r) => r.roleId as string)
  }
  async getSubjectScopedRoles(subjectId: string): Promise<IamRequest.IScopedRole[]> {
    const rows = await this.db.collection('iam_assignments').find({ subjectId, scope: { $ne: null } }).toArray()
    return rows.map((r) => ({ role: r.roleId as string, scope: r.scope as string }))
  }
  async assignRole(subjectId: string, roleId: string, scope?: string): Promise<void> {
    // A unique index on { subjectId, roleId, scope } plus upsert makes this idempotent.
    await this.db
      .collection('iam_assignments')
      .updateOne({ subjectId, roleId, scope: scope ?? null }, { $setOnInsert: { subjectId, roleId, scope: scope ?? null } }, { upsert: true })
  }
  async revokeRole(subjectId: string, roleId: string, scope?: string): Promise<void> {
    await this.db.collection('iam_assignments').deleteMany(scope === undefined ? { subjectId, roleId } : { subjectId, roleId, scope })
  }
  async getSubjectAttributes(subjectId: string): Promise<IamPrimitives.Attributes> {
    const row = await this.db.collection('iam_subject_attrs').findOne({ subjectId })
    return (row?.data as IamPrimitives.Attributes | undefined) ?? {}
  }
  async setSubjectAttributes(subjectId: string, attrs: IamPrimitives.Attributes): Promise<void> {
    const $set: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(attrs)) <MathMl mathml="<span class=&quot;katex&quot;><span class=&quot;katex-mathml&quot;><math xmlns=&quot;http://www.w3.org/1998/Math/MathML&quot;><semantics><mrow><mi>s</mi><mi>e</mi><mi>t</mi><mo stretchy=&quot;false&quot;>[</mo><mi mathvariant=&quot;normal&quot;>‘</mi><mi>d</mi><mi>a</mi><mi>t</mi><mi>a</mi><mi mathvariant=&quot;normal&quot;>.</mi></mrow><annotation encoding=&quot;application/x-tex&quot;>set[`data.</annotation></semantics></math></span><span class=&quot;katex-html&quot; aria-hidden=&quot;true&quot;><span class=&quot;base&quot;><span class=&quot;strut&quot; style=&quot;height:1em;vertical-align:-0.25em;&quot;></span><span class=&quot;mord mathnormal&quot;>se</span><span class=&quot;mord mathnormal&quot;>t</span><span class=&quot;mopen&quot;>[</span><span class=&quot;mord&quot;>‘</span><span class=&quot;mord mathnormal&quot;>d</span><span class=&quot;mord mathnormal&quot;>a</span><span class=&quot;mord mathnormal&quot;>t</span><span class=&quot;mord mathnormal&quot;>a</span><span class=&quot;mord&quot;>.</span></span></span></span>"/>{k}`] = v
    await this.db.collection('iam_subject_attrs').updateOne({ subjectId }, { $set }, { upsert: true })
  }
}
```

## Verify with the compliance suite

Every built-in adapter runs two vitest suites, both under `src/adapters/__compliance__/` in the package repository. Neither is on the package's `exports` map, but the `src` folder ships in the npm tarball, so copy `compliance.ts` and `engine-capability.ts` into your test tree (they import only `vitest` and the package's own types) and point them at your adapter.

```ts title="src/adapters/dynamo.compliance.test.ts"
import { runAdapterCompliance } from './compliance'
import { runEngineCapabilityCompliance } from './engine-capability'
import { DynamoAdapter } from './dynamo'

// The factory must return a FRESH, EMPTY store on every call.
runAdapterCompliance('DynamoAdapter', () => new DynamoAdapter(makeLocalDoc(), 'iam-test'), {
  supports: {
    getSubjectScopedRoles: true,
    updateAssignmentScope: false,
    getSubjectGrantBoundary: false,
    assignRoleMany: false,
    revokeRoleMany: false,
    withClient: false,
  },
})

runEngineCapabilityCompliance('DynamoAdapter', () => new DynamoAdapter(makeLocalDoc(), 'iam-test'))
```

`supports` decides which clauses are *registered*, and it is declared rather than probed. Declaring `true` for a method you do not implement fails loudly at the first clause; declaring `false` for one you do implement leaves it untested. The second suite wraps your adapter in an `IamEngine` and asserts `admin.updateAssignmentScope`, `moveRoleScopes`, `assignRoles` and `revokeRoles` - every clause runs on every adapter, because the engine falls back for the three optional writes.

The suite asserts the contracts above with a real sequence of calls:

* policies: `listPolicies` starts empty, `getPolicy` returns `null` on a miss, save then get round-trips, a second save with the same id upserts, `deletePolicy` removes, `listPolicies` returns everything saved, and a round-tripped policy's keys sort to `['algorithm', 'id', 'name', 'rules', 'version']` on every backend
* roles: round-trip, delete, and `deleteRole` taking its grants with it
* subjects: `getSubjectRoles` is `[]` by default; assign then read; revoke; `getSubjectRoles` returns **only** unscoped roles; `getSubjectScopedRoles` returns **only** scoped ones; revoke with scope removes just that scoped assignment; revoke without scope removes every assignment of the role; `''` and `'*'` are refused as grant scopes; an unstored role is refused
* attributes: `{}` by default, merge keeps existing keys, overwriting a key replaces it, subjects are isolated from one another

The HTTP adapter's compliance test is worth reading if you are building a remote store: it wires a reference REST server that the adapter is held against, which is also the clearest specification of the [HTTP wire protocol](/duck-iam/integrations/adapters/http#wire-protocol).

## Checklist

**Implement the thirteen required methods** and decide which of the six optional ones you want. `getSubjectScopedRoles` if you use scoped roles at all; `updateAssignmentScope` only if a single-write move is cheaper than revoke + assign in your store; `withClient` if your backend has a transaction handle worth joining, since without it `engine.withTransaction` throws.

**Make writes idempotent.** `savePolicy` / `saveRole` upsert on `id`; `assignRole` tolerates duplicates; `deletePolicy` / `deleteRole` / `revokeRole` resolve on unknown ids.

**Split scoped from unscoped.** `getSubjectRoles` never returns a scoped assignment; `revokeRole` without a scope removes all of them.

**Refuse what you cannot honour.** An unstored role, a `''` or `'*'` grant scope, an `IAssignOptions` field with nowhere to go. Accept-and-drop is the failure the contract exists to stop.

**Cascade `deleteRole`.** The role and every grant naming it go together.

**Merge attributes** and return `{}` for unknown subjects. Throw on a corrupt blob rather than returning `{}`, so a broken row cannot quietly change a decision.

**Validate rows on read** with `parsePolicyRow` / `parseRoleRow`, expose an `onPolicyError` hook, and get the asymmetry right: throw on a bad policy row, drop a bad role row.

**Forward `signal`** to your driver, and keep every read cheap enough to finish inside `adapterTimeoutMs`.

**Run the compliance suite** with a fresh store per factory call, then run your engine tests against `IamMemoryAdapter` and your adapter side by side; they must produce identical decisions.

## Publishing

If you ship the adapter as a package, name it `@your-scope/iam-adapter-<backend>`, declare `@gentleduck/iam` as a peer dependency, and include the compliance test in CI so a future contract change (a new optional method, a new `IAssignOptions` field) shows up as a failing test rather than a silent behaviour change.

## See also

* [Adapters overview](/duck-iam/integrations/adapters) for how the stores fit together
* [Memory adapter](/duck-iam/integrations/adapters/memory) as the reference implementation to diff against
* [HTTP adapter](/duck-iam/integrations/adapters/http) for the remote-store wire protocol
* [Caching](/duck-iam/advanced/engine/caching) for what the engine caches on top of your adapter