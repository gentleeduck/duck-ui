# @gentleduck/hooks

## 1.0.1

### Patch Changes

- 3390968: `useMediaQuery` no longer throws where there is no `matchMedia`, as on a server render or in jsdom.

## 1.0.0

### Major Changes

- 95638de: Audit-driven refactor across all 15 public packages. Closes type holes, hardens security boundaries, eliminates dead code, and dedups duplicated patterns.

  **Highlights**

  - `duck-docs` — CompiledMdxBody branded type gates `new Function(body)`; sanitizeSvg covers SMIL, unquoted javascript: URIs, nested script, CSS url(), bare iframe; code-preview tag + attr allowlists
  - `duck-registry-build` — safe-path containment at every fs sink; per-phase Zod cache schemas; JSON.stringify in generated TSX; cache manifest rejection on tamper
  - `duck-cli` — install pipeline path containment unified across add/init/update; env-var allowlist contract reconciled with one-time warning; aliases.ui regex validation
  - `duck-primitives` — `observe-element-rect` rAF loop guard (no leak when empty); `compose-ref` useCallback memo fix; popper forwardRef restored for R18 peer compat
  - `duck-hooks` — `useDebounce` is now a real hook (stable identity, unmount cleanup); `useStableId` delegates to React.useId (SSR-safe); `scheduleTransitionTimeout` rename strips two `useHookAtTopLevel` lint suppressions
  - `duck-lazy` — spread order fix restores the lazy swap; `next/image` moved behind `/lazy-image-next` subpath so non-Next consumers don't pull the peer
  - `duck-vim` — single document listener fans out to chord matcher + sequence manager; canonical modifier order; `requireReset` auto-clears for chord bindings; all three hook dep arrays corrected
  - `duck-variants` — `Props<T, D>` makes defaulted variant keys optional and non-defaulted required; bounded `preludeCache` LRU; second-layer `filter2` set eliminates last clone in hot path
  - `duck-ttest` — `predictates/` renamed to `predicates/`, twin dirs deleted, type-utility duplicates reconciled to canonical sources, `IsVoid` actually distinguishes void from undefined now
  - `duck-calendar` — `./*` wildcard export removed; falsy-zero `weekStartDay: 0` (Sunday) bug fixed; Gregorian helpers extracted; Hebrew `addMonths` uses Metonic cycle
  - `duck-libs` — `cnMemo` bounded LRU; `filteredObject` rejects typo keys at compile time; `parseDate` rejects ambiguous one-token inputs
  - `duck-query` — single AnyReq boundary cast replaces 14 `as any`; param regex escape; throws on unresolved `:tokens`
  - `registers` — schema tightened (`z.any()` removed); ~1000 LoC of identical block-registry boilerplate replaced with builders
  - `registry-ui` — `_audio` / `_upload` (~1.1K LoC) deleted; `motion-shell` HOC + `withMotion` collapses simple motion clones; `toDirection()` narrower replaces 52 `as IDirection.Kind` casts; chart `CSS_NAMED_COLORS` finite allowlist
  - `duck-motion` — refcounted body `pointer-events` ownership; easing/blur/duration token dedup; half of public exports were unused and removed

  Tests: 3133+ across the monorepo, all green. Type-checks clean across every project. No commits skipped hooks.

## 0.2.2

### Patch Changes

- 95dbbce: Standardize README headers across all packages: centered logo, h1, tagline, nav links, and npm badges (matching the @duck-md template). Replace per-repo `*.gentleduck.org` subdomain refs with path-based `gentleduck.org/duck-<name>` URLs. No runtime code changes.

## 0.2.1

### Patch Changes

- 918b34c: Strip `workspace:*` and `catalog:` protocol tokens from `devDependencies`/`dependencies`/`peerDependencies` of every public package before `changeset publish`. Previously published artifacts leaked these tokens into npm metadata, which broke strict resolvers (bun, deno) for downstream consumers. Adds `scripts/clean-publish.ts` and wires it into the root `release` script with a `git checkout` restore step so source remains workspace-friendly.

## 0.2.0

### Minor Changes

- 7d6fb7b: Namespace refactors: calendar react namespaces renamed to match hook names, hooks/lazy types moved into namespaces, libs utils extracted into own modules, vim react types collapsed into single Vim namespace.

## 0.1.13

### Patch Changes

- 6f0e067: Standardize package exports to use explicit named exports, add `sideEffects` field and `types` export entries to package.json, and annotate internal APIs with `@internal` JSDoc tags.

## 0.1.12

### Patch Changes

- 2b6e8d0: Resolve all biome lint warnings, improve type safety, and add test coverage across the monorepo.

## 0.1.11

### Patch Changes

- 7c2aa88: Update dependencies and publish unpublished packages

## 0.1.10

### Patch Changes

- c9bbef8: Documentation and style updates.

## 0.1.9

### Patch Changes

- ad86755: Align biome and tsconfig build info exclusions. Rebrand package metadata to gentleduck/duck-ui.

## 0.1.8

### Patch Changes

- Add useCopyToClipboard hook for one-click clipboard interaction with success/error feedback.
- Update package metadata, normalize dependencies, and set up type checking.

## 0.1.7

### Patch Changes

- Update contributing guidelines, README structure, and package dependency declarations.

## 0.1.6

### Patch Changes

- Normalize package.json metadata and align repository URLs across all hook exports.

## 0.1.5

### Patch Changes

- Set up check-types script for all packages. Fix type-only exports for stricter TypeScript configurations.

## 0.1.4

### Patch Changes

- Fix repository and bug tracker URLs in package.json metadata.

## 0.1.3

### Patch Changes

- Clean up test infrastructure and update internal dependency references.

## 0.1.2

### Patch Changes

- Fix build output paths and ensure correct ESM/CJS dual-module exports.

## 0.1.1

### Patch Changes

- Initial public release of @gentleduck/hooks with useControllableState, useCallbackRef, and useComposedRefs utilities.
