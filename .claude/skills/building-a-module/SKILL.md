---
name: building-a-module
description: Use when building a new module in apps/marketplace-api from its business-architecture plan, or when checking one just built against what this repo actually requires - which document answers which question, the order the work has to happen in (plan, schema, migration, model, DTOs, service, controller, IAM, seed, tests, README, SDK), and the traps that have already cost a rebuild here. Part 4 (IAM) is the part people forget. Every rule in it came from something that went wrong on this codebase, and it says so where that is true.
---

# How to build a module

Written for the person doing the work. Follow it in order. It takes longer than writing the
code straight away and it is faster than writing it twice.

Nothing in here is theory. Every rule came from something that went wrong on this codebase,
and where that is true the file says so.

---

## Where everything is

Read this section once and come back to it. Half of doing this well is knowing which document
answers which question.

### Our documents, in the order you will need them

| Document | Answers |
|---|---|
| [business-architecture.md](../../../docs/business-architecture/business-architecture.md) | What the business is, who the audiences are, how a request finds its market, how an order flows |
| [build-breakdown.md](../../../docs/business-architecture/build-breakdown.md) | What each of the nine applications is made of, and what is shared between them |
| [apps/](../../../docs/business-architecture/apps/) | Every module of every application, one file per application |
| [modules/01-commerce-api/](../../../docs/business-architecture/modules/01-commerce-api/) | Per-module plans, and records for what has shipped |
| [modules/01-commerce-api/patterns.md](../../../docs/business-architecture/modules/01-commerce-api/patterns.md) | The internal shape every module follows |
| [modules/01-commerce-api/done/](../../../docs/business-architecture/modules/01-commerce-api/done/) | What we decided, and what the plan got wrong, for each shipped module |
| `apps/marketplace-api/src/modules/<name>/README.md` | The living state of a shipped module |
| `apps/marketplace-api/test-map.json` | Which tests exist, and the parity record |

`docs/mine/` is cited a few times in the records below - `full-schema.sql`,
`duck-iam-reference.md`, `delivery-estimate.md`. It is **gitignored**, so it is a local working
folder rather than part of the repository. If you cloned this and it is not there, that is why,
and nothing in these documents depends on it.

### The decisions that constrain every module

These are settled and you should not relitigate them in a module plan. If your module seems
to need an exception, that is a conversation, not a decision you take alone.

| Rule | Where it is written |
|---|---|
| A product belongs to the catalogue, a seller owns an offer against it | [business-architecture.md](../../../docs/business-architecture/business-architecture.md) Part 1 |
| The hostname selects the marketplace, the path selects the language | Part 3 |
| The market is resolved server side, never from anything the browser sends | Part 4 |
| One admin application, separation comes from the grant | Part 5 |
| Every application and data store is isolated by clear ownership | Part 8 |
| No service writes another service's database or runs its migrations | Part 8 |
| Data boundaries hold from the first commit, process boundaries are deferred | Part 8 |
| An unknown hostname is a 404, never a default market | Part 3 |
| Currency belongs to the market, never to the language | Part 3 |

### What your module owes the business

Check each of these against your module before you start. Most modules owe several.

- **A marketplace dimension.** Every business record eventually carries the market it belongs
  to. Marketplaces arrive with module 08. If you are building after that and your table has no
  marketplace column, be able to say why it is genuinely global.
- **A legal entity, on anything financial.** Stamped at write time and never changed
  afterwards, because a financial record has to mean the same thing in five years.
- **An actor on writes.** Who created, updated or deleted this. `created_by` and `updated_by`
  on every domain table, which is fifteen of the seventeen in `schema.ts`. The sixteenth,
  `iam_subject_attrs_history`, is append-only and carries `changed_by` instead; the
  seventeenth, `auth_events`, is duck-auth's own shape and carries neither. This was a gap for
  a long time and is not one any more, so a new table without them is the odd one out.
- **Events it will emit.** Named in the README, and in
  [modules/01-commerce-api/domain-events.md](../../../docs/business-architecture/modules/01-commerce-api/domain-events.md), which
  is the one catalogue. There is a bus: `EventQueueService.emit` publishes on the single
  BullMQ queue `global-event-bus` after the write commits. `QueueEventPayloads` declares
  seven events; five of them have a producer, and four of those five also have a
  `@QueueListener`. `subject.unsuspended` is emitted and nothing listens; `user.updated` and
  `user.deleted` have neither end. An event with no consumer is still only written down.
- **Soft delete that means deleted.** Never a status in disguise.
- **A refusal rather than a cascade** when an operation would leave data in a state we do not
  want.

### External references, for the versions we actually run

Check the version before you trust an answer. These are the ones we are on.

| Thing | Version | Where to look |
|---|---|---|
| PostgreSQL | 18.4 | `postgresql.org/docs/18/` |
| Drizzle ORM | 0.45 | `orm.drizzle.team/docs` |
| drizzle-kit | 0.31 | `orm.drizzle.team/docs/kit-overview` |
| NestJS | 12 | `docs.nestjs.com` |
| typia | 14 | `typia.io/docs` |
| nestia | 13 | `nestia.io/docs` |
| Vitest | 5 | `vitest.dev/guide` |
| node-postgres | 8 | `node-postgres.com` |
| TypeScript | 7.0.2 | the release notes, because 7 is a rewrite and older answers often do not apply |

Two of those need care. **TypeScript 7 is a different implementation**, so an answer written
for 5 or 6 may be describing behaviour that no longer exists. **Postgres 18** changed the data
directory layout, so infrastructure answers from 16 or 17 can be actively wrong.

---

## Part 1. Before you write anything

### 1.1 Read our decision documents first, then read upstream

This order matters and it is the mistake we have made most often. Four separate times a plan
was written by reading Medusa's source and inferring what it was for, while the answer already
existed in a document nobody opened.

Read in this order:

1. The module's entry in [apps/01-commerce-api.md](../../../docs/business-architecture/apps/01-commerce-api.md), which says what it is
2. `business-architecture.md`, the parts that touch your module
3. Any decision document that mentions it. Search `docs/` for the module name
4. The module READMEs of anything it depends on
5. Only now, the upstream implementation

The rule to hold in your head: **read upstream to learn the shape, read our documents to
learn whether we want it.** A mechanism that is missing and a mechanism that was rejected
look identical in code. Only our documents tell them apart.

### 1.2 How to research upstream properly

