`IamPrismaAdapter` takes a Prisma Client and maps the adapter interface onto four models: `AccessPolicy`, `AccessRole`, `AccessAssignment`, `AccessSubjectAttr`. It has no dependency on `@prisma/client` — the constructor accepts anything structurally matching `IamPrisma.ILike`, which is just those four delegates with the handful of methods the adapter calls.

## Install

`prisma` is a dev dependency (`bun add -D prisma`).

```ts
import { IamPrismaAdapter, iamPrismaAdapter } from '@gentleduck/iam/adapters/prisma'
import type { IamPrisma } from '@gentleduck/iam/adapters/prisma'
```

## Setup

**Add the four models** to your `schema.prisma`. A copy ships at `node_modules/@gentleduck/iam/src/adapters/prisma/schema.prisma`.

```prisma
model AccessPolicy {
  id          String   @id
  name        String
  description String?
  version     Int      @default(1)
  algorithm   String   @default("deny-overrides")
  rules       Json
  targets     Json?
  createdBy   String?  @map("created_by")
  updatedBy   String?  @map("updated_by")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("iam_policies")
}

model AccessRole {
  id          String             @id
  name        String
  description String?
  permissions Json
  inherits    String[]           @default([])
  scope       String?
  metadata    Json?
  createdBy   String?            @map("created_by")
  updatedBy   String?            @map("updated_by")
  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")
  assignments AccessAssignment[]

  @@index([scope])
  @@map("iam_roles")
}

model AccessAssignment {
  id        String     @id @default(cuid())
  subjectId String     @map("subject_id")
  roleId    String     @map("role_id")
  scope     String?
  role      AccessRole @relation(fields: [roleId], references: [id], onDelete: Cascade)
  createdBy String?    @map("created_by")
  updatedBy String?    @map("updated_by")
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@unique([subjectId, roleId, scope])
  @@index([subjectId])
  @@index([roleId])
  @@index([subjectId, scope])
  @@map("iam_assignments")
}

model AccessSubjectAttr {
  subjectId String   @id @map("subject_id")
  data      Json
  createdBy String?  @map("created_by")
  updatedBy String?  @map("updated_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("iam_subject_attrs")
}
```

**Replace the unique index by hand.** This step is not hygiene — skip it and `assignRole` accumulates duplicate unscoped grants under concurrency.

`scope` is nullable, SQL unique indexes treat NULLs as distinct, and Prisma can express neither `NULLS NOT DISTINCT` nor a `coalesce` index. So `@@unique([subjectId, roleId, scope])` does **not** prevent two identical *unscoped* grants. `assignRole` is a read-then-write — the composite key includes a nullable column, so `upsert` cannot address the row — and a read cannot make a write atomic. The index is what actually decides the outcome: the e2e suite measures twenty concurrent identical unscoped grants leaving **three** rows under the plain index and exactly one under `NULLS NOT DISTINCT`.

```sql
-- Postgres 15+
DROP INDEX "iam_assignments_subject_id_role_id_scope_key";
CREATE UNIQUE INDEX "iam_assignments_subject_id_role_id_scope_key"
  ON "iam_assignments" ("subject_id", "role_id", "scope") NULLS NOT DISTINCT;

-- MySQL / SQLite
CREATE UNIQUE INDEX "iam_assignments_subject_id_role_id_scope_key"
  ON "iam_assignments" ("subject_id", "role_id", (coalesce("scope", '')));
```

**Migrate and generate.**

```bash
bunx prisma migrate dev --name add-iam-models
bunx prisma generate
```

**Construct the adapter.** The client is the only argument — there is no config object.

```ts
import { PrismaClient } from '@prisma/client'
import { IamEngine } from '@gentleduck/iam'
import { IamPrismaAdapter } from '@gentleduck/iam/adapters/prisma'

const prisma = new PrismaClient()
const adapter = new IamPrismaAdapter(prisma)
const engine = new IamEngine({ adapter })
```

`iamPrismaAdapter(prisma)` is the same thing for callers who prefer a factory to `new`.

## Options

There is no options object. `IamPrismaAdapter` is generic over `TAction`, `TResource`, `TRole`, `TScope` (all defaulting to `string`) and `TPrisma extends IamPrisma.ILike`, and the constructor takes one positional argument.

| Parameter | Type | Default | Meaning |
| --- | --- | --- | --- |
| `prisma` | `TPrisma extends IamPrisma.ILike` | required | Any object exposing the `accessPolicy`, `accessRole`, `accessAssignment`, and `accessSubjectAttr` delegates. A real `PrismaClient` satisfies it; so does a test double. |

