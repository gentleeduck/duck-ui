## 0.8.1

### Patch Changes

* 47f9fd3: `FieldDescription` is `text-xs` and, together with `FieldError`, tucks up against the label or control above it in a vertical `Field`. `FieldError` skips entries without a `message`: one message renders as plain text, several as a list, and none renders nothing, where an array of empty entries used to render an empty list.
* a6f949d: The `TooltipArrow`, `PopoverArrow`, `HoverCardArrow` and `DropdownMenuArrow` outline is 1px, like the content border it meets, and is drawn over the fill so the line sits on the curve instead of outside it. The fill comes from `--popover` directly, so the arrow no longer needs the `fill-popover` class.
* a592829: `Sidebar` and `MotionSidebar` sit at `z-5` instead of `z-10`. `SidebarInset` has `min-w-0`, so wide content such as a table scrolls inside it instead of pushing the page wider, and a hidden `SidebarGroupLabel` in icon mode no longer takes clicks. `Badge` size `sm` uses `.75rem` text. Chart tooltip and legend icons keep a `size-*` class you give them instead of being forced to the default size.

## 0.8.0

### Minor Changes

* 0c295e1: `CommandDialog` takes `title` and `description` for its screen-reader title and description, so they can be translated. They default to the English text it hard-coded before, `Command palette` and `Search for commands and navigation items`.
* 9075a3d: `PreviewPanel` and `MotionPreviewPanel` start locked: the wheel over a panel scrolls the page it sits in instead of zooming, and drag and pinch do nothing until the user presses the new lock button beside the zoom controls. The zoom buttons work either way. Pass `defaultLocked={false}` where the panel is the page's main content, and `lockText` and `unlockText` to translate the button. A new `actions` prop renders your own buttons in the toolbar before the zoom controls, and still renders with `showControls={false}`.

  `PreviewPanelDialog` puts its fullscreen button in that toolbar instead of over the bottom corner of the content, takes the same `defaultLocked`, `lockText` and `unlockText` for its inline panel, and opens the fullscreen panel unlocked.

  If a panel relied on the wheel zooming straight away, add `defaultLocked={false}`.

### Patch Changes

* 0f9c5b2: `Breadcrumb` keeps an `aria-label` you pass instead of overwriting it with `breadcrumb`, which stays the default. Its type drops the `separator` prop, which the component never read; if you passed one, remove it and pass `BreadcrumbSeparator` children as before.
* 4d66971: The `Button` and `MotionButton` loading spinner holds still when the user has asked for reduced motion (`motion-reduce:animate-none`).
* 678e0d2: `CommandList` caps the box that scrolls. The `max-h-75` limit and your `className` sat on the list inside the scroll area, so a long list spilled past the cap instead of scrolling; both now go on the viewport. The list also scrolls with the wheel and touch when it is portalled out of a modal, such as a combobox inside a dialog, where the modal's scroll lock used to swallow the gesture.
* 60d564c: `Input` is `h-9`, the height of the `Select` trigger, `Button` and `InputGroup` it sits beside in a form row or a button group; it was `h-8`. `Input`, `Textarea`, the `Select` and `MotionSelect` triggers and the default `Button` share one `shadow-xs`, where the select and button used `shadow-sm` and the input and textarea had none.

## 0.7.0

### Minor Changes

* 8d18fa6: Every component follows the direction set once with `DirectionProvider` or `<html dir>`. Physical sides (`left`/`right` on sheet, sidebar, toasts, and popups) mirror in RTL instead of staying put, arrows and chevrons flip where they point along the inline axis, and keyboard navigation in tabs, menubar, and calendar follows the visual order. Progress fills from the inline-start edge, charts keep their SVG labels anchored, carousel passes the direction to Embla, JSON stays LTR inside the JSON editor, and `Kbd` keeps key labels in typing order. Preview panel controls accept `zoomInText`, `zoomOutText`, and `resetText` for translated labels.
* 22e853d: Add `Typeset`, prose styles for rendered HTML and markdown such as docs pages, blog posts, and streamed AI replies. Wrap content in `<Typeset>` (or add the `typeset` class) and headings, lists, tables, code, and quotes get consistent sizes and spacing driven by three variables: `--typeset-size`, `--typeset-leading`, and `--typeset-flow`. Blocks only take a top margin, so streamed content never shifts what is already on screen. Opt a subtree out with `not-typeset`. The styles ship as `@gentleduck/registry-ui/typeset.css`.
* 27ffc5e: `TabsContent` takes `renderOnce`: the panel mounts the first time its tab opens and then stays mounted, hidden, so form input, scroll position, and fetched data survive tab switches. `forceMount` now keeps a panel mounted from the start, before its tab is ever opened. Kept panels get `display: none` and `aria-hidden`.

  By default an inactive panel now unmounts. Before, every panel stayed mounted after its first open no matter which props you passed. If you relied on that to keep state across tab switches, add `renderOnce`.

