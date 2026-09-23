`createIam()` is the typed entry point of duck-iam. You hand it the vocabulary of your application - the actions, resource types, scopes, and role IDs it supports - and it hands back builders whose every string argument is constrained to that vocabulary. This page explains the two ways to define permissions and points at the reference pages for each part of the API.

## Two ways to define permissions

Both paths produce identical runtime data. The difference is entirely at compile time.

| Approach | Import | Best for |
|---|---|---|
| Untyped builders | `defineRole`, `definePolicy`, `defineRule`, `when` from `@gentleduck/iam` | Prototypes, scripts, library code that must stay generic |
| Typed config | `createIam` from `@gentleduck/iam` | Production apps, anywhere a typo in a permission string costs money |

`engine.can('user-1', 'raed', ...)` compiles, runs, and returns `false` because no role grants `raed`. Nothing logs an error - the check fails closed. The typed config turns that into a compile error instead.

## How the types flow

This shows what `createIam()` does with the arrays you pass it.

The `const` type parameters on `createIam` (`const TActions extends readonly string[]`) mean TypeScript keeps the literal tuple even without an explicit `as const` in many positions - but a plain `const actions = [...]` declared elsewhere and then passed in has already widened to `string[]`, and nothing can recover the literals after that. Declare the arrays inline, or annotate them `as const` at their declaration site.

## What the config object holds

The return value is a plain object literal: four readonly arrays and eight methods. There is no class and no hidden state.

`actions` and `resources` are passed straight through from the input. `scopes` and `roles` fall back to `[]` when you omit them. The four builder methods each construct a fresh builder instance per call; `checks` is an identity function; `validatePolicy` forwards to the standalone validator unchanged, and `validateRoles` forwards the declared `actions` / `resources` / `scopes` along with the roles, so it additionally flags a grant naming vocabulary this config never declared.

## Reading order

| Page | Covers |
|---|---|
| [createIam()](/duck-iam/advanced/config/access-config) | Full options table, generic inference, optional-field behaviour, return shape |
| [Methods reference](/duck-iam/advanced/config/methods) | Every method on the returned object with its verified signature |
| [Typed context](/duck-iam/advanced/config/context) | How `context` drives dot-path autocomplete and per-resource attribute narrowing |
| [Typed $-references](/duck-iam/advanced/config/dollar-paths) | `DollarPaths`, where `$` values are accepted, and how they resolve at evaluation time |
| [Typed vs untyped](/duck-iam/advanced/config/comparison) | An honest account of what each approach catches and what neither catches |

## Quick start

```ts
import { createIam } from '@gentleduck/iam'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'

const access = createIam({
  actions: ['create', 'read', 'update', 'delete', 'manage'] as const,
  resources: ['post', 'comment', 'user', 'dashboard'] as const,
  scopes: ['org-1', 'org-2'] as const,
  roles: ['viewer', 'editor', 'admin'] as const,
})

const viewer = access.defineRole('viewer').grant('read', 'post').build()

const adapter = new IamMemoryAdapter<
  'create' | 'read' | 'update' | 'delete' | 'manage',
  'post' | 'comment' | 'user' | 'dashboard',
  'viewer' | 'editor' | 'admin',
  'org-1' | 'org-2'
>({ roles: [viewer], assignments: { 'user-1': ['viewer'] } })

const engine = access.createEngine({ adapter })

await engine.can('user-1', 'read', { type: 'post', attributes: {} })
```

The adapter's generic arguments are `<TAction, TResource, TRole, TScope>` and must line up with the config's unions, because `createEngine` expects an `IamAdapter.IAdapter` in exactly those parameters. Constructing the adapter with explicit generics, as above, is what makes that check meaningful.

## When to use each

| Scenario | Recommendation |
|---|---|
| Production application | `createIam()` - the compile errors pay for the setup within a week |
| Prototype or one-off script | Untyped builders; less ceremony, same runtime |
| Permissions loaded from a database at runtime | Untyped for the dynamic half, then `validatePolicy()` at the boundary |
| Library or framework code | Keep the generic parameters open; do not bake a vocabulary into a reusable package |
| Tests | Either; typed catches fixture drift, untyped is shorter |

## See also

* [createIam()](/duck-iam/advanced/config/access-config) - the factory in detail.
* [Type-safe roles](/duck-iam/core/roles/type-safe) - what the typed role builder adds on top.
* [Types and namespaces](/duck-iam/types) - the exact names of everything the config threads through.