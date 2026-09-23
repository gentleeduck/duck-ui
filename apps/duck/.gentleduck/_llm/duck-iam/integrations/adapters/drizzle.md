`IamDrizzleAdapter` maps the adapter interface onto four SQL tables through a Drizzle `db` handle. It is the only one of the six that implements all six optional methods. The package ships a ready schema for each of the three dialects Drizzle supports, so the usual setup is: re-export one schema file, run `drizzle-kit generate`, hand the adapter your `db` and the `eq`/`and` operators.

## Install

`drizzle-kit` is a dev dependency (`bun add -D drizzle-kit`). `drizzle-orm` is an optional peer dependency of `@gentleduck/iam`; nothing else is required.

The adapter lives at `@gentleduck/iam/adapters/drizzle`, and each dialect's schema at its own subpath:

```ts
import { IamDrizzleAdapter, createIamDrizzleAdapter, iamDrizzleAdapter } from '@gentleduck/iam/adapters/drizzle'
import type { IamDrizzle } from '@gentleduck/iam/adapters/drizzle'

import { iamPolicies, iamRoles, iamAssignments, iamSubjectAttrs, combineAlgorithm } from '@gentleduck/iam/adapters/drizzle/pg'
import type { Pg } from '@gentleduck/iam/adapters/drizzle/pg'
```

The schemas used to live at `@gentleduck/iam/adapters/drizzle/schema/{pg,mysql,sqlite}`. Since 5.4.1 they are `@gentleduck/iam/adapters/drizzle/{pg,mysql,sqlite}`, and each folder also exports its own row-type namespace (`Pg`, `Mysql`, `Sqlite`). The old `schema/` paths are gone, not deprecated.

## Setup

**Re-export a dialect schema** from your own schema barrel so `drizzle-kit` sees the tables.

```ts title="db/schema.ts"
export * from '@gentleduck/iam/adapters/drizzle/pg'

// your own tables alongside
import { pgTable, text } from 'drizzle-orm/pg-core'
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
})
```

**Generate and apply the migration.** Point `drizzle.config.ts` at that barrel, then run the two commands.

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

**Construct the adapter** with the `db`, the four tables, and the operators. `isNull` and `or` are optional; each one you omit takes a slower path and warns at construction.

```ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, eq, isNull, or } from 'drizzle-orm'
import { Pool } from 'pg'
import { IamEngine } from '@gentleduck/iam'
import { IamDrizzleAdapter } from '@gentleduck/iam/adapters/drizzle'
import { iamAssignments, iamPolicies, iamRoles, iamSubjectAttrs } from '@gentleduck/iam/adapters/drizzle/pg'

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }))

const adapter = new IamDrizzleAdapter({
  dialect: 'pg',
  db,
  tables: { policies: iamPolicies, roles: iamRoles, assignments: iamAssignments, attrs: iamSubjectAttrs },
  ops: { eq, and, isNull, or },
  onPolicyError: (err, ctx) => logger.error({ err, ...ctx }, 'iam row dropped'),
})

const engine = new IamEngine({ adapter })
```