### Patch Changes

* 2f92193: Components share one motion language. Popups and dialogs set enter and exit durations with `animation-duration-*` (200ms in and 150ms out; 300ms and 200ms for dialogs and sheets) on the shared `--gentleduck-motion-ease`. Transitions name the properties they animate instead of `transition-all`, and the sidebar, accordion, and collapsible use the same easing. Motion popovers use `springBouncy`, alert dialogs `springStiff` for both overlay and content, and the motion sheet overlay `tweenSlow`.
* 33c4389: The `Command` shortcut docs use `mod+k`, which is Cmd on Mac and Ctrl elsewhere, instead of `ctrl+K`.
* ed5fb65: The navigation menu viewport measures its content before the first paint, so opening a menu no longer flashes an empty 0x0 box for a frame. The styled viewport also fades as it zooms in and out.
* c9fe51c: Tailwind classes use their v4 forms: `size-*` instead of matching `h-*`/`w-*` pairs, `outline-hidden` instead of `outline-none`, and `focus-visible:` rings on close buttons, so a mouse click no longer leaves a focus ring. Popover, tooltip, hover card, and dropdown menu set their border colour with a class instead of an inline style, and the slider thumb uses `bg-background` so it follows the theme.
* 8ed39e5: `ScrollArea` shows the native scrollbar again. The viewport hard-coded `scrollbar-none`, so content scrolled with no visible bar, and a `viewportClassName` could not bring it back. The bar now uses your global `::-webkit-scrollbar` styles; pass `viewportClassName="scrollbar-none"` to hide it.
* 1b0f91a: `SheetContent` renders its children before the close button, so the absolutely positioned button stays on top of full-bleed content and comes after it in tab order.
* Updated dependencies \[ed5fb65]
* Updated dependencies \[8d18fa6]
  * @gentleduck/primitives@0.5.0

## 0.6.2

### Patch Changes

* 65728a4: `MotionTableRow`, `MotionAlertTitle`, `MotionAlertDescription` and `MotionTypographyListItem` bring their own `LazyMotion`. They need no context from their motion root, so they can sit in the plain `Table`, `Alert` or list, where nothing loaded Motion's features and their entrance animation never ran.
* ee71f99: `toDirection` accepts only `ltr` and `rtl`. It checked `dir in DIRECTION_DICTIONARY`, which also matches keys inherited from `Object.prototype`, so `toDirection('toString')` returned `'toString'` as a direction.
* cafcba7: `unsafeHtml` takes priority over `children` whenever it is passed, as its docs say. `PreviewPanel`, `MotionPreviewPanel` and `PreviewPanelDialog` tested its truthiness, so `unsafeHtml=""` rendered `children` instead.

## 0.6.1

### Patch Changes

* bfa58d9: - Disabled and `aria-disabled` controls show a `cursor-not-allowed` cursor. They relied on `pointer-events-none` alone, which hid the cursor instead of showing that the control is disabled.
  * An icon inside a component can be resized with its own `size-*` class, without `!`. The components' default `[&_svg]:size-4` now steps aside when the icon carries a size.
  * The `Switch` thumb grows from the correct side in left-to-right layouts. Its transform origins were the right-to-left ones; they now follow the direction.
  * `PopoverArrow`'s props no longer reference the primitive's internal `Scope` type, which made declaration emit non-portable.
* Updated dependencies \[1681854]
* Updated dependencies \[bfa58d9]
  * @gentleduck/calendar@0.5.0
  * @gentleduck/primitives@0.4.0

## 0.6.0

### Minor Changes

* a157bae: Add styled arrow components for overlay components: `TooltipArrow`, `PopoverArrow`, `HoverCardArrow`, and `DropdownMenuArrow`. Arrows use a bezier curve SVG shape that seamlessly joins the content border, with border stroke on curved sides only via a two-path technique. Border color is customizable via `--tooltip-border-color`, `--popover-border-color`, `--hover-card-border-color`, and `--dropdown-menu-border-color` CSS custom properties on the respective content elements. Also fixes `overflow-hidden` removal from content containers so arrows are not clipped, adds `relative` positioning for correct arrow animation, and restructures `DropdownMenuContent` with an inner scrollable wrapper to decouple overflow from the arrow's containing block.