Clone the checkouts and read them. Reading them is faster and more truthful than reading
documentation. They are not vendored here and the path is yours to choose; every command
below takes it as `$M`, so set that once. The Linux paths this section used to name no longer
exist, which is exactly the kind of staleness the rest of this file is about.

**Read the migrations, not the models.** The model file tells you what someone intended. The
migration tells you what the database actually enforces. We found four real defects this way,
including an index created on deleted rows and then "fixed" under the same name so the fix
does nothing.

```
packages/modules/<module>/src/migrations/*.ts     what the database really has
packages/modules/<module>/src/models/*.ts         what the code thinks it has
packages/medusa/src/api/admin/<module>/           the routes and validation
```

**Read them against each other.** Where they disagree, that disagreement is usually
interesting and sometimes it is a bug you should not copy.

**Useful greps when you land in an unfamiliar module:**

```bash
M=<your medusa checkout>

# the real shape, including every constraint the database enforces
grep -hoE 'create table[^;]*|CREATE [A-Z ]*INDEX[^;]*|add constraint[^;]*' \
  $M/packages/modules/<m>/src/migrations/*.ts

# what the model thinks it has, which is not always the same
grep -rn "model.define" -A 25 $M/packages/modules/<m>/src/models/*.ts

# the routes and their validation
ls $M/packages/medusa/src/api/admin/<m>/

# is this behind a feature flag, and what is the default
grep -rn "default_val" $M/packages/medusa/src/feature-flags/
```

**Read them against each other and write down what you find.** Four of the five defects we
declined to port came out of exactly this comparison, and each one took under ten minutes:

- an index created `WHERE deleted_at IS NOT NULL`, then "fixed" by a later migration under the
  same name, so `IF NOT EXISTS` matches and the fix silently does nothing
- a unique index on a pair where one column is already the primary key
- default references stored as plain text with no foreign key
- a join table with no uniqueness and a default flag with nothing enforcing exactly one

None of them is fatal on its own. Together they tell you what the maintenance standard is on
code you were about to depend on.

### 1.3 Searching the internet, and doing it well

You will need this for Postgres behaviour, for a library's real semantics, and for
whether a problem you are about to solve is already solved.

**Search for the mechanism, not the symptom.** "postgres partial unique index one row per
group" finds the answer. "how to make only one default" finds a forum argument from 2011.

**Prefer these sources, in this order:**

1. The official documentation for the exact version we run. Postgres 18, not "postgres"
2. The source code of the library, on GitHub, on the tag we depend on
3. The library's own issue tracker, searched for your exact error string
4. Stack Overflow, and only answers that show the version they applied to

**Verify anything you copy.** For Postgres, open psql and run it:

```sql
select btrim(E'\t');           -- returns a tab, which is why our old check was wrong
select E'\t' ~ '[^[:space:]]'; -- returns false, which is why the new one is right
```

Two minutes in psql beats an afternoon of believing a blog post. That specific example is how
we found that eight of our CHECK constraints accepted a tab.

**When you search for a library's behaviour, check the version.** We lost time to an answer
that was correct for an older major version. If the answer does not say which version, treat
it as a hypothesis and go to the source.

**Searching our own libraries.** duck-auth and duck-iam are ours and they are not on the
public internet, so the source is the only documentation:

```bash
P=~/Desktop/@duck/@duck-iam/packages

# what does this actually accept
grep -rn "export function createAuth" -A 40 $P/duck-auth/src/

# what conditions can a rule express
grep -rn "resourceAttr\|isOwner\|subjectAttr" $P/duck-iam/src/core/builder/rule.ts

# what does the engine cache, and what invalidates it
grep -rn "invalidate" $P/duck-iam/src/core/engine/engine.libs.ts
```

If you find something wrong in either, it is a change we ship rather than an issue we file.
That is the whole reason they are ours. Fourteen defects were found and fixed this way during
the first four modules.

**A search that found nothing is a report on your search, not a fact about the world.** Say
what you searched. We wrote "recorded nowhere I can find" about a value that was recorded, on
the strength of grepping two files.

### 1.4 Questions to answer before you open an editor

Write the answers down. If you cannot answer one, that is the thing to go and find out.

- What does this module own, and what does it only read?
- Which other modules does it need, and in which direction?
- What is the smallest useful version of it?
- What can go wrong that the database can prevent?
- What can go wrong that only code can prevent?
- Who is allowed to do each operation?
- What should happen when the thing being changed is referenced by something else?
- What should the caller see when it refuses?
- What does this module owe the rest of the platform, as events?

---

## Part 2. Writing the plan

Put it in `modules/<app>/NN-<name>.md`. Copy the shape from
[36-customers-and-addresses.md](../../../docs/business-architecture/modules/01-commerce-api/36-customers-and-addresses.md), which
is a plan that has not been built yet and so still reads as one. A shipped module's plan is
replaced by its outcome document when it moves into `done/`, so `done/NN-*.md` shows you the
wrong half.

### 2.1 The sections

**What it is.** Two or three sentences a non-engineer would understand.

**Why now.** What it unblocks, or what breaks if it lands later. If you cannot answer this,
the module may not be next.

**The model.** The tables, as columns and constraints. Write the constraints out. This is
where most of the thinking happens.

**Decisions.** Numbered, each with the reasoning. This is the whole point of the plan.

**Routes.** Method, path, capability.

**Steps.** The order you will actually do it in.

**Events.** What the module will emit when the outbox exists.

**What this module does not do.** The boundary, so the next person does not assume.

**Open.** What you do not know yet. Never leave this blank if it is not true.

### 2.2 Decisions are the point

A plan without decisions is a ticket with extra words. A decision is a place where two
reasonable engineers would choose differently, and you are recording which way you went and
why.

Good decisions to record:

- where a foreign key refuses the delete rather than clearing the child, and why
- where you refused rather than cascaded
- where a rule is a constraint rather than service code
- where you deliberately did not build something
- where you knowingly departed from a pattern

Write the reason, not the rule. In six months the rule will be obvious from the code and the
reason will be lost.

### 2.3 Get the plan read before you build

Someone else reads it and argues with the decisions. That conversation costs an hour and it
is the cheapest hour in the whole module.

### 2.4 A decision, written the way we want them

Taken from module 08's plan, because it shows the shape rather than describing it:

> **The foreign keys are RESTRICT, not SET NULL**
>
> You may not delete the region a live marketplace is built on. You have to point the
> marketplace somewhere else first.
>
> This is the same rule as refusing to disable a currency a live region prices in, and for the
> same reason: the alternative is a marketplace with a null region, which is a state every
> later module would have to handle and none of them should ever see.

