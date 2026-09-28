`examples/duck-iam` in the repository is not a snippet collection - it's four standalone
backends, one per framework, pointed at the **same** Postgres database, the same seeded
company/user/product/order rows, and the same `@gentleduck/iam` config. Sign in on Express,
change a role, and Hono sees the new grant on its next request. It's the fastest way to see
whether a pattern from this site actually holds up wired into real routes, real sessions, and a
real database - not just in an isolated snippet.

## What it demonstrates

* **RBAC with inheritance** - `viewer < staff < manager < admin`, each granting more of a fixed
  action vocabulary (`read`/`create`/`update`/`delete`/`manageRoles`) over a fixed resource set
  (`companies`/`users`/`products`/`orders`).
* **An ABAC ownership condition combined with RBAC** - `deny-self-account-delete`,
  `deny-overrides`, `isOwner('resource.attributes.id')`, so a manager can delete other users but
  never their own account - the same shape used as the canonical example throughout this site.
* **Scoped, multi-tenant roles** - every assignment is scoped to a `company`, resolved the same
  way on every framework.
* **A derived client permission map** - `GET /me/permissions` calls `engine.permissions()` once
  per request; the Next.js dashboard renders `<Can>`/`<Cannot>` off the result via
  `@gentleduck/iam/client/react`.
* **Real authentication in front of it** - `@gentleduck/auth` password credentials and cookie
  sessions, CSRF-guarded mutations, not a stubbed bearer token.
* **`engine.healthCheck()`** wired into an unauthenticated `/health` route on all four
  frameworks, for a load balancer or uptime probe.

## Frameworks

| Framework | Adapter | Port |
| --- | --- | --- |
| Express | [`@gentleduck/iam/server/express`](/duck-iam/integrations/server/express) | 3100 |
| Hono | [`@gentleduck/iam/server/hono`](/duck-iam/integrations/server/hono) | 3200 |
| NestJS | [`@gentleduck/iam/server/nest`](/duck-iam/integrations/server/nest) | 3300 |
| Next.js | [`@gentleduck/iam/server/next`](/duck-iam/integrations/server/next) + [`@gentleduck/iam/client/react`](/duck-iam/integrations/client/react) | 3400 |

Express, Hono, and NestJS are API-only - exercise them with `curl`. Next.js additionally carries
the React dashboard, since it's the one framework where routes and pages already share a
project.

## Running it

```sh
cd examples/duck-iam/express   # or hono, nest, next
cp .env.example .env
bun run db:setup               # only needed once - migrates and seeds the shared database
bun run dev
```

All five packages (`shared/` plus the four frameworks) share one Postgres database, so only one
of them needs to run `db:setup`.

Full walkthrough - the shared package layout, the domain model, a signed-in `curl` session
including the CSRF handshake, and the build/verification checklist - is in
[`examples/duck-iam/README.md`](https://github.com/gentleeduck/duck-iam/tree/main/examples/duck-iam)
in the repository.

## See also

* [Quick start](/duck-iam/guides) - the same concepts, built up from an empty project
* [Cookbook](/duck-iam/guides/cookbook) - the ownership and multi-tenancy recipes this app uses
* [Pairing with duck-auth](/duck-iam/guides/auth-bridge) - how the examples project a session onto a subject