## 0.5.0

### Minor Changes

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
  * @gentleduck/libs@1.0.0
  * @gentleduck/variants@1.0.0
  * @gentleduck/motion@1.0.0
  * @gentleduck/primitives@0.3.0
  * @gentleduck/hooks@1.0.0
  * @gentleduck/vim@0.3.0
  * @gentleduck/calendar@0.4.0

## 0.4.4

### Patch Changes

* 95dbbce: Standardize README headers across all packages: centered logo, h1, tagline, nav links, and npm badges (matching the @duck-md template). Replace per-repo `*.gentleduck.org` subdomain refs with path-based `gentleduck.org/duck-<name>` URLs. No runtime code changes.

## 0.4.3

### Patch Changes

* 918b34c: Strip `workspace:*` and `catalog:` protocol tokens from `devDependencies`/`dependencies`/`peerDependencies` of every public package before `changeset publish`. Previously published artifacts leaked these tokens into npm metadata, which broke strict resolvers (bun, deno) for downstream consumers. Adds `scripts/clean-publish.ts` and wires it into the root `release` script with a `git checkout` restore step so source remains workspace-friendly.

## 0.4.2

### Patch Changes

* b4706d3: Replace `workspace:*` deps in published `dependencies` and `peerDependencies` with explicit semver. Previous publishes leaked `workspace:*` to the npm tarball, breaking `bun install` for downstream consumers (`error: Workspace dependency "@gentleduck/calendar" not found`).

## 0.4.1

### Patch Changes

* Updated dependencies \[df57671]
  * @gentleduck/primitives@0.2.11

## 0.4.0

### Minor Changes

* 7d6fb7b: Motion: export IDuckMotion namespace, add token presets, stagger utility, and exit-transition context. Shortcut and registry-ui gain motion library integration with dialog animations and MotionBadge preset.

### Patch Changes

* Updated dependencies \[7d6fb7b]
* Updated dependencies \[7d6fb7b]
* Updated dependencies \[7d6fb7b]
  * @gentleduck/motion@0.3.0
  * @gentleduck/calendar@0.3.0
  * @gentleduck/hooks@0.2.0
  * @gentleduck/libs@0.2.0
  * @gentleduck/vim@0.2.0
  * @gentleduck/primitives@0.2.10
  * @gentleduck/variants@0.1.22

## 0.3.3

### Patch Changes

* 0f4f2e2: Performance pass across all Motion components. Extracted inline useMotionPreset option objects to module-level constants. Memoized context provider values in Accordion, Tabs, ToggleGroup, and Collapsible. Extracted inline animate and transition literals to constants in Switch, Tabs, and Progress. Memoized event handlers with useCallback. Converted 47 wildcard barrel exports to named exports for tree-shaking. Migrated all 41 component files from string-based preset lookups to direct preset object imports. Fixed stale event handler closure in CollapsibleTrigger. Fixed MotionSelectTrigger to use LazyMotion plus m.div instead of the heavy motion.div root import. Added sideEffects false to package.json.
* Updated dependencies \[0f4f2e2]
  * @gentleduck/motion@0.2.0

## 0.3.2

### Patch Changes

* Updated dependencies \[32d0136]
  * @gentleduck/calendar@0.2.1

## 0.3.1

### Patch Changes

* Updated dependencies \[58d1c61]
  * @gentleduck/calendar@0.2.0

## 0.3.0

### Minor Changes

* 3ee8b3a: feat: add AI documentation chat and command menu enhancements

  @gentleduck/docs:

  * Add useAIChat hook for streaming AI chat with rAF-batched updates
  * Add AIChatPanel component with markdown rendering, shiki syntax highlighting, and dynamic props
  * Add AI toggle mode to CommandMenu with auto-switch on empty search results
  * Add react-markdown and shiki as optional peer dependencies

  @gentleduck/registry-ui:

  * Add hideClose prop to DialogContent to conditionally hide the close button
  * Add children prop to CommandInput for rendering extra elements in the input wrapper
  * Add contentClassName prop to CommandDialog for dynamic dialog sizing

## 0.2.12

### Patch Changes

* 0fd319f: Update carousel, pagination, and sidebar components with tests and fixes.

## 0.2.11

### Patch Changes

* 3b33efe: Remove select-none from accordion content so users can select and copy text inside accordion panels.

## 0.2.10

### Patch Changes

* 74f5628: Remove whitespace-nowrap from accordion trigger to allow text wrapping on smaller screens.