Unlike the drizzle, redis, file, and http adapters, this one has no error hook and no configuration at all — there is nowhere to wire a handler without changing the constructor. Corrupt-row reports therefore go to `console.warn`, which is a fallback and not silence: see [Row validation](#row-validation).

`IamPrisma.ILike` is the contract your client has to satisfy, and it is deliberately narrow:

```ts
export namespace IamPrisma {
  export interface ILike {
    accessPolicy: {
      findMany: (args?: unknown) => Promise<IPolicyRow[]>
      findUnique: (args: { where: { id: string } }) => Promise<IPolicyRow | null>
      upsert: (args: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }) => Promise<IPolicyRow>
      deleteMany: (args: { where: { id: string } }) => Promise<{ count: number }>
    }
    accessRole: {
      /* findMany, findUnique, upsert, deleteMany over IRoleRow */
    }
    accessAssignment: {
      findMany: (args: { where: { subjectId: string; roleId?: string; scope?: string | null }; take?: number }) => Promise<IAssignmentRow[]>
      create: (args: { data: Record<string, unknown> }) => Promise<IAssignmentRow>
      deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>
      updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<{ count: number }>
    }
    accessSubjectAttr: {
      findUnique: (args: { where: { subjectId: string } }) => Promise<IAttrRow | null>
      upsert: (args: { where: { subjectId: string }; create: Record<string, unknown>; update: Record<string, unknown> }) => Promise<IAttrRow>
    }
  }
}
```

Row shapes are exported alongside it: `IamPrisma.IPolicyRow`, `IRoleRow`, `IAssignmentRow`, `IAttrRow`. Note that `IAssignmentRow` is only `{ subjectId, roleId, scope }` — the adapter never reads `id` or `createdAt`.

## Storage layout

Four models, one relation. `AccessAssignment.roleId` references `AccessRole.id` and cascades on delete; nothing else is related.

The models map to the same physical table names the [Drizzle schemas](/duck-iam/integrations/adapters/drizzle#storage-layout) use — `iam_policies`, `iam_roles`, `iam_assignments`, `iam_subject_attrs` — with snake-case column names via `@map`. The two adapters can therefore read the same database. The Prisma schema is a reduced mirror: Prisma cannot express CHECK constraints or partial indexes, so the blank-string and date-ordering checks the Drizzle schemas carry are absent and the adapter validates instead, and `iam_assignments` has no `starts_at` / `expires_at` / `attributes`. If you plan to share a database, generate the tables from the Drizzle schema — it is the superset — and point Prisma at them.

`inherits` is `String[]`, a native array, which restricts this exact schema to Postgres and CockroachDB. On MySQL, SQLite, SQL Server, or MongoDB change it to `Json` — the adapter reads `row.inherits ?? []` and writes `r.inherits ?? []`, so a JSON array round-trips identically.

`@@unique([subjectId, roleId, scope])` is what makes an assignment addressable and what `updateAssignmentScope` has to work around — and, once you replace it in a migration, what makes `assignRole` idempotent under concurrency. `@@index([subjectId])` serves every subject read, `@@index([roleId])` backs the cascade and the role-wide revoke, and `@@index([subjectId, scope])` backs the scoped-subject lookup.

## Method mapping

| Adapter method | Prisma call |
| --- | --- |
| `listPolicies()` | `accessPolicy.findMany()`, each row through `parsePolicyRow` |
| `getPolicy(id)` | `accessPolicy.findUnique({ where: { id } })` |
| `savePolicy(p)` | `accessPolicy.upsert({ where: { id }, create, update })` |
| `deletePolicy(id)` | `accessPolicy.deleteMany({ where: { id } })` |
| `listRoles()` | `accessRole.findMany()`, each row through `parseRoleRow` |
| `getRole(id)` | `accessRole.findUnique({ where: { id } })` |
| `saveRole(r)` | `accessRole.upsert({ where: { id }, create, update })` |
| `getSubjectRoles(id)` | `accessAssignment.findMany({ where: { subjectId, scope: null } })`, deduplicated |
| `getSubjectScopedRoles(id)` | `accessAssignment.findMany({ where: { subjectId } })`, then `filter(r => r.scope != null)` |
| `assignRole(id, role, scope?)` | `findMany` for an existing row, then `create` when there is none; a `P2002` from a racing writer is treated as success |
| `revokeRole(id, role, scope?)` | `accessAssignment.deleteMany({ where: { subjectId, roleId, ...(scope !== undefined && { scope }) } })` |
| `updateAssignmentScope(…)` | `findMany` + `deleteMany` + `updateMany` — see [below](#moving-an-assignment-between-scopes) |
| `getSubjectAttributes(id)` | `accessSubjectAttr.findUnique({ where: { subjectId } })` |
| `setSubjectAttributes(id, attrs)` | read, merge in JavaScript, `accessSubjectAttr.upsert` |

`deleteRole(id)` is `accessRole.deleteMany({ where: { id } })`, and the relation's `onDelete: Cascade` removes that role's assignments with it. Both deletes use `deleteMany` rather than `delete` because Prisma's `delete` raises `P2025` when nothing matches, so deleting a row that is already gone threw here and no-opped on the other five adapters.

## Transactions and consistency

The adapter opens no transactions and never calls `prisma.$transaction`. It does implement `withClient`, so `engine.withTransaction(tx)` re-binds it to your interactive-transaction handle — a `tx` exposes the same delegates as the base client minus `$transaction` itself, which is why the structural typing pays off here. `withClient` returns a **new** adapter; the original keeps writing to its own client. Cache invalidations buffer in `pending` and fire on `flush()` after the commit, so a rolled-back grant never evicts another node's cache.

Otherwise every call is independent:

| Operation | Statements | Atomic? |
| --- | --- | --- |
| `savePolicy` / `saveRole` | one `upsert` | yes |
| `assignRole` | `findMany`, then `create` when absent | idempotent; atomicity comes from the unique index, not the read |
| `revokeRole` | one `deleteMany` | yes |
| `deletePolicy` / `deleteRole` | one `deleteMany` | yes, cascade included |
| `setSubjectAttributes` | `findUnique`, merge in JS, `upsert` | **no** — read-modify-write |
| `updateAssignmentScope` | `findMany`, `deleteMany`, `updateMany` | **no** — three statements |

`assignRole` reads first and creates only when it finds nothing, and treats the `P2002` a racing writer causes as success — the row the caller asked for exists, which is the whole of what `assignRole` promises. What makes that safe under concurrency is the unique index, which you have to install by hand for the unscoped case. Do not replace the read-then-write with a bare `create`: without the read, every repeat grant costs a round trip and a caught error.

`schema.prisma` has no `starts_at` / `expires_at` / `attributes` columns, deliberately, and `assignRole` **throws** on those options rather than dropping them. A break-glass grant issued with an expiry against an adapter that discards it is permanent while the batch API still reports `ok: true, applied: 1`. Use the [Drizzle adapter](/duck-iam/integrations/adapters/drizzle) if you need either.

The merge is `{ ...existing, ...attrs }` computed in the adapter between a read and an upsert. Two concurrent patches to the same subject can leave only one. Wrap the call in an interactive transaction with `SELECT … FOR UPDATE` semantics, or write the patch with a raw `jsonb ||`, if that matters for your workload.

## Scope

`scope` is a nullable column. NULL is a global grant, a non-NULL string is a scoped one, and `@@unique([subjectId, roleId, scope])` keeps one row per combination.

`getSubjectRoles` filters in SQL (`where: { subjectId, scope: null }`) and deduplicates; `getSubjectScopedRoles` fetches every row for the subject and filters `scope != null` in JavaScript, mapping each to `{ role, scope }`. Per-grant `attributes` are not part of this schema, so the scoped roles this adapter returns never carry an `attributes` field.

Until 2.1.0 this adapter returned every assignment collapsed into one list, so a role granted only for `org-1` was visible in every scope and the same subject decided differently here than under the memory or file adapter. It now filters `scope: null` in the query. If you replace this adapter, keep the split — see [Custom adapter](/duck-iam/integrations/adapters/custom#subject-store).

`revokeRole` without a `scope` deletes **every** assignment of that role for the subject, scoped and unscoped; with a `scope` it deletes only that one row.

### Moving an assignment between scopes

`updateAssignmentScope(subjectId, roleId, fromScope, toScope, actor?)` (since 5.5.0) moves a grant without losing its row identity — `id` and `createdAt` survive, which a delete-then-create would not. It has to work around the unique constraint, and the order of its three statements is load-bearing.

The `deleteMany` that clears the target scope is guarded by the preceding source-row lookup. Without that guard a call with a stale `fromScope` — one that matches nothing — would still delete the row at `toScope`, destroying the grant the caller was trying to move onto and leaving the subject with neither.

The conflict-drop used to guard the source row with `NOT: { scope: fromScope }`. On a nullable column that is three-valued logic: moving `org-1` to global asked for `scope IS NULL AND NOT (scope = 'org-1')`, whose second half is `NULL` for exactly the rows the first half selected. The global row was never deleted, the update left two of them, and which reading Prisma emitted for `NOT` had varied across client versions. The two scopes are compared in JavaScript now, where `null` compares the way it reads, and the e2e suite runs both readings of `NOT` so it stays that way.

Other behaviours the tests pin: a global assignment moves by matching `scope: null` and a scoped one moves back to global the same way; other subjects and other roles of the same subject are untouched; and the moved grant is visible through `getSubjectScopedRoles` immediately afterwards. `actor` lands in `updated_by`; `created_by` and `updated_by` are written from the actor a caller supplies and stay NULL when none is named.

## Row validation

`listPolicies`, `getPolicy`, `listRoles`, and `getRole` all run the row through `parsePolicyRow` / `parseRoleRow` from `@gentleduck/iam/core/validate` before returning it, so a policy whose `rules` no longer match the current shape never reaches the engine. This was a real gap until 3.1.0, when these four methods still returned bare casts.

What happens next is not symmetric, and the difference is the whole of the design.

A bad **role** row is **skipped and named**: `listRoles` drops it, returns the readable rows, and warns once per bad row; `getRole` returns `null` and warns. The warning carries the actual validation issues — `[@gentleduck/iam:prisma] unreadable role row "broken": <issues from validateRole>` — not just "it was bad", and a fully readable catalog produces no warning at all. This is a recent correction: the row used to be dropped with a bare null check and nothing written anywhere, so the same corrupt row named itself on file, redis, http and drizzle and vanished on Prisma, while Prisma's own *policy* path both threw and warned. Within one adapter the two halves of "this row is unreadable" disagreed.

What you saw without that warning: the role's permissions stop applying, every role inheriting it silently loses that branch, and — because `resolveEffectiveRoles` keeps a directly assigned id whether or not the catalog defines it — subjects still *hold* the role id while it grants nothing. A support ticket with no log line behind it.

A bad **policy** row is refused outright: the read **throws** and the engine denies until the row is repaired, because a dropped policy may be the one that says NO. `getPolicy` on a corrupt row throws rather than returning `null`, so a corrupt row cannot impersonate a deleted one.

Reporting is `console.warn` rather than `onPolicyError` for a structural reason: this adapter takes no options object, so there is nowhere to wire a handler without changing its constructor.

Subject attributes behave differently on purpose.

`getSubjectAttributes` throws `[@gentleduck/iam:prisma] corrupted attributes for "<id>" (expected JSON object, got array)` — or `null`, or `string`, or whatever the stored value actually is — rather than falling back to an empty bag. An empty bag would silently strip every ABAC condition and flip decisions with no operator signal. The engine routes the throw through `onError`, fails closed with a deny, and records it on `onMetrics`. Since 2.1.0.

The returned object is rebuilt key by key into a fresh `Record` rather than handed back as the Prisma-managed value, so the engine cannot hold a reference into Prisma's result. `setSubjectAttributes` is the one path that recovers from corruption: it catches the failed read and merges onto `{}`, so an operator can always overwrite a broken row instead of being locked out of fixing it.

## Gotchas

* **`IReadOptions.signal` is ignored.** The parameter is accepted for interface compatibility, but Prisma's delegates take no signal, so the engine's `adapterTimeoutMs` releases the request while the query keeps running. Set a database statement timeout as the real backstop.
* **`listPolicies` and `listRoles` select the whole table.** The engine refuses result sets over `maxPolicies` / `maxRoles` (both default `10_000`); raise those rather than paginating inside the adapter.
* **`deletePolicy` and `deleteRole` are idempotent,** because they use `deleteMany`. A `delete` would have raised `P2025` on a row that is already gone.
* **An unstored `roleId` is refused, and the refusal is translated.** The relation always made the database reject it, but Prisma leaked ``Foreign key constraint failed on the field: `roleId` `` straight from the driver where the other five raise the shared message. The error *code* `P2003` is matched rather than the message text, because the code does not move with the server's locale.
* **Prisma hands back already-parsed JSON.** A `rules` column that arrives as a *string* — the shape a TEXT column migrated in from another adapter produces — is refused, not parsed. `'[]'` read loosely looks like a policy with no rules, which under `deny-overrides` denies nothing.
* **Without the hand-written unique index,** duplicate unscoped grants accumulate under concurrency. The reads still answer one role and the revoke still clears all of them, so the damage is table growth rather than a wrong decision — but the fix is a migration, not a code change.
* **Multi-database.** The adapter itself is database-agnostic; only the `inherits String[]` line is Postgres-specific.

## See also

* [Adapters overview](/duck-iam/integrations/adapters) for how the four stores fit together
* [Drizzle adapter](/duck-iam/integrations/adapters/drizzle) for the same tables with per-grant expiry, audit columns, and an error hook
* [Custom adapter](/duck-iam/integrations/adapters/custom) for the full interface contract and the compliance suite
* [Scoped roles](/duck-iam/core/roles/scoped) for what a scope means at evaluation time
* [Admin API](/duck-iam/advanced/engine/admin) for the calls that reach these methods