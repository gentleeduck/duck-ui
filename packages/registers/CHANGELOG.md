# @gentleduck/registers

## 1.0.3

### Patch Changes

- 3390968: Every example, block and internal item lists the registry parts and npm packages its files import, so an item added through the CLI comes with everything it needs. Command installs `keys-label` and `shortcut-binder` and drops the unused `@gentleduck/vim`.

## 1.0.2

### Patch Changes

- 0a36950: The `sheet` item depends on `direction`, since the motion sheet now imports its helpers. Adding `sheet` installs `direction` too instead of leaving a broken import.
- 22e853d: Register the `typeset` component, including its stylesheet, and its example.

## 1.0.1

### Patch Changes

- 1039154: Make every registry-ui item declare what its files import, so `duck add` installs it whole. 31 components imported `../direction/direction.libs` without depending on `direction`, 12 imported `_internal` helpers that no item shipped, and 52 imported packages such as `motion`, `@gentleduck/motion` and `@gentleduck/vim` without declaring them. The new `motion-shell` and `shortcut-binder` items ship the two helpers, and a test now fails when an item imports a file or package its install does not put in place.

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

## 0.4.1

### Patch Changes

- 95dbbce: Standardize README headers across all packages: centered logo, h1, tagline, nav links, and npm badges (matching the @duck-md template). Replace per-repo `*.gentleduck.org` subdomain refs with path-based `gentleduck.org/duck-<name>` URLs. No runtime code changes.

## 0.4.0

### Minor Changes

- 7d6fb7b: Registry constant exports renamed to camelCase convention.

## 0.3.5

### Patch Changes

- 0f4f2e2: Registered typography as a new component in the UI registry. Wired typography-examples registry dependency.

## 0.3.4

### Patch Changes

- 2b6e8d0: Resolve all biome lint warnings, improve type safety, and add test coverage across the monorepo.

## 0.3.3

### Patch Changes

- efb94d8: fix: add missing component dependencies (primitives, lucide-react) to registry entries

## 0.3.2

### Patch Changes

- 7c2aa88: Update dependencies and publish unpublished packages

## 0.3.1

### Patch Changes

- c9bbef8: Documentation and style updates.

## 0.3.0

### Minor Changes

- ad86755: Add internal registry support, expand theme system, and update component definitions.

  **Features:**

  - Add internal registry support for primitive component wrappers
  - Add shared direction API for RTL/LTR support across primitives and registry
  - Add sidebar blocks 01-16 with full registry infrastructure
  - Add new color themes: amber, purple, and teal
  - Update component registry definitions and generated JSON manifests

  **Fixes:**

  - Update warning-foreground color in registry color definitions for better contrast
  - Migrate duckui registry packages to new structure

## 0.2.0

### Minor Changes

- 36f9364: Add json-editor component with inline, sheet, and popover editing modes for JSON data with validation. Includes registry entries and three example demos.

## 0.1.1

### Patch Changes

- df94032: Initial public release of registry schema, color definitions, and component registry manifests.