`createIamDrizzleAdapter

Column types in the diagram are the Postgres ones; the [dialect differences](#the-three-dialects) table lists what MySQL and SQLite use instead. Every delete against these tables is a hard delete — `deletePolicy` and `deleteRole` so a name can be reused, `revokeRole` because a revoked grant has no reason to be retained. There is no `deleted_at` column on any table; one was added in 5.5.0 and removed again in 5.5.1 as unreachable.

`created_by` and `updated_by` are written from the `actor` a caller supplies, and stay absent otherwise. They are two disjoint records: `created_by` answers "who first put this here" and is spread into the insert half of an upsert only; `updated_by` answers "who touched it last" and is spread into the update half. Getting that backwards silently rewrites who authored a policy every time somebody edits it. Both are spread rather than written as `null`, so a table predating the columns is untouched unless the caller actually names an actor.

### Constraints and indexes

Named throughout with the prefixes `pk_`, `fk_`, `uq_`, `idx_`, `ch_`.

| Constraint | Table | What it enforces |
| --- | --- | --- |
| `uq_iam_assignments_subject_role_scope` | `iam_assignments` | One row per `(subject_id, role_id, scope)`, with NULL scopes collapsed. This is what makes `assignRole` idempotent, and it is load-bearing: the insert-or-skip depends on the database catching the duplicate, not on a read that raced. |
| `idx_iam_assignments_subject_scope` | `iam_assignments` | The scoped-subject lookup. Partial (`WHERE scope IS NOT NULL`) on pg and sqlite, unfiltered on MySQL. |
| `idx_iam_assignments_expires_at` | `iam_assignments` | Partial on pg and sqlite, unfiltered on MySQL. |
| `ch_iam_policies_algorithm_valid` | `iam_policies` | SQLite only — it has no enum type, so the closed set is a CHECK there and the column type on the other two. |
| `fk_iam_assignments_role` | `iam_assignments` | `role_id` references `iam_roles.id` with `ON DELETE CASCADE`: deleting a role removes its assignments. |
| `idx_iam_assignments_subject` | `iam_assignments` | Every subject read is `WHERE subject_id = ?`; this index is the hot path. |
| `idx_iam_assignments_role` | `iam_assignments` | Serves the FK cascade and reverse "who has this role" lookups. |
| `ch_iam_*_not_blank` | all | `name`, `subject_id`, and non-NULL `scope` must contain a non-whitespace character. |
| `ch_iam_policies_version_positive` | `iam_policies` | `version >= 1`. |
| `ch_iam_assignments_starts_before_expires` | `iam_assignments` | A bounded grant must start before it expires. |

Neither `iam_policies.name` nor `iam_roles`' `(name, scope)` is unique. Nothing in the engine resolves a policy or a role by name — `id` is the key everywhere — so uniqueness bought a label nobody reads at the cost of making Postgres the one backend where a second policy with a duplicate name is impossible. Two adapters disagreeing about whether a write succeeds is the failure this schema must not have.

Postgres adds GIN indexes on `rules` and `permissions` for containment search (`rules @> '[{"actions":["read"]}]'`), a partial index on `iam_roles.scope`, and partial indexes on `(subject_id, scope)` and `expires_at` restricted to non-NULL rows. Those are for your own queries — the adapter never uses them directly, because it filters scope and the temporal window in JavaScript after selecting a subject's rows.

## The three dialects

All three define the same four tables with the same names and the same column names. What differs is types, index expressions, and how much of a CHECK constraint the database actually enforces.

| | Postgres | MySQL | SQLite |
| --- | --- | --- | --- |
| Import | `@gentleduck/iam/adapters/drizzle/pg` | `…/drizzle/mysql` | `…/drizzle/sqlite` |
| `json` mode | `'native'` | `'native'` | **`'string'` required** |
| Payload columns | `jsonb` | `json` | `text` |
| Id / name columns | `text` | `varchar(191)` | `text` |
| `description` | `text` | `varchar(1024)` | `text` |
| Timestamps | `timestamptz`, `defaultNow()` | `datetime(3)` defaulting to `CURRENT_TIMESTAMP(3)` | `integer` epoch-ms, defaulting to `unixepoch() * 1000` |
| `algorithm` | `pgEnum` named `iam_combine_algorithm`, exported as `combineAlgorithm` | `mysqlEnum` | `text` plus `ch_iam_policies_algorithm_valid` CHECK |
| Unique with NULL scope | `.nullsNotDistinct()` on the real constraint | functional unique index on `coalesce(scope, '')` | expression unique index on `coalesce(scope, '')` |
| `inherits` default | `'[]'::jsonb` | a drizzle `sql` expression default — the only form MySQL accepts for a JSON column, 8.0.13+ | `'[]'` TEXT |
| Partial indexes | yes (`WHERE scope IS NOT NULL`, `WHERE expires_at IS NOT NULL`) | no — plain indexes on `scope` and `expires_at` | yes |
| GIN containment indexes | yes, on `rules` and `permissions` | no | no |
| CHECK constraints | enforced | enforced on MySQL 8.0.16+, parsed and ignored below | enforced |
| Extra export | `combineAlgorithm` | none | `IAM_COMBINE_ALGORITHMS` |

Every payload column in the SQLite schema is TEXT and typed `$type

So on MySQL the adapter checks for the row by `id` first and issues a plain `UPDATE` or `INSERT`. A genuine secondary-unique collision then surfaces as a thrown duplicate-entry error from the `INSERT` — matching the fail-closed behaviour of the other two dialects instead of corrupting a neighbouring row. The cost is the extra `SELECT` and the loss of atomicity noted in the table above: two concurrent `saveRole` calls for the same new id can both see nothing and both insert. The primary key rejects the loser, loudly, which is the right failure — but it is a failure a pg or sqlite deployment does not see.

`assignRole` takes the same shape at a smaller scale: `insert().values().onConflictDoNothing()` on pg and sqlite, `insert().ignore().values()` on MySQL, because MySQL's insert-ignore is a builder-order modifier rather than a trailing call. Either way a repeated `(subject, role, scope)` is a no-op, which is the idempotency the compliance suite requires.

## Scope

`scope` is a nullable column on both `iam_roles` and `iam_assignments`. NULL means global; any non-NULL, non-blank string is a scoped grant.

