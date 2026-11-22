## Unreleased

Merged, and out with the next release.

### Minor Changes

The presets move the way they are named and settle cleanly.

* `slideFromLeft` and `slideFromRight` come in from the sides they name, where they came from the opposite ones.
* The blur settles on its own critically damped spring, where a spring carried it past zero to an invalid radius, and a transition's own blur is kept.
* With `tap`, the entrance scales on `scaleX` and `scaleY` and leaves `scale` to the press, so a press releases at once.
* `useMotionRoot` lets a close through when it lands in the frame an open from closed does, so a select picked straight after opening closes.

## 1.0.1

### Patch Changes

* 2f92193: `AnimVariants` transitions only opacity and transforms instead of `transition-all`, so a theme switch no longer fades components while the rest of the page changes instantly. `tweenExit` is now 150ms to match the CSS exit duration, and `checkersStylePattern` drops the duplicated padding and border radius on checkbox, radio, and switch.

## 1.0.0

### Major Changes

* 95638de: Audit-driven refactor across all 15 public packages. Closes type holes, hardens security boundaries, eliminates dead code, and dedups duplicated patterns.

  **Highlights**

  * `duck-docs` — CompiledMdxBody branded type gates `new Function(body)`; sanitizeSvg covers SMIL, unquoted javascript: URIs, nested script, CSS url(), bare iframe; code-preview tag + attr allowlists
  * `duck-registry-build` — safe-path containment at every fs sink; per-phase Zod cache schemas; JSON.stringify in generated TSX; cache manifest rejection on tamper
  * `duck-cli` — install pipeline path containment unified across add/init/update; env-var allowlist contract reconciled with one-time warning; aliases.ui regex validation
  * `duck-primitives` — `observe-element-rect` rAF loop guard (no leak when empty); `compose-ref` useCallback memo fix; popper forwardRef restored for R18 peer compat
  * `duck-hooks` — `useDebounce` is now a real hook (stable identity, unmount cleanup); `useStableId` delegates to React.useId (SSR-safe); `scheduleTransitionTimeout` rename strips two `useHookAtTopLevel` lint suppressions
  * `duck-lazy` — spread order fix restores the lazy swap; `next/image` moved behind `/lazy-image-next` subpath so non-Next consumers don't pull the peer
  * `duck-vim` — single document listener fans out to chord matcher + sequence manager; canonical modifier order; `requireReset` auto-clears for chord bindings; all three hook dep arrays corrected
  * `duck-variants` — `Props<T, D>` makes defaulted variant keys optional and non-defaulted required; bounded `preludeCache` LRU; second-layer `filter2` set eliminates last clone in hot path
  * `duck-ttest` — `predictates/` renamed to `predicates/`, twin dirs deleted, type-utility duplicates reconciled to canonical sources, `IsVoid` actually distinguishes void from undefined now
  * `duck-calendar` — `./*` wildcard export removed; falsy-zero `weekStartDay: 0` (Sunday) bug fixed; Gregorian helpers extracted; Hebrew `addMonths` uses Metonic cycle
  * `duck-libs` — `cnMemo` bounded LRU; `filteredObject` rejects typo keys at compile time; `parseDate` rejects ambiguous one-token inputs
  * `duck-query` — single AnyReq boundary cast replaces 14 `as any`; param regex escape; throws on unresolved `:tokens`
  * `registers` — schema tightened (`z.any()` removed); ~1000 LoC of identical block-registry boilerplate replaced with builders
  * `registry-ui` — `_audio` / `_upload` (~1.1K LoC) deleted; `motion-shell` HOC + `withMotion` collapses simple motion clones; `toDirection()` narrower replaces 52 `as IDirection.Kind` casts; chart `CSS_NAMED_COLORS` finite allowlist
  * `duck-motion` — refcounted body `pointer-events` ownership; easing/blur/duration token dedup; half of public exports were unused and removed

  Tests: 3133+ across the monorepo, all green. Type-checks clean across every project. No commits skipped hooks.

### Patch Changes

* Updated dependencies \[95638de]
  * @gentleduck/variants@1.0.0

## 0.3.4

### Patch Changes