Three things it does. It states the rule, it names the alternative that was rejected, and it
gives the reason in terms of consequence rather than principle. A reader in six months can
disagree with it on the merits, which is the point.

It is quoted here for its shape and not its content: **the decision it states was afterwards
corrected**, which is the system working. The schema audit found that `RESTRICT` was neither
what we wanted nor what got built, and the four keys omit `onDelete` instead. See 3.2 below
and [done/08-marketplace-registry.md](../../../docs/business-architecture/modules/01-commerce-api/done/08-marketplace-registry.md).
The plan itself no longer exists; it was replaced by that outcome document when the module
shipped, which is why a plan worth quoting is worth quoting in full at the time.

Compare with what not to write:

> Foreign keys use RESTRICT for data integrity.

That is the rule with the thinking removed. Nobody can argue with it and nobody learns
anything from it.

---

## Part 3. The database

### 3.1 Write the schema in `packages/db/src/schema.ts`

Every column earns its place. If you cannot say what reads it, do not add it.

**Types, from what we have learned:**

- ids are uuid, generated by the database
- money in minor units as `bigint`, or `numeric(19,6)` for unit prices, and always with a
  currency code beside it
- timestamps are `timestamptz`, never `timestamp`
- text is `text`, not `varchar(n)`, unless the length is a real business rule
- enums as `text` plus a CHECK, not a Postgres enum type, because adding a value to an enum
  type is a migration and a CHECK is easier to reason about
- `metadata` as `jsonb` only where it is genuinely open-ended

### 3.2 Constraints, and how to decide what belongs in the database

**The test: could this rule be broken by something that is not our service?** A seed script, a
migration, a manual fix in psql at two in the morning. If yes, it belongs in the database.

Write these every time:

```sql
-- not blank, and this exact form
CHECK (name ~ '[^[:space:]]')

-- never this, it accepts a tab or a newline
CHECK (length(btrim(name)) > 0)

-- a shape you depend on
CHECK (code ~ '^[a-z]{3}$')

-- a contradiction the row must not be able to hold
CHECK (NOT (is_enabled AND deleted_at IS NOT NULL))

-- a range
CHECK (decimal_digits BETWEEN 0 AND 4)
```

The `btrim` line is not hypothetical. Eight of our checks used it and all eight accepted a
name of one tab, because `btrim` strips spaces only.

**Foreign keys.** Decide the delete behaviour deliberately and write it in the plan:

- **omit `onDelete` when the reference means the parent is in use. This is the default here.**
  Omitting is `NO ACTION`, which fails the delete. No built foreign key uses `RESTRICT`, and
  a new one should not be the first: the two behave the same at our default deferral, and one
  spelling across the schema is worth more than the distinction
- `SET NULL` when the child can outlive the parent, and something must then clear it
- `CASCADE` only for a genuine composition, where the child has no meaning alone

`schema.ts` declares twenty foreign keys: thirteen `NO ACTION`, six `CASCADE` and one
`SET NULL`. The two the extend SQL adds, on `iam_assignments.scope_marketplace_id` and
`scope_organisation_id`, are `NO ACTION` too. The single `SET NULL` is
`fk_auth_events_identity`, and it is the shape's real case: an audit line has to outlive the
identity it names. The table of which shape suits which case, with the examples, is in
[patterns.md](../../../docs/business-architecture/modules/01-commerce-api/patterns.md).

Remember that a soft delete is an `UPDATE`, so **the database never fires the foreign key**.
If deleting should release something, the service does it and a test proves it. We shipped a
bug here: soft-deleting a region left countries pointing at a row no read returned.

### 3.3 Indexes

Add an index when you know a query needs it, not on principle. Each one costs write time and
storage.

**Add one for:**

- every foreign key you filter or join on
- the column a list endpoint sorts by
- any column a unique rule depends on
- the soft-delete predicate, as a partial index

**Partial indexes are the pattern here:**

```sql
CREATE UNIQUE INDEX uq_invites_company_email ON invites (email)
  WHERE deleted_at IS NULL AND accepted_at IS NULL AND marketplace_id IS NULL;
CREATE INDEX idx_organisation_members_org ON organisation_members (organisation_id)
  WHERE deleted_at IS NULL;
```

The predicate is the half that makes it partial; the indexed column still has to be one a
query orders or filters by. `(deleted_at) WHERE deleted_at IS NULL` indexes a column that is
null in every row it covers, which is why all five of those were dropped: `idx_organisations_live`
in `0005`, and `legal_entities`, `marketplaces`, `regions` and `sales_channels` in `0006`.

`WHERE deleted_at IS NULL` is the state anything queries. Upstream has an index on
`IS NOT NULL`, which indexes only deleted rows and is used by nothing.

**Partial unique indexes are how you say "exactly one":**

```sql
-- one default locale per marketplace, and the database enforces it
CREATE UNIQUE INDEX ON marketplace_locales (marketplace_id) WHERE is_default AND deleted_at IS NULL;
```

A boolean with nothing enforcing it will eventually have two rows set. Upstream shipped
exactly that and removed the column ten days later.

**Check that your index is actually used.** Do not assume:

```sql
EXPLAIN ANALYZE SELECT * FROM regions WHERE deleted_at IS NULL ORDER BY name LIMIT 20;
```

Look for an index scan rather than a sequential scan. On a table with twelve rows Postgres
will choose a sequential scan whatever you do, so test against a realistic row count if the
index matters.

### 3.4 Migrations

```bash
bun run db:generate     # drizzle-kit writes the migration from the schema
# read the generated SQL, all of it
bun run db:migrate      # apply
```

**Read the generated SQL before applying it.** It is code and it goes through review like
code.

**Never apply a migration by hand with `psql -f`.** It desyncs drizzle's journal and the next
migration fails. We have done this twice and repaired it twice.

**If a migration fails because existing rows violate the new constraint, that is the
constraint working.** Fix the rows. Do not weaken the constraint to make the error go away.

### 3.5 Checking your work in psql

Before you say the schema is done:

```sql
\d+ your_table                        -- columns, indexes, constraints, in one place

-- do the constraints actually refuse?
INSERT INTO your_table (name) VALUES ('');        -- expect a violation
INSERT INTO your_table (name) VALUES (E'\t');     -- expect a violation
INSERT INTO your_table (name) VALUES ('  x  ');   -- expect success

-- is the unique rule real?
INSERT INTO your_table (code) VALUES ('abc');
INSERT INTO your_table (code) VALUES ('abc');     -- expect a violation

-- does soft delete free the unique code?
UPDATE your_table SET deleted_at = now() WHERE code = 'abc';
INSERT INTO your_table (code) VALUES ('abc');     -- expect success, if that is what you want
```

That last one is a real decision. Decide it, do not discover it.

---

### 3.6 Seed your rows into the world that already exists

Every module adds to the seed. A module whose table is empty in a fresh checkout is a module
nobody can look at, and it is the reason a screen gets built against a guess about what the
data looks like.

**There are two seeds and they are not the same thing.**

`seedCountries`, `seedCurrencies` and `seedLocales` run on every boot. That is reference data
the application needs to work at all: 250 ISO countries, 126 currencies, 12 locales, nine of
them active. All three are insert-only with `onConflictDoNothing`, because which currencies a
deployment trades and which countries belong to which region are operator state, and an upsert
on every boot would switch every disabled currency back on and detach all 250 countries from
their regions.

`seedDev` in `packages/db/src/seed/dev.ts` is the cast: accounts, regions, channels, legal
entities, markets. It refuses to run with `NODE_ENV=production`, and it is where your module's
fixtures go unless your rows are genuinely reference data the app cannot boot without.

**Reference your own ids through `devId`, never a fresh uuid.**

```ts
const devId = (kind: string, key: string): string => v5(`${kind}:${key}`, DEV_SEED_NAMESPACE)
```

Same key, same id, every run, so a re-run collides on the primary key and stops rather than
inserting a second copy under a new one. It is also what lets your rows point at rows another
step wrote:

```ts
// a market resolves the region and legal entity fixtures by their key
regionId: devId('region', market.regionKey),
legalEntityId: devId('legal-entity', market.legalEntityKey),
```

**This is the part that matters: seed into the existing data, not beside it.** A new module
that invents its own disconnected rows gives you a database that is technically populated and
tells you nothing. A market pointing at the Europe region, the web channel and the Italian
legal entity that were already there gives you a database that behaves like the real one, and
a screen built against it is built against the truth.

So: put the data in `dev.data.ts` as a typed array keyed by a stable string, resolve foreign
keys through `devId` in `dev.ts`, add a counter to `DevSeedCounts`, and insert after the steps
you depend on.

**Seed at least one row that its own rules would refuse.** A list that never contains a
disabled row never proves the filter works, and a fixture set where everything is healthy is
a fixture set that has never exercised a refusal. The channels seed carries one disabled
channel for exactly this reason, the legal entities carry one inactive, and Spain is seeded as
a draft market pointing at the inactive Spanish entity, so it fails its own readiness check.

**Fixtures are not real data and must not be mistakable for it.** Seeded addresses use
`iryss.test`, which RFC 2606 reserves so it can never resolve. Seeded VAT numbers are
all zeroes. If your module holds anything that looks like a real identifier, make the fake
obviously fake.

---

### 3.7 Two test traps that make a suite pass while proving nothing

**A forbidden header is dropped, not sent.** Under vitest, `fetch` refuses to set `Host`,
`Origin` and the other forbidden headers, and it does it silently. A test that sends a foreign
`Host` therefore arrives as `127.0.0.1`, takes whatever local exemption exists, and returns
200 while asserting nothing. Use raw `node:http` for those. Found in module 09, where it made
the single most important test in the module decorative.

**A mock echoes what you staged.** `mockOrm()` returns the rows you queued with `$returns`,
so asserting on the shape of a returned row proves nothing about the projection or the where.
Assert on what ran instead, the way every model test does:

```ts
expect(orm.$calls[0].columns).toEqual([...])
expect(orm.$calls[0].sql).toMatch(/"sales_channels"\."is_enabled" = \$\d+/)
```

---

## Part 4. IAM, which is the part people forget

Skipping this is how a route ships with no authorisation. The coverage test will catch it,
and it is better not to need catching.

### 4.1 Add the resource

In `packages/db/src/iam/app.access.ts`, add your module to the `resources` list. It is one
line and everything else depends on it.

The actions already exist: `read`, `create`, `update`, `delete`, `restore`, `enable`,
`disable`, `impersonate`, `manageRoles`. Do not add a new action unless the module genuinely
has an authority the list cannot express.

### 4.2 Put a capability on every route

```ts
@TypedRoute.Get()
@AuthorizeCompany({ action: 'read', resource: 'salesChannels' })
async list(...)
```

**Pick the action honestly.** `enable` and `disable` are their own actions rather than
`update`, because taking something out of service and correcting its name are different
authorities. If your module has an operation like that, give it its own action.

**The decorator also names where the scope comes from, and that is the half people miss.**
`@AuthorizeCompany` says the scope is resolved from the actor's own grants; `@AuthorizeMarketplace`
says it is resolved from the market the host resolved to. Neither writes a scope *value* - a
value written at the route is a constant, and that constant is what used to force an operator
confined to one market to hold a company grant just to reach the dashboard.

Pick the one matching the audience the controller is mounted under. A route under `/admin`
declaring `host`, or one under `/marketplace` declaring `company`, authorizes at a scope its
own door never delivers a caller for, so boot refuses it by name with
`IAM_ROUTE_SCOPE_SOURCE_MISMATCH`. A guarded route naming neither is refused the same way with
`IAM_ROUTE_SCOPE_SOURCE_UNDECLARED`. Both throw while the module graph is built, listing every
offender rather than the first, so a batch of them is one fix rather than one deploy each.

### 4.3 Grant it to a role, or the route is dead

A capability nobody holds is a route nobody can call. It type-checks, its tests pass against a
caller that was refused for the ordinary reason, and it is dead. Three `authIdentities` routes
shipped exactly like that.

In `packages/db/src/iam/company/roles.ts`, grant the actions your routes declare. Grant them
one at a time rather than reaching for `grantCRUD` when the module has no full CRUD:
`legalEntities` has no delete route, so a delete grant would read as a capability and not be
one.

### 4.4 The capability batch derives itself, so there is nothing to add

`GET /auth/permissions` is the batch a client gates its screens on, and it is built at boot by
`AppChecksRegistry` in `src/common/iam/app/app.checks.ts`. It walks the controllers and reads
the same route metadata `DuckIamAppGuard` enforces on, so the batch and the gate cannot
disagree. Declare the route properly in 4.2 and your capability is in the batch. There is
nothing to add and nothing to keep in step.