Reads do **not** filter scope in SQL. `getSubjectRoles` and `getSubjectScopedRoles` both run the same query — `SELECT * FROM iam_assignments WHERE subject_id = ?` — and split the result in JavaScript:

```ts
// getSubjectRoles: unscoped only, deduplicated, active only
[...new Set(rows.filter((r) => r.scope == null && isActive(r, now)).map((r) => r.roleId))]

// getSubjectScopedRoles: scoped only, one entry per (role, scope)
rows.filter((r) => r.scope != null && isActive(r, now)).map((r) => ({ role: r.roleId, scope: r.scope, ...attributes }))
```

Before 2.1.0 the SQL adapters collapsed scoped and unscoped assignments into one list while memory and file returned unscoped only, so the same subject decided differently depending on the backend. All five adapters now return unscoped roles from `getSubjectRoles` and scoped ones from `getSubjectScopedRoles`. If you swap in your own assignment table, keep that split — see [Custom adapter](/duck-iam/integrations/adapters/custom#subject-store).

`revokeRole` is the mirror image and does filter in SQL: with a `scope` it deletes only `(subject, role, scope)`; without one it deletes every row for `(subject, role)`, scoped and unscoped alike.

### Moving an assignment between scopes

`updateAssignmentScope(subjectId, roleId, fromScope, toScope, actor?)` (since 5.5.0) moves a grant in place, preserving the row's `id` and `created_at` instead of destroying and recreating it. It returns `false` — and the engine transparently falls back to `revokeRole` + `assignRole` — in two cases: `ops.isNull` was not configured, or nothing matched `fromScope`.

When the target scope already has its own row, the source row is deleted rather than updated, because an `UPDATE` would violate `uq_iam_assignments_subject_role_scope`. The method still returns `true`: the caller asked for "this subject holds this role at `toScope`", and afterwards they do. `actor`, when given, lands in `updated_by`.

### Temporal grants and per-grant attributes

Since 5.6.0, `assignRole` takes an optional fourth argument, `IamAdapter.IAssignOptions`:

```ts
await adapter.assignRole('alice', 'editor', 'org-1', {
  startsAt: new Date('2026-01-01T00:00:00Z'),
  expiresAt: new Date('2026-04-01T00:00:00Z'),
  attributes: { department: 'sales' },
})
```

The three values go to `starts_at`, `expires_at`, and `attributes`. Both reads then filter on the half-open window `[startsAt, expiresAt)`: the tests pin that a grant is active at the exact instant `startsAt` is reached, active one millisecond before `expiresAt`, and inactive at `expiresAt` itself. A row with both bounds NULL is always active, which is exactly how every assignment written before these columns existed behaves.

`attributes` surfaces on the scoped role as `IamRequest.IScopedRole.attributes`, readable from a policy condition as `subject.scopedRoles[].attributes` and distinct from the subject's own global attribute bag. The key is omitted entirely, rather than set to `null`, when the column is empty; an empty object is preserved as `{}` rather than treated as absent. A corrupt value — invalid JSON, a JSON `null`, a number, a boolean, an array — drops just that field, reports through `onPolicyError`, and leaves the assignment itself intact, because a bad per-grant blob should not remove a role. Drizzle is the only adapter that implements `IAssignOptions`; the other five throw and name the option rather than dropping it.

`getSubjectGrantBoundary` exists here for the same reason: it answers the earliest *future* `starts_at` or `expires_at` across a subject's grants so the engine can cap its cache entry there, instead of serving a grant that lapsed thirty seconds into a sixty-second TTL.

## Row validation

Every read runs each row through `parsePolicyRow` / `parseRoleRow` from `@gentleduck/iam/core/validate`, and every failure is reported through `onPolicyError` with `{ adapter: 'drizzle', rowId }` and the joined validator issues. What happens next is not symmetric.

A bad **role** row is dropped and the rest of the catalog is returned, because role permissions are allow-only: losing one can only cost a subject a grant. A bad **policy** row makes the read **throw** — `policy "p7" cannot be read and will not be skipped - a dropped policy may be the one that denies` — so one unreadable row fails every read of the policy table and the engine denies everything until it is repaired. That cost is the point: under `policyCombine: 'and'` even an allow-only policy votes deny when none of its rules match, so there is no subset of policies an adapter can safely drop without knowing a combine mode it cannot see. `getPolicy` on a corrupt row throws rather than returning `null`, because a corrupt row must not be able to impersonate a deleted one.

Both halves of the parse are covered: a JSON column that will not parse, and one that parses into the wrong shape. The second is the nastier — `rules: '[]'` stored as a raw string reads loosely like a policy with no rules, which under `deny-overrides` is a policy that denies nothing.

Subject attributes are the deliberate exception.

`getSubjectAttributes` throws `[@gentleduck/iam:drizzle] corrupted attributes for "<id>" (JSON parse failed)` or `… (not a JSON object)` when the stored `data` will not parse or is not a plain object. Returning `{}` would silently strip every ABAC condition and flip decisions without any operator signal. The engine routes the throw through `onError`, fails closed with a deny, and records it on `onMetrics`. Since 2.1.0.

`setSubjectAttributes` is the one path that recovers instead: it catches a corrupt read, reports it, and merges onto `{}` so an operator can always overwrite a broken row rather than being locked out of fixing it.

## Migrations

The tables are regular Drizzle tables, so `drizzle-kit generate` against your barrel produces the migration and `drizzle-kit migrate` applies it. Schema changes that have shipped, in case you are upgrading across them:

| Version | Change | What to do |
| --- | --- | --- |
| 5.6.0 | `iam_assignments` gains `starts_at`, `expires_at`, `attributes` on all three dialects | Regenerate. Existing rows get NULLs and behave exactly as before. |
| 5.5.1 | `deleted_at` removed from all four tables, along with the adapter's opt-in `deletedAt IS NULL` filtering | Regenerate. If you were on 5.5.0 the column is dropped; nothing in the library ever wrote it. |
| 5.5.0 | `iam_assignments` gains `updated_at` / `updated_by`; `ops.isNull` added | Regenerate, and pass `isNull` if you want single-write scope moves. |
| 5.2.0 | Tables and constraints prefixed with `iam_` (from `access_*`) | Rename the tables, or generate the migration and review the rename before applying. |
| 3.2.0 | Schemas hardened and typed for all three dialects | Regenerate. SQLite users must switch to `json: 'string'`. |

Because `json: 'native'` and `json: 'string'` are both accepted on read, flipping the mode does not need a data migration: old rows keep their encoding, new ones take the new one, and both parse.

Swapping in your own table definitions is supported — extra columns, a different table name, a different physical column name — as long as the keys you pass in `tables.*` expose the property names the adapter reads. Those property names, not the table names, are the real contract:

```
policies:    id name description version algorithm rules targets createdBy updatedBy createdAt updatedAt
roles:       id name description permissions inherits scope metadata createdBy updatedBy createdAt updatedAt
assignments: id subjectId roleId scope startsAt expiresAt attributes createdBy updatedBy createdAt updatedAt
attrs:       subjectId data createdBy updatedBy createdAt updatedAt
```

A consumer table that declares a secondary unique index of its own is the case the MySQL upsert branch protects; the shipped schemas have none.

## Gotchas

* **`assignRole` is idempotent, `savePolicy` is an upsert, `revokeRole` is a no-op on an unknown grant.** All three tolerate repetition, which is what `admin.import({ mode: 'merge' })` relies on.
* **The engine, not the adapter, applies `adapterTimeoutMs`.** `IReadOptions.signal` is accepted for interface compatibility and ignored — Drizzle's builders take no signal — so a slow query keeps running in the background after the engine has already timed out and failed closed. Keep these queries fast, and set statement timeouts at the database.
* **`listPolicies` and `listRoles` select the whole table.** The engine refuses result sets over `maxPolicies` / `maxRoles` (both default `10_000`). Raise the caps rather than paginating inside the adapter.
* **MySQL leaves `AssignmentRow.id` nullable** (no adapter-side default in the inferred type), so an error report for a bad assignment row falls back to the `subject_id` as its `rowId`.
* **A deleted role takes its assignments with it** through the FK cascade. Deleting a *policy* affects nothing else.
* **`assignRoleMany` and `revokeRoleMany` return `null` on MySQL,** which has no `RETURNING`. That is not "nothing was written" — the grants land, and `null` says the driver cannot name which of them were new, so the engine leaves `changed` off the outcome rather than guessing.
* **Batch guards run over the whole batch before the first write.** One bad row refuses the batch entirely; a partially-applied revocation is the worse of the two outcomes.
* **A MySQL identifier over 191 characters is a write error** and fine on the other two. On MySQL below 8.0.16 every `ch_*` CHECK is parsed and ignored, so a blank `subject_id` — the one of the three with no adapter-side guard — is stored.

## See also

* [Adapters overview](/duck-iam/integrations/adapters) for how the four stores fit together
* [Prisma adapter](/duck-iam/integrations/adapters/prisma) for the same tables behind Prisma Client
* [Custom adapter](/duck-iam/integrations/adapters/custom) for the full interface contract and the compliance suite
* [Scoped roles](/duck-iam/core/roles/scoped) for what a scope means at evaluation time
* [Validation](/duck-iam/advanced/validation) for the `parsePolicyRow` / `parseRoleRow` result shape