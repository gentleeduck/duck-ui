# Alert Dialog

A modal dialog that asks for a choice and does not close on a press outside.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/alert-dialog` |
| API docs | [`duck-primitives/api/alert-dialog.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/alert-dialog.mdx) |
| Styled component | [`registry-ui/src/alert-dialog`](../../../registry-ui/src/alert-dialog) |
| Styled docs | [`duck-ui/components/alert-dialog.mdx`](../../../../apps/duck/content/docs/duck-ui/components/alert-dialog.mdx) |

Built on [Dialog](../dialog), whose README covers what the two share.

## Benchmarks

<!-- benchmarks -->
Smaller than Base UI, React Aria, Ark UI and Headless UI; larger than Radix. Faster in all 25 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI |
|---|--:|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 14,305 | **14,089 (1.02x)** | 25,060 (0.57x) | 28,852 (0.50x) | 21,680 (0.66x) | 16,893 (0.85x) |
| Mount x100, ms | 2.13 | 2.15 (0.99x) | 5.94 (0.36x) | 5.39 (0.40x) | 4.90 (0.44x) | 3.31 (0.64x) |
| Unmount x100, ms | 0.414 | 0.445 (0.93x) | 1.10 (0.38x) | 0.915 (0.45x) | 0.918 (0.45x) | 0.484 (0.86x) |
| Unmount open x100, ms | 3.53 | 5.66 (0.62x) | 4.12 (0.86x) | 4.38 (0.81x) | 1208 (0.00x) | 19.6 (0.18x) |
| Open, ms | 1.09 | 1.24 (0.88x) | 1.78 (0.61x) | 1.58 (0.69x) | 1.61 (0.68x) | 1.41 (0.77x) |
| Close, ms | 0.780 | 0.901 (0.87x) | 1.28 (0.61x) | 0.928 (0.84x) | 1.25 (0.63x) | 0.966 (0.81x) |

Where gentleduck is behind:

- Size against Radix: 1.02x, 216 bytes more.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 1.1.23, Base UI 1.0.0-rc.0, React Aria 1.22.1, Ark UI 5.40.0 and Headless UI 2.2.10.

React Aria, Ark UI and Headless UI have no alert dialog of their own; each is its dialog with `role="alertdialog"`.
<!-- /benchmarks -->

## Tests

The stories cover a dialog confirming a delete, with a button outside it to press; `initialFocus` on the action;
an action that prevents its own close while its work runs, then closes; and right to left under a provider. The
end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 47 | `alert-dialog.radix.test.tsx` 18, `alert-dialog.test.tsx` 29 |
| End to end | 6 | `alert-dialog.e2e.ts` 6 |
| registry-ui | 7 | `alert-dialog.test.tsx` 5, `motion-alert-dialog.test.tsx` 2 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>53 behaviours, one per test</summary>

**Unit, `alert-dialog.radix.test.tsx`**

- given a default AlertDialog
  - should have no accessibility violations in default state
- given a default AlertDialog &gt; after clicking the trigger
  - should open the content
  - should have no accessibility violations when open
  - should focus the cancel button
- AlertDialog.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- AlertDialog.Overlay
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- AlertDialog.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- AlertDialog.Title
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- AlertDialog.Description
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- AlertDialog.Action
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- AlertDialog.Cancel
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `alert-dialog.test.tsx`**

- AlertDialog
  - renders trigger with data-slot="dialog-trigger"
  - trigger has aria-haspopup="dialog"
  - trigger starts with data-state="closed"
  - opens on trigger click
  - renders content with role="alertdialog" when open
  - content has aria-labelledby pointing to title
  - content has aria-describedby pointing to description
  - renders action and cancel buttons
  - calls onOpenChange when trigger clicked
  - forwards ref to trigger
  - trigger has type="button"
  - is always modal (no non-modal option)
  - stays modal when told otherwise, hiding the page behind it
  - takes a role passed to its content over alertdialog
  - hands its parts the scope it is given
  - names each part in React DevTools
  - content has data-state="open" when open
  - title renders as h2
  - action buttons have type="button"
  - portaled content inherits dir from DirectionProvider
- AlertDialog warnings in development
  - warns when the content has no description, naming the part to render
  - errors when the content has no title, naming the alert dialog parts
  - stays quiet when the content has one
- AlertDialog outside
  - stays open when the pointer is pressed outside it
- AlertDialog focus targets
  - runs an onOpenAutoFocus of its own before focusing the cancel button
  - focuses the cancel button on open
  - focuses the element initialFocus names on open rather than the cancel button
  - leaves focus on the trigger when initialFocus is false
  - focuses the element finalFocus names on close rather than the trigger

**End to end, `alert-dialog.e2e.ts`**

- AlertDialog
  - focuses Cancel on open, keeps Tab inside, and hands focus back to the trigger on Escape
  - stays open on a click outside, and runs the action once it is chosen
  - closes on Cancel without running the action
  - focuses the part initialFocus names in place of Cancel
  - stays open while an action that prevented its close works, then closes
  - writes the direction a provider gives on the content

</details>
<!-- /behaviour -->

## Beyond Radix

- `AlertDialog.Content` takes `initialFocus` and `finalFocus`, as Base UI's alert dialog does and as
  React Aria's `autoFocusButton` picks the button to focus: the element to focus on open in place of
  `AlertDialog.Cancel`, and on close in place of the trigger, or `false` to leave focus where it is.
- Nested in a dialog's content, it is a nested dialog like any other, with `data-nested` and the stacking
  variable.

## Fixed

- Passes every Radix alert-dialog test.
- It logs one description warning, Dialog's, where it logged a second of its own.

## Smaller and faster

- The content drops its own composed ref, `Slottable` and description warning, and reuses Dialog's.
- Its six pass-through parts, from `Trigger` to `Action`, come from the factory the menus use, where each was
  written out.
- It shares one `focusOn` with Dialog and Popover for its focus targets.
- Its layer has its `pointer-events` written from one shared stack and adds no listeners of its own, so
  unmounting 100 open alert dialogs takes 0.60 of Radix's time.
- Each part's ref is typed as its DOM element.
- The content refuses a close on a press outside once, in `onInteractOutside`, which every press and focus
  outside reaches. It refused it in `onPointerDownOutside` too.

## Breaking changes

- The parts carry no `dir` attribute, as in Dialog, and the content and the overlay carry none at all without a
  `dir` on the root or a `DirectionProvider`.

## registry-ui

- `AlertDialogFooter`, `DialogFooter` and `SheetFooter` space their buttons when they stack on small
  screens, where the buttons touched.
- `AlertDialogContent` takes `initialFocus` and `finalFocus`. A new example asks for a project's name
  before deleting it and focuses that field on open.
- The overlay is clear when the alert dialog is opened from a dialog's content.
- The docs drop the claim that `AlertDialogTrigger` has no `asChild`, which every example uses.

## Later

- Removing the `__scopeAlertDialog` scope props is breaking, and waits with the other scope removals.