> Corrected 2026-09-09. This section used to say `APP_CHECKS` was a hand-written list in
> `app.access.ts` and told you to add every capability to it. The 62 tuples were deleted on
> 2026-09-07, and the derived set was confirmed identical to them before they went: 62 pairs
> from 95 decorator sites, no drift in either direction.

**Why it is derived rather than written.** A key absent from the batch reads as `false`, which
a client cannot tell apart from a denial, so a screen gated on a capability nobody probes
disappears for everyone, superadmin included, with no error anywhere. The hand list drifted
both ways and both were found late:

- probes with no route behind them. `update` on `iamRoles` and `iamPolicies` were probed and
  nothing writes either, so every role saw two rows it could never turn on
- a probe in the wrong scope. `manageRoles:users` is held by a partner owner and was asked
  under `company`, where it can never be true

The second is why the scope is asked from the source rather than pinned: company routes are
asked at `company`, market routes at the market the host resolved, and left out of the batch
entirely where none did. Evaluation stays on the server, as it must - a client cannot
reproduce a policy denial, so one computing capabilities from a role list would disagree with
what the API enforces, in both directions.

### 4.5 Sweep the policies for what your module just made reachable

This is the step people skip, because it is the only one that is not about your own module.

Your module adds rows, routes and grants that the existing policies were written without.
Ask, and write the answer in the module README even when it is "nothing":

- **Does any policy target a resource list that should now include yours?** A policy naming
  `users, invites` and meaning "everything an operator writes" is now wrong by omission, and
  the failure is silent: the rule simply does not fire on your rows.
- **Does your module need a rule that does not exist yet?** Ownership, an attribute gate, a
  suspension block. If the answer is a policy, it belongs in `packages/db/src/iam` with the
  others, not as an `if` in your service.
- **Did you add an action?** Every deny policy written against the old action set now has a
  hole in it, because `WRITE_ACTIONS` is derived but a policy's own `on(...)` list is not.
- **Is anything you built reachable by a role that should not have it?** Run the module's
  hostile e2e with every role, not just the one you had in mind.

Do this against the modules built so far, not against the finished platform. The point is
that the policy set is correct at each stop, rather than correct only once everything exists.

### 4.6 Decide whether there is a public surface

Most modules have none, and a new one is harder to justify than it was. The storefront left the
engine: an unauthenticated caller still resolves to `ANONYMOUS_SUBJECT`, but that subject now
holds no grant, so every check for it refuses. A public surface therefore cannot be a role
handed to the public; it is a route deliberately answered without authorization, and that is a
decision to argue for in the module README rather than a tier to reach for.

The client DTO is a strict subset of the admin one, and there is a test that says so.

### 4.7 Conditions, when the rule depends on the row

A grant can carry a condition. We use these today, twenty-two of them, spread over nine of the
thirteen policies:

```ts
.rule('deny-self-account-delete', (r) =>
  r.deny().on('delete').of('users', 'authIdentities')
    .when((w) => w.isOwner('resource.attributes.subjectId')),
)
```

What we use: `isOwner` and `exists` carry most of it, with `attr` for a request fact like
`mfaVerified` and `roles` for a rank comparison; `not` and `or` are the two combinators in the
policies today. The builder also offers `resourceAttr`, `env`, `scope`, `scopes`, `role`,
`resourceType`, `check`, `contains`, `in`, `matches` and the comparisons `eq`, `neq`, `lt`,
`lte`, `gt`, `gte`. Reach past the first four only when the rule genuinely needs it.

**Two traps we hit:**

A policy with a matched target and no allowing rule denies everything it names. If you add a
deny rule, you usually need an unconditional passthrough alongside it.

A condition over an attribute that is null does not evaluate true. A collection `POST` names
no subject, so `not(isOwner)` refused every create. Use `deny-overrides` and let the deny win,
rather than trying to express the inverse.

### 4.8 Run the coverage tests

`permission-coverage.e2e.test.ts` reads the route table out of the source and fails when a
route has no grant, when a probe no role can hold slips in, and when the live batch and the
routes disagree in either direction. It asks a running server for that last one rather than
re-deriving the list, because a derivation compared against itself proves nothing.
`policy-reachability.test.ts` then asks the question coverage cannot: whether a policy refuses
what a grant allows, which is how a capability dies while every other test stays green.

Run both before you open the pull request. Together they are why we can say no route bypasses
authorisation and no capability is quietly unreachable.

---

## Part 5. The code

The full shape is in [modules/01-commerce-api/patterns.md](../../../docs/business-architecture/modules/01-commerce-api/patterns.md).
This is what you need while writing.

### 5.1 The three layers

**`<name>.lib.ts`.** Anything more than one surface needs, as a plain function taking its
dependencies as an argument. See `patterns.md`. This file exists because `users` had two
delete paths that had drifted, and the admin one left removed people with working cookies.

**Model.** `<name>.model.ts`, one per table, registered in `models` in
`src/infrastructure/database/orm/orm.ts`. It says what the table cannot: the default columns,
the named sets, what `q` searches, the tenant rule and the filters. Soft delete, stamps, keys
and error codes come from the table. See `src/common/orm/README.md`.

**Service.** Every rule lives here. Reads and writes through `Orm`, applies rules, throws the
module's error codes. Knows nothing about HTTP, and asks no authorization question a route can.

**Controller.** Routes, request and response types, and the checks the guard runs before the
handler. If there is an `if` in a controller, it belongs in the service.

### 5.2 Reaching another module

**For its rows, through `Orm`.** Every model is on the client, so `regions` detaches its
countries through `this._db.countries`, with that table's columns, soft delete and tenant rule,
and imports nothing. Never with a hand-written query against its table: `invites` matched emails
against `auth_identities` by hand, drifted from the constraint it meant to match, and mixed-case
sign-in failed.

**For its rules, through its service.** Where the other module could later change what an
operation means, import its module and inject the service it exports, so the rule changes in
one place.

### 5.3 Field selection

On the model, not at the call site:

```ts
export const salesChannelsModel = model({
  table: salesChannels,
  select: ['id', 'name', 'description', 'isEnabled', 'metadata'],
  sets: { admin: ['deletedAt', 'createdBy', 'updatedBy'] },
})

this._db.salesChannels.select({ with: 'admin' }).page(query)
```

