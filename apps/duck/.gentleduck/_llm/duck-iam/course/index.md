This course builds **DocDuck**, a small documents app, one chapter at a time. Every chapter adds to the same source tree, so the code in chapter N+1 compiles against the state chapter N left behind. You need TypeScript and a terminal; everything else is explained as it appears.

## What you build

DocDuck has three entities and one authorization question repeated across all of them: *may this subject perform this action on this document?*

A `USER` is a **subject** in duck-iam terms. A `TEAM` becomes a **scope** in chapter 5. A `DOCUMENT` is a **resource** whose attributes (`ownerId`, `teamId`, `status`) feed the **conditions** you write in chapter 3. `MEMBERSHIP` is the role assignment - a user holds a role, optionally inside one team.

## The roadmap

Chapters 1 to 4 build the authorization core in a single script. Chapters 5 to 8 take that core multi-tenant, put it behind HTTP, push it to the browser, and harden it.

Part 1 is where the model is decided: roles are RBAC, policies are ABAC, and the **engine** runs both through one evaluation pipeline. Part 2 never revisits that pipeline - it wires it into a request, a browser, and a database.

## Course map

| Chapter | Topic | What you learn |
| --- | --- | --- |
| [1](/duck-iam/course/chapter-1) | Your first permission check | `defineRole`, `IamMemoryAdapter`, `IamEngine`, `can` vs `check` |
| [2](/duck-iam/course/chapter-2) | Role hierarchies | `inherits`, grant shortcuts, wildcard matching, `validateRoles` |
| [3](/duck-iam/course/chapter-3) | Policies, rules, and conditions | ABAC rules, all nineteen operators, `$`-variables, combining algorithms |
| [4](/duck-iam/course/chapter-4) | The engine in depth | Modes, hooks, the five caches, batch checks, `explain`, admin API |
| [5](/duck-iam/course/chapter-5) | Multi-tenant scoping | Scoped roles, scope matching, tenant isolation |
| [6](/duck-iam/course/chapter-6) | Server integration | Express, Hono, NestJS, Next.js guards and permission endpoints |
| [7](/duck-iam/course/chapter-7) | Client libraries | Permission maps in React, Vue, and vanilla JS |
| [8](/duck-iam/course/chapter-8) | Production readiness | `createIam` typing, database adapters, validation, monitoring |

## Who this is for

* You are new to duck-iam and want a path that ends with something runnable.
* You are evaluating duck-iam and want to see the whole surface in order.
* You already use duck-iam and want the parts you skipped.

## Prerequisites

* TypeScript basics: interfaces, unions, `async`/`await`.
* Node.js 18 or newer, or Bun.
* No database. Chapters 1 to 7 run entirely in memory; chapter 8 introduces real adapters.

## Setup

Create the project.

```bash
mkdir docduck && cd docduck
npm init -y
npx tsc --init
mkdir src
```

Install duck-iam.

The package has one runtime dependency. Adapters, server helpers, and client
helpers all live behind subpath imports, so nothing you do not import is bundled.

Add a runner. Every chapter runs its script the same way.

```bash
npm i -D tsx
npx tsx src/main.ts
```

Start with [Chapter 1: your first permission check](/duck-iam/course/chapter-1).

## How the chapters are written

Every chapter has the same five parts: **learning goals**, a **diagram** of the mechanism it introduces, the **code**, a **what just happened** walkthrough of what the engine did, and a **try it** exercise. Each new concept links to its reference page, so you can leave the course at any point and keep reading.

All code is verified against `@gentleduck/iam` 5.9.0. Import paths come from the package `exports` map: `@gentleduck/iam`, `@gentleduck/iam/core/validate`, `@gentleduck/iam/adapters/memory`, and so on.

## See also

* [Introduction](/duck-iam/introduction) - the same material as reference rather than tutorial
* [Installation](/duck-iam/installation) - every export path and peer dependency
* [Core concepts](/duck-iam/core) - primitives, evaluation, rule matching