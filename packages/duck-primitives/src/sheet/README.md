# Sheet

A dialog that slides in from an edge of the screen.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/sheet` |
| API docs | [`duck-primitives/api/sheet.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/sheet.mdx) |
| Styled component | [`registry-ui/src/sheet`](../../../registry-ui/src/sheet) |
| Styled docs | [`duck-ui/components/sheet.mdx`](../../../../apps/duck/content/docs/duck-ui/components/sheet.mdx) |

Every part is the matching [Dialog](../dialog) part under a sheet name, so Dialog's README covers how it behaves.

## Benchmarks

<!-- benchmarks -->
Smaller than all 3. Faster in all 15 timed comparisons.

| | gentleduck | React Aria | Ark UI | vaul |
|---|--:|--:|--:|--:|
| Size, gzipped bytes | 13,909 | 32,732 (0.42x) | 32,018 (0.43x) | 19,993 (0.70x) |
| Mount x100, ms | 1.93 | 6.05 (0.32x) | 5.36 (0.36x) | 3.44 (0.56x) |
| Unmount x100, ms | 0.409 | 0.990 (0.41x) | 0.955 (0.43x) | 0.732 (0.56x) |
| Unmount open x100, ms | 3.25 | 5.91 (0.55x) | 1249 (0.00x) | 5.65 (0.57x) |
| Open, ms | 1.20 | 2.08 (0.58x) | 2.29 (0.53x) | 2.04 (0.59x) |
| Close, ms | 0.873 | 1.14 (0.77x) | 1.67 (0.52x) | 24.7 (0.04x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: React Aria 1.22.1, Ark UI 5.40.0 and vaul 1.1.2.

gentleduck's sheet is its dialog drawn from an edge, so Dialog's table has Radix and Base UI. Here it meets the drawers: vaul, React Aria's Sheet and Ark UI's Drawer, each of which also tracks a swipe.
<!-- /benchmarks -->

## Tests

The stories cover a sheet that its trigger opens with focus inside, looping on Shift+Tab, and that Escape or its
close button closes; a modal sheet whose page takes no press outside and does not scroll, while its long body
does; a non-modal sheet that leaves the page usable; and a sheet at its end edge and its start edge, left to right
and right to left. The end-to-end suite runs each in Chromium, Firefox and WebKit. The rest is Dialog's, which
its own stories and tests cover, and the unit test checks that every part is the Dialog part itself.

Each test written for this module was proven by changing the code and watching a test fail. The suites taken from
React Aria and vaul run that library's own cases against this code. Each file's header names its source and every
case left out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 13 | `sheet.react-aria.test.tsx` 3, `sheet.test.tsx` 1, `sheet.vaul.test.tsx` 9 |
| End to end | 6 | `sheet.e2e.ts` 6 |
| registry-ui | 30 | `sheet.test.tsx` 30 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>19 behaviours, one per test</summary>

**Unit, `sheet.react-aria.test.tsx`**

- React Aria sheet
  - closes on Escape and gives focus back to its trigger
  - closes on a press outside it
  - closes only the topmost of two sheets on Escape

**Unit, `sheet.test.tsx`**

- Sheet
  - is Dialog under both its short and its sheet names

**Unit, `sheet.vaul.test.tsx`**

- vaul base
  - opens from its trigger
  - closes on a press outside it
  - closes from its close button
  - closes when its owner sets it closed
  - starts open with defaultOpen
- vaul controlled
  - stays open on a press outside it when given open alone
  - closes on a press outside it when given open and onOpenChange
- vaul nested
  - opens and closes a sheet inside another, leaving the outer one open
- vaul with a redirect
  - gives the page back its scroll and its pointer once an open sheet unmounts with the page it was on

**End to end, `sheet.e2e.ts`**

- Sheet
  - the trigger opens it with focus inside, and Escape closes it back to the trigger
  - its close button closes it
  - modal, a press outside closes it without reaching the page, and the page does not scroll
  - a long body scrolls inside the panel, and the page behind it stays put
  - non-modal, the page stays usable and a press outside closes it
  - it sits at the end edge, the start edge when asked, and both mirror in right-to-left

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-dialog` 1.1.23, the version Dialog's benchmarks run: Radix has no sheet, and shadcn
builds one from this dialog. 1.3.1, the latest, has since taken focus branches, so a popover or select
portalled out of the content takes focus and scrolls under its lock. The rest still holds against it.

- `Sheet.Root` takes `dir`, and the content writes its direction, from that prop, then a `DirectionProvider`,
  then `<html dir>`. So a sheet placed by its start or end edge mirrors in right to left, even when portalled
  out of the provider. Radix's dialog reads no direction.
- A sheet opened from a dialog's content, or a dialog from a sheet's, is nested, as in Base UI: its content
  and overlay carry `data-nested`, the content it was opened from carries `data-nested-dialog-open`, and
  `--gentleduck-dialog-nested-dialogs` counts the dialogs in front of it.
- `Sheet.Content` takes `initialFocus` and `finalFocus`, as in Base UI and Ark.
- `Sheet.Portal` takes a ref as its `container`.
- Each part is exported under its short name and its sheet name, and `ISheet` types them.

## Fixed

- The test checks that each export is the Dialog part itself, where it checked only that each was
  defined.
- The API docs listed `SheetContentProps` style aliases that never existed. They name the `ISheet`
  namespace, and say a sheet opened from a dialog, or a dialog from a sheet, is nested.
- The API docs example places its panel with `end-0`, so it mirrors in right to left, where `right-0` kept it
  on the right.

## Smaller and faster

- Nothing of its own to shrink: the module is Dialog's, re-exported.

## Breaking changes

- None.

## registry-ui

- `MotionSheetContent` given `side="unset"` slides in from the right, as it does for `null`. It looked the edge up as
  `unset`, so the panel had no position and slid in from the left.
- `MotionSheetContent` jumps into place under `prefers-reduced-motion`, as its overlay already did. Its slide
  was built outside the motion presets, so the panel still slid and blurred in for 300ms while the overlay
  appeared at once.
- A top or bottom `SheetContent` or `MotionSheetContent` is no taller than the screen, so a body with
  `min-h-0 flex-1 overflow-y-auto` scrolls there as it does on the sides. A bottom sheet taller than the screen
  ran off its top, taking the title and the close button with it, and its body never scrolled.
- `SheetContent` and `MotionSheetContent` lay their children out in a column, so their `gap-4` spaces the
  header, body and footer. Every example passed `flex flex-col` to get it, and no longer does.
- `SheetContent` takes `hideClose`, and `closeText` and `hideClose` are part of `ISheetContentProps`,
  which `MotionSheetContent` shares.
- `SheetContent` takes the primitive's `initialFocus` and `finalFocus`.
- `Sheet`, `SheetTrigger`, `SheetClose` and `SheetPortal` set no `displayName`, so a dialog no longer
  shows in React DevTools as a sheet.
- `SheetFooter` spaces its buttons when they stack on small screens, where they touched.
- The overlay is clear when the sheet is opened from a dialog's content.
- The close button drops its `disabled` and `data-[state=open]` classes, which never applied.
- The sidebar's mobile sheet takes `SIDEBAR_WIDTH_MOBILE` again. Its `w-[--sidebar-width]` compiled to
  `width: --sidebar-width` under Tailwind 4, which the browser drops. Eight chart and block classes and one
  chart docs snippet had the same Tailwind 3 syntax and use `(--name)` now.
- The sidebar docs drop `--sidebar-width-mobile`, which nothing read.
- `SheetContent` with `forceMount` stays in the page while closed. It drew its portal without the prop, so the
  portal unmounted it and the documented `forceMount` did nothing. Its overlay, kept with it, holds the end of
  its fade and lets presses through, so it never covers the page once closed.
- `SheetContent` and `MotionSheetContent` take `container`, handed to its portal, so the sheet renders into an
  element of your own, such as one carrying another theme. It always portalled to `document.body`, so the
  `container` documented on `SheetPortal` could not reach it.
- Two examples: a sheet portalled into a dark panel, and one that opens as it mounts through `defaultOpen`.

## Later

- Swiping a sheet closed and snap points, as Vaul has. They need pointer tracking
  the Dialog parts do not have, so they belong in a drawer primitive rather than here.
- `side` lives only in registry-ui. A `data-side` from the primitive would let any styling key off it.