`select` is what every read returns by default. A set adds to it, and a set named `$...` is a
whole selection instead. `only` names columns for one call. A caller cannot ask for a column
you did not intend to expose, and the result is typed from the selection, so removing a column
is a compile error at every call site rather than a runtime surprise.

### 5.4 Error codes

One constant per module, code to HTTP status, prefixed with the module name. The model's own
codes are spread in first, and `errors()` turns the map into the service decorator and the
refusal:

```ts
export const CurrenciesErrors = {
  ...codes(currencies),
  CURRENCIES_LIST_SUCCEEDED: 200,
  // Refused rather than cascaded: a region priced in an untradeable currency is a
  // question every later module would have to answer, so the state is not reachable.
  CURRENCIES_IN_USE_BY_MARKETPLACE: 409,
  CURRENCIES_LIST_FAILED: 500,
} as const satisfies Record<string, number>

export const { Throws, fail } = errors(CurrenciesErrors)
```

`@Throws('CURRENCIES_LIST_FAILED')` on a service method answers what it throws, and a refusal is
`throw fail('CURRENCIES_IN_USE_BY_MARKETPLACE')`. No `try` in a service.

Success codes belong in the same table, because a route that succeeds is as much a contract as
one that fails. Where a code exists because of a decision, put the decision in a comment above
it. Those two lines sit exactly where somebody will be when they need them.

### 5.5 Two things that will waste your afternoon

**Imports carry no file extension.** Write `from './health.service'`. The exception is
`await import('./x.js')`, and the fix is usually a static import instead.

**Do not reach for `compilerOptions.plugins`.** The transforms are discovered from the
dependency graph, because each package declares its own under a `ttsc` key. A *different*
specifier for a transform already declared there fails the build with a message about native
backends sharing an emit pass.

There is one entry in the repo, in `apps/marketplace-api/tsconfig.json`, and it works because
discovery **skips** a dependency whose declared string is already listed: repeating
`@nestia/core`'s specifier byte for byte replaces discovery rather than adding to it, which is
how the app passes `validate: "validateEquals"`. Copy the string from the package if you ever
need this, never from a tutorial.

### 5.6 Caching, which most modules should not do

Default to no cache. Read this section when you think you need one, and expect to be talked
out of it.

**One Valkey carries everything.** BullMQ queues, sessions, idempotency, rate limits,
maintenance locks and the caches, on a single `custom-pico` node with eviction policy
`noeviction`. That policy does not evict under pressure, it **fails writes**. So a cache that
grows without bound does not slow the site down, it stops sign-in, stops jobs being queued and
stops idempotency protecting payments. Memory here is shared with the things that must not
fail.

**Three rules, and they are not negotiable.**

**Every key has a TTL.** No exceptions, no "it is small". The TTL is what stops a bug becoming
an outage.

**Every dimension that changes the response is in the key.** Market, locale, and anything else
that varies. `Platform Architecture` calls this the Context-Aware Cache-Key Builder and asks
for "trusted market, language, user class and permission-sensitive dimensions". A missing
dimension is not a stale read, it is one caller receiving another caller's data.

```
iryss:<tier>:<resource>:<version>:<dimensions>
```

`version` is bumped when the response shape changes, so a deploy cannot serve yesterday's
shape from cache.

**Cache after authorisation, never before.** The service asks the engine, then reads through
the cache. A cache consulted before the check is an authorisation bypass with a TTL on it.

**What is worth caching**

| Kind | Varies by | Cache? |
|---|---|---|
| Reference data: countries, currencies, locales | nobody | yes, an hour |
| Market spine: markets, hosts, storefront config | market | yes, a minute, keyed by market |
| Operational: orders, products, applications | caller and market | no |
| Permission decisions | subject | already cached in the engine, leave it |

**A read whose job is to notice other modules' changes must not be cached at all**, whatever
its key. `GET /admin/marketplaces/:id/readiness` exists to see a market stop being viable when
every foreign key still says it is fine: a currency delisted, a host retired. A cache was built
for it and removed the same day, because a thirty second TTL made a health check report healthy
for a market that had already broken. A cache on a health check makes the health check lie.

If your read varies by **who is asking**, do not cache it. That rules out most admin routes,
which are also low traffic, so there is little to win and a leak to lose.

**Invalidate in the service that wrote**, by key, and never let that failure fail the write. A
missed invalidation costs a stale read until the TTL; a refused write costs an operator their
work. The same applies to reads: a cache that is down returns a miss and the request
continues.

`StorefrontConfigurationCache` is the worked example. It is per market, sixty seconds,
invalidated by the configuration write and by every locale write because the payload carries
both, and its read swallows and logs rather than throwing.

**`HostsResolver` is the second shape, and it is the exception to the TTL rule.** The hostname
lookup runs on every single request, so it is not a Valkey key at all: it is one in-process
`Map<hostname, Resolved>` per replica, rebuilt whole rather than per key. That has no TTL and
needs none, because nothing expires it - a host write calls `invalidate()`, which drops the map
locally and publishes on `marketplace:hosts:invalidate` through `CacheBusService` so the other
replicas drop theirs too. A generation counter makes a rebuild already in flight over the
pre-write rows discard its result instead of installing it.

Reach for that shape when the read is on the request path, the set is small enough to hold
whole, and every writer is ours. Reach for the Valkey shape otherwise. What the two share is
the part that matters: the write invalidates, rather than the reader hoping a TTL is short
enough.

**In the module README**, record what you cache, the key, the TTL and what invalidates it. A
cache nobody can find is a cache nobody can debug.

---

## Part 6. The tests

This is the list. Work through it. Not every line applies to every module, and you should be
able to say why when one does not.

Write the test that proves the refusal **before** you write the refusal. We shipped a test
that asserted a currency could not be disabled without ever creating the region the refusal
depended on. It passed for months for the wrong reason.

### 6.1 Model and integration tests, the model against the mock and the service against a real database

Reads:

- [ ] returns the declared fields, and only those
- [ ] asking for a subset of fields returns exactly that subset
- [ ] asking for a field that is not exposed does not return it
- [ ] soft-deleted rows are excluded by default
- [ ] soft-deleted rows are included when explicitly requested, if that is supported
- [ ] ordering is applied as asked, ascending and descending
- [ ] limit and offset work, including page two
- [ ] an empty result is an empty list, not an error
- [ ] the query that gets built is asserted, not only the rows that come back, wherever
      ordering, paging or field selection matter. A dropped page size returns plausible rows

Writes:

- [ ] create returns the created row
- [ ] update changes only the fields asked for
- [ ] update of an id that does not exist
- [ ] soft delete sets `deleted_at`
- [ ] soft delete of something already deleted
- [ ] soft delete releases whatever it should release, checked directly in the database

Constraints, one test each:

- [ ] every CHECK refuses its bad input, including the tab and newline cases
- [ ] every unique index refuses a duplicate
- [ ] the unique rule after a soft delete behaves as you decided
- [ ] every foreign key refuses a missing parent
- [ ] every `NOT NULL` refuses null
- [ ] a foreign key that omits `onDelete` refuses to delete a referenced parent

### 6.2 Service tests, with a mocked `Orm`

- [ ] every rule allows the valid case
- [ ] every rule refuses the invalid case, asserted on the error **code**, not the message
- [ ] the not-found path
- [ ] the conflict path
- [ ] where a rule depends on another module, the lookup is asserted as having happened
- [ ] where the order of checks matters, the order is asserted
- [ ] a refusal does not partially write. Nothing is left behind

### 6.3 End to end, against a built server

- [ ] the happy path for every route
- [ ] the response body has exactly the declared keys, compared as a sorted key list rather
      than by checking a few absences
- [ ] the client payload is a strict subset of the admin one
- [ ] pagination works through the real route
- [ ] a soft-deleted thing disappears from list and from get
- [ ] every route refuses an anonymous caller, unless it is deliberately public
- [ ] the permission matrix: each role against each route, both the allow and the refuse

### 6.4 Hostile tests, which are not optional

The ordinary suite proves the module works when used correctly. This one proves it holds when
it is not. It is what found the `btrim` bug, in a module that had nothing to do with it.

Text input, for every text field:

- [ ] empty string
- [ ] a single space
- [ ] a single tab
- [ ] a single newline
- [ ] leading and trailing whitespace around a valid value
- [ ] very long, past any column limit
- [ ] unicode, emoji, right-to-left characters
- [ ] a string containing a quote and a semicolon
- [ ] a string that looks like SQL
- [ ] a string that looks like a template expression

Numbers and types:

- [ ] negative where positive is expected
- [ ] zero where non-zero is expected
- [ ] a float where an integer is expected
- [ ] a number far past any sane bound
- [ ] a string where a number is expected
- [ ] null and undefined for every optional and required field
- [ ] an array where a scalar is expected, and the reverse

Identifiers:

- [ ] an id that does not exist
- [ ] an id that is not a valid uuid
- [ ] an id belonging to a soft-deleted row
- [ ] an id belonging to another market, which must read as a row that is not there rather
      than one that is refused. `market-reach.e2e.test.ts` is the worked example

State:

- [ ] enable something already enabled
- [ ] disable something already disabled
- [ ] delete something twice
- [ ] update something after deleting it
- [ ] delete something that is referenced
- [ ] two identical requests at the same time, and the second is refused rather than both
      succeeding

Query abuse:

- [ ] a limit far past any page size
- [ ] a negative limit or offset
- [ ] ordering by a column that is not exposed
- [ ] requesting a field that exists in the table and not in the DTO

Authorisation:

- [ ] a valid session with the wrong role
- [ ] the right role on the wrong resource
- [ ] a revoked session
- [ ] no session at all
- [ ] a caller confined to a different market, on reads **and** on writes

### 6.5 What tests do not prove

Mutation testing proves an assertion is load-bearing. It does not prove the predicate is
correct. Our currency CHECKs passed mutation testing and were still wrong, because every value
fed to them was a real symbol or an empty string, and `btrim` and the correct regex agree on
all of that.

The gap between "this rule fires" and "this rule means what I think" is closed by hostile
input, not by mutation.

### 6.6 Before you call it done

- [ ] rebuild in order: `packages/db` dist, then the SDK, then the app
- [ ] run the whole suite once, not the files you were working on
- [ ] the database is left as you found it, with no rows leaked by a test
- [ ] `test-map.json` lists your new test files with their real case names
- [ ] if the module caches, one test proves a second read does not hit the database and
      another proves a write invalidates. The second is the one that rots

Two of those four artifacts fail silently when they are stale. A test result against a stale
build is not a result.

---

## Part 7. Writing the module down

### 7.1 The module README

Every module has one. It carries:

- a one-line description a non-engineer understands
- a table: tables, routes, authorisation, test count
- **Done**, as a checklist of what actually works
- **Decisions on the record**, the reasoning that is not obvious from the code
- **Missing**, including the events the module owes

Keep the counts true. All twenty-five modules have one. Six of the fifteen that existed in
September 2026 had stale test counts and one had the wrong file count, which is how a document
quietly stops being trusted.

**The count is what the runner reports, per tier, and there is one way to get it:**

```bash
vitest run --reporter=json --outputFile=/tmp/unit.json
vitest run --config vitest.integration.config.mts --reporter=json --outputFile=/tmp/int.json
vitest run --config vitest.e2e.config.mts --reporter=json --outputFile=/tmp/e2e.json
```

Sum `assertionResults` per file in each report. Three sources disagree with that number and
none of them is the count:

- **`vitest list`** prints one line per *named* case and leaves an `it.each` name with its
  `%s` placeholders unexpanded, so it is always lower. So is grepping for `it(`.
- **`test-map.json`** is the same named-entry metric by design, and says so in its own note. It
  is the parity record against Medusa, not the test count.
- **the last run you happened to see** counts whatever tier you ran.

Mixing them is how the outcome documents drifted. Sales channels read 137 in one and 86 by
`vitest list` on the same tree, and both numbers were honestly derived.

### 7.2 The outcome document

When the module ships, write what the plan got wrong next to the plan. That is the most
valuable paragraph in the folder and it is the one everybody skips.

Record the mistakes. Every defect in this guide is here because somebody wrote it down.

---

## Part 8. Using AI without losing ownership

This matters more than it sounds. A module you did not think through is a module you cannot
debug at eleven at night, and the person who has to is you.

### 8.1 The rule

**Ask it questions. Do not ask it for the feature.**

If it writes the module, you own code you have not reasoned about. The tests will pass, the
review will be shallow because nobody has a model of it, and the first production problem
will find you with no idea where to look.

### 8.2 What it is genuinely good for

**Explaining something you are about to depend on.** "What does Postgres do with a partial
unique index when the predicate column is null?" You will remember the answer because you
asked a specific question.