## 0.2.9

### Patch Changes

* 80f8c4c: Fix declaration output for shared docs and registry UI components so consumer apps keep valid props during production typechecking.

## 0.2.8

### Patch Changes

* e7ee580: fix(registry-ui): replace workspace:\* dependencies with published npm versions

  The published package had `workspace:*` references that broke any consumer's install.

## 0.2.6

### Patch Changes

* 2b6e8d0: Resolve all biome lint warnings, improve type safety, and add test coverage across the monorepo.
* Updated dependencies \[2b6e8d0]
  * @gentleduck/primitives@0.2.5
  * @gentleduck/variants@0.1.20
  * @gentleduck/hooks@0.1.12
  * @gentleduck/motion@0.1.17
  * @gentleduck/libs@0.1.15
  * @gentleduck/vim@0.1.16

## 0.2.5

### Patch Changes

* fix(search): disable primitive's built-in filter when using custom lunr search

  The command menu had two competing filtering systems: lunr-based search and the primitive's
  substring filter. The primitive's filter was hiding items via `el.hidden = true` even when
  lunr correctly found them, causing search results to not appear. Added `shouldFilter` prop
  to the Command primitive to allow disabling the built-in filter.

* Updated dependencies
  * @gentleduck/primitives@0.2.4

## 0.2.4

### Patch Changes

* ba8a6f3: fix: update resizable components to react-resizable-panels v4 API

  Replace deprecated ref with panelRef across resizable component and
  examples to align with react-resizable-panels v4.

## 0.2.3

### Patch Changes

* 7c2aa88: Update dependencies and publish unpublished packages
* Updated dependencies \[7c2aa88]
  * @gentleduck/hooks@0.1.11
  * @gentleduck/libs@0.1.14
  * @gentleduck/motion@0.1.16
  * @gentleduck/primitives@0.2.3
  * @gentleduck/variants@0.1.19
  * @gentleduck/vim@0.1.15

## 0.2.2

### Patch Changes

* c9bbef8: Documentation and style updates.
* Updated dependencies \[c9bbef8]
  * @gentleduck/hooks@0.1.10
  * @gentleduck/libs@0.1.13
  * @gentleduck/motion@0.1.15
  * @gentleduck/primitives@0.2.2
  * @gentleduck/variants@0.1.18
  * @gentleduck/vim@0.1.14

## 0.2.1

### Patch Changes

* ad86755: Migrate all UI components to new duck-primitives, add RTL support, and update component styles.

  **Features:**

  * Migrate all registry-ui components to new duck-primitives module
  * Add RTL support with CSS logical properties across components
  * Add AnimVariants for consistent animation behavior
  * Rewrite alert-dialog to use new primitives
  * Rewrite sheet to use new dialog-based primitives
  * Rewrite menubar to use new menubar primitives
  * Switch preview index to next/dynamic SSR entries

  **Fixes:**

  * Fix dialog and popover styles for Tailwind CSS v4 compatibility
  * Fix select to manage its own open state
  * Fix popover width and update calendar/date-picker examples
  * Disable SSR for dynamic preview components

* Updated dependencies \[ad86755]
  * @gentleduck/primitives@0.2.1
  * @gentleduck/hooks@0.1.9
  * @gentleduck/libs@0.1.12
  * @gentleduck/variants@0.1.17
  * @gentleduck/motion@0.1.14
  * @gentleduck/vim@0.1.13

## 0.2.0

### Minor Changes

* 36f9364: Add json-editor component with inline, sheet, and popover editing modes for JSON data with validation. Includes registry entries and three example demos.

### Patch Changes

* d46534e: Upgrade recharts peer dependency from v2 to v3.7.0 with updated chart component types.
* Updated dependencies \[36f9364]
  * @gentleduck/primitives@0.2.0

## 0.1.17

### Patch Changes

* Updated dependencies \[4f93768]
  * @gentleduck/primitives@0.1.45

## 0.1.16

### Patch Changes

* Updated dependencies \[d0a2c1d]
* Updated dependencies \[d0a2c1d]
  * @gentleduck/primitives@0.1.44

## 0.1.15

### Patch Changes

* Updated dependencies \[45ec82f]
  * @gentleduck/primitives@0.1.43

## 0.1.14

### Patch Changes

* Updated dependencies \[cd47e32]
  * @gentleduck/primitives@0.1.42

## 0.1.13

### Patch Changes

* df94032: Initial public release of styled UI component wrappers for duck-primitives with Tailwind CSS styling and registry infrastructure.