* 95dbbce: Standardize README headers across all packages: centered logo, h1, tagline, nav links, and npm badges (matching the @duck-md template). Replace per-repo `*.gentleduck.org` subdomain refs with path-based `gentleduck.org/duck-<name>` URLs. No runtime code changes.
* Updated dependencies \[95dbbce]
  * @gentleduck/variants@0.1.24

## 0.3.3

### Patch Changes

* 918b34c: Strip `workspace:*` and `catalog:` protocol tokens from `devDependencies`/`dependencies`/`peerDependencies` of every public package before `changeset publish`. Previously published artifacts leaked these tokens into npm metadata, which broke strict resolvers (bun, deno) for downstream consumers. Adds `scripts/clean-publish.ts` and wires it into the root `release` script with a `git checkout` restore step so source remains workspace-friendly.
* Updated dependencies \[918b34c]
  * @gentleduck/variants@0.1.23

## 0.3.2

### Patch Changes

* 553e2ea: Fix `files` field to include `src/css/index.css` instead of stale `src/index.css`. The `./css` export pointed to a path that wasn't shipped in the tarball, breaking `import '@gentleduck/motion/css'` in consumer apps.

## 0.3.1

### Patch Changes

* b4706d3: Replace `workspace:*` deps in published `dependencies` and `peerDependencies` with explicit semver. Previous publishes leaked `workspace:*` to the npm tarball, breaking `bun install` for downstream consumers (`error: Workspace dependency "@gentleduck/calendar" not found`).

## 0.3.0

### Minor Changes

* 7d6fb7b: Motion: export IDuckMotion namespace, add token presets, stagger utility, and exit-transition context. Shortcut and registry-ui gain motion library integration with dialog animations and MotionBadge preset.

### Patch Changes

* Updated dependencies \[7d6fb7b]
  * @gentleduck/variants@0.1.22

## 0.2.0

### Minor Changes

* 0f4f2e2: Performance and tree-shaking improvements for the motion library.

  useMotionPreset now accepts either a preset name string or a preset object directly. The object form enables tree-shaking since unused presets are never imported. Exported MotionProvider from the barrel. Removed deprecated motion-tokens module. Extracted shared preset utilities into presets/\_utils.ts. Moved TAP\_SCALE\_TRANSITION and standardEase to transitions/tweens.ts as shared constants. Added sideEffects false to enable bundler tree-shaking.

## 0.1.18

### Patch Changes

* 6f0e067: Standardize package exports to use explicit named exports, add `sideEffects` field and `types` export entries to package.json, and annotate internal APIs with `@internal` JSDoc tags.
* Updated dependencies \[6f0e067]
  * @gentleduck/variants@0.1.21

## 0.1.17

### Patch Changes

* 2b6e8d0: Resolve all biome lint warnings, improve type safety, and add test coverage across the monorepo.
* Updated dependencies \[2b6e8d0]
  * @gentleduck/variants@0.1.20

## 0.1.16

### Patch Changes

* 7c2aa88: Update dependencies and publish unpublished packages
* Updated dependencies \[7c2aa88]
  * @gentleduck/variants@0.1.19

## 0.1.15

### Patch Changes

* c9bbef8: Documentation and style updates.
* Updated dependencies \[c9bbef8]
  * @gentleduck/variants@0.1.18

## 0.1.14

### Patch Changes

* ad86755: Add motion design tokens and reduced-motion accessibility support.

  **Features:**

  * Add motion design tokens for consistent animation duration, easing, and spring values
  * Add reduced-motion helper utilities for prefers-reduced-motion media query support
  * Centralize reduced-motion styles via shared @gentleduck/motion helpers
  * Integrate duck-motion helpers into block-wrapper and inline reduced-motion styles

  **Maintenance:**

  * Refactor motion utilities for cleaner API surface
  * Remove unused AnimPopoverArrowVariants
  * Update README and add react peer dependency
  * Align biome and tsconfig build info exclusions

* Updated dependencies \[ad86755]
  * @gentleduck/variants@0.1.17

## 0.1.12

### Patch Changes

* Improve animation variants with smoother easing curves and consistent timing across popover, dialog, and tooltip transitions.