**Finding things in a large codebase.** "Where does Medusa enforce that a region has a
currency?" is a search you can verify in a minute.

**Reviewing a decision you have already made.** "I am using RESTRICT here for this reason.
What breaks?" This is where it earns its place, because it argues rather than produces.

**Boring mechanical work you have already specified.** Once you have written one model
test by hand and you know exactly what the other twelve look like, that is fine to delegate.

**Checking your own reasoning.** "Here is my constraint. What input gets past it?" This is
close to what hostile testing does, and it is cheap.

### 8.3 What to keep for yourself

- the schema, including every constraint and index decision
- the authorisation model for the module
- what the module refuses and why
- the first test of each kind, so you know what the rest should look like
- the plan and the decisions in it

### 8.4 Questions that teach you the system

Ask these about your own module and you will understand it better than any generated code
would have taught you:

- What happens to this row when its parent is soft-deleted?
- Which query does this index actually serve, and does `EXPLAIN` agree?
- What can write to this table without going through my service?
- If two people did this at the same time, what happens?
- What does this look like to a caller who is allowed to read but not write?
- What did I decide here that a reasonable person would have decided differently?

### 8.5 The check

Before opening the pull request, explain the module out loud to another person, with the
document closed. Every place you hesitate is a place you did not think it through, and that is
the list to go back to.

If you cannot explain why a constraint is there, it should not be there yet.

---

## Part 9. The commands you will actually run

Verified against the actual scripts. Note which directory each one runs in.

```bash
# repository root, once
bun install
bun run setup                    # env files, containers, migrations, seed. Idempotent

# schema work, from packages/db
cd packages/db
bun run db:generate              # drizzle-kit writes the migration from the schema
bun run db:migrate               # apply it
bun run db:studio                # browse the data

# the artifacts, in this order, and the order matters
cd packages/db && bun run build            # tsdown, produces dist
cd apps/marketplace-api && bun run sdk    # nestia regenerates the typed client
cd apps/marketplace-api && bun run build  # ttsc, produces dist/main.js

# or let turbo work out the graph, from the root
bun run build

# tests, from apps/marketplace-api
bun run test                     # hermetic, no server needed
bun run test:integration         # against iryss_marketplace_test
bun run test:e2e                 # spawns the built server from dist
bun run test src/modules/<name>  # one module, while working

# from the root, everything
bun run test
bun run test:integration
bun run test:e2e
bun run check-types
bun run check                    # biome, the only linter and formatter here
```

**There are three suites, not two.** `test` collects neither `*.integration.test.ts` nor
`*.e2e.test.ts` - `tooling/vitest/index.ts` excludes both by glob - so a module whose only
database coverage is an integration file has none as far as `bun run test` is concerned.
`apps/marketplace-api` has 40 integration files and 50 e2e files today. The root runs both at
`--concurrency=1` on purpose: all 40 read one shared postgres, 37 of them open it through
`createTestDatabase` and 34 call `truncateAll` on it, so two runs at once fail each other for
reasons that have nothing to do with the code.
`bun run verify` is `ci` plus those two tiers, which is the one definition of the full gate.

**`bun run sdk` deletes before it generates.** If it fails part way through, the SDK
directories are left empty and everything downstream stops compiling. Run it again rather
than debugging the wreckage.

**`bun run build` at the root builds everything turbo can see**, which is now two
applications: `marketplace-api` and `admin-portal`. The `-old` applications this used to
exclude are gone.

**Two of those four artifacts fail silently when stale.** A stale `packages/db` dist renders
`eq(undefined, x)` as a bare ` = $1` with no type error. A stale SDK compiles a frontend
against a contract that no longer exists. Rebuild before you trust a test result.

**Do not run `check-types` while a suite is running.** It rebuilds `packages/db` as a turbo
dependency and swaps `dist` underneath the run.

### Checking the database directly

```bash
set -a; . apps/marketplace-api/.env; set +a
psql "$DATABASE_URL"
```

```sql
\d+ your_table                    -- everything about one table
\di                               -- every index

-- what constraints exist, and on what
select conname, pg_get_constraintdef(oid) from pg_constraint
where conrelid = 'your_table'::regclass;

-- is my index used
explain analyze select * from your_table where deleted_at is null order by name limit 20;

-- did a test leak rows
select count(*) from your_table;
```

---

## Part 10. The one-page version

Pin this. The rest of the file is why.

**Before you write anything**

1. Read our decision documents, then upstream. In that order
2. Read the migrations, not the models
3. Verify anything you copy, in psql or in the source
4. Answer the nine questions in 1.4 in writing

**Plan**

5. Write the plan in `modules/<app>/NN-<name>.md`
6. Decisions are the point. Rule, rejected alternative, consequence
7. Get it read before you build

**Database**

8. If a rule can be a constraint, it is a constraint
9. `~ '[^[:space:]]'`, never `btrim`
10. Partial indexes on `deleted_at IS NULL`
11. Partial unique index is how you say exactly one
12. Foreign key delete behaviour is a decision, and a soft delete never fires it
13. Generate the migration, read it, apply it. Never by hand
14. Seed your rows into `seedDev`, resolving foreign keys through `devId` so they point at
    the fixtures already there, and include at least one row your own rules would refuse

**IAM**

15. Add the resource to `app.access.ts`
16. A capability on every route, with the honest action, and the right one of
    `@AuthorizeCompany` / `@AuthorizeMarketplace`, or it does not boot
17. Grant every one of them to a role, or the route is dead
18. The capability batch derives itself from 16, so there is no list to keep in step
19. Sweep the policies: does one need to name your resource, do you need a rule that does not
    exist, and is anything reachable by a role that should not have it
20. Client DTO is a strict subset of admin
21. Run `permission-coverage` and `policy-reachability` before the pull request

**Code**

22. Model, service, controller, and nothing leaks between them
23. Read another module's rows through `Orm`, its rules through its service
24. Field selection on the model, prefixed error codes, reasons in comments

**Tests**

25. Write the refusal test before the refusal
26. Work through the list in Part 6, all four suites
27. Hostile tests are not optional on anything taking input
28. Rebuild all four artifacts, then run the whole suite once

**Write it down**

29. Module README, with true counts
30. Outcome next to the plan, including what the plan got wrong
31. Update `test-map.json`

**AI**

32. Ask it questions. Do not ask it for the feature
33. Keep the schema, the authorisation model, the refusals and the first test of each kind
34. Explain it out loud with the document closed
