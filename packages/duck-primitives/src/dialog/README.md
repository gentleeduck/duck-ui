# Dialog

The modal and non-modal dialog that Alert Dialog and Sheet build on.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/dialog` |
| API docs | [`duck-primitives/api/dialog.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/dialog.mdx) |
| Styled component | [`registry-ui/src/dialog`](../../../registry-ui/src/dialog) |
| Styled docs | [`duck-ui/components/dialog.mdx`](../../../../apps/duck/content/docs/duck-ui/components/dialog.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 5. Faster in all 25 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI |
|---|--:|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 13,576 | 13,725 (0.99x) | 25,200 (0.54x) | 28,852 (0.47x) | 21,680 (0.63x) | 20,827 (0.65x) |
| Mount x100, ms | 1.93 | 1.99 (0.97x) | 5.62 (0.34x) | 5.54 (0.35x) | 4.80 (0.40x) | 3.26 (0.59x) |
| Unmount x100, ms | 0.381 | 0.426 (0.89x) | 1.07 (0.36x) | 0.873 (0.44x) | 0.866 (0.44x) | 0.470 (0.81x) |
| Unmount open x100, ms | 3.10 | 5.11 (0.61x) | 4.04 (0.77x) | 3.85 (0.81x) | 1180 (0.00x) | 19.5 (0.16x) |
| Open, ms | 1.20 | 1.30 (0.93x) | 1.94 (0.62x) | 1.63 (0.74x) | 1.68 (0.72x) | 1.55 (0.78x) |
| Close, ms | 0.860 | 0.927 (0.93x) | 1.45 (0.60x) | 0.988 (0.87x) | 1.32 (0.65x) | 1.07 (0.80x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 1.1.23, Base UI 1.0.0-rc.0, React Aria 1.22.1, Ark UI 5.40.0 and Headless UI 2.2.10.
<!-- /benchmarks -->

## Tests

The stories cover a modal and a non-modal dialog, an overlay with `lockScroll` off, right-to-left, a popover
opened from the dialog that takes focus and scrolls under its lock, a dropdown menu inside, `initialFocus` and
`finalFocus` as refs and as `false`, a dialog kept open while its notes are unsaved, three dialogs nested, and
Radix's own cases. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 122 | `dialog.radix.test.tsx` 48, `dialog.test.tsx` 74 |
| End to end | 22 | `dialog.e2e.ts` 12, `dialog.radix.e2e.ts` 10 |
| registry-ui | 6 | `dialog-responsive.test.tsx` 2, `dialog.test.tsx` 4 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>144 behaviours, one per test</summary>

**Unit, `dialog.test.tsx`**

- Dialog
  - renders trigger with data-slot="dialog-trigger"
  - trigger has aria-haspopup="dialog"
  - trigger has aria-expanded=false when closed
  - opens dialog on trigger click
  - renders content when open
  - content has role="dialog"
  - content has aria-labelledby pointing to title
  - content has aria-describedby pointing to description
  - renders title with data-slot="dialog-title"
  - renders description with data-slot="dialog-description"
  - close button has data-slot="dialog-close"
  - calls onOpenChange when trigger clicked
  - trigger has type="button"
  - trigger has aria-controls when open
  - title renders as h2
  - description renders as p
  - close button has type="button"
  - forwards ref to trigger
  - portaled overlay and content inherit dir from DirectionProvider
- Dialog with modal
  - stays open on a right click or a control click outside, which open a context menu rather than press
  - closes on a middle click outside with control held, which opens no context menu
  - lets focus leave when trapFocus is false
  - leaves the page its pointer events when disableOutsidePointerEvents is false
  - hands a focus outside to onFocusOutside and stays open, with the trap off
- Dialog without modal
  - renders no overlay
  - closes on a click outside and leaves focus where the user clicked
  - returns focus to the trigger when it closes from inside
  - leaves its own trigger to the trigger
  - ignores the focus that follows a click outside while the content is still mounted
  - keeps open when the consumer refuses an outside interaction
  - returns focus to the trigger on close after an outside interaction the consumer refused
  - closes when focus moves outside it, and leaves focus there
  - forgets a click outside once it closes, so focus leaving closes it the next time
  - forgets a click outside once it closes, so the next close from inside returns focus to the trigger
  - kept mounted, closes when focus leaves it after a click on the page while it was closed
  - kept mounted, returns focus to the trigger on unmount when its last opening closed from inside
  - stays open when a right click on its trigger moves focus to a focusable box around it
- Dialog accessibility warnings in development
  - errors without a title and warns without a description, naming the part to render
  - stays quiet with a title and a description
  - names the parts its WarningProvider gives
  - takes {"aria-label":"Ducks"} in place of a title
  - takes {"aria-labelledby":"elsewhere"} in place of a title
  - takes {"aria-describedby":"elsewhere"} in place of a description
  - takes {} in place of a description
- Dialog parts
  - throws for a Title or Description outside the content
  - sets dir on the overlay and the content, and on none of the parts inside them
  - takes dir from its own prop over the provider
  - names a Description with an empty id by a generated one
  - carries its own id from the first commit, so a ref can read it
- Dialog part props
  - lets the props on a trigger win over its own attributes
  - renders the content with data-slot="dialog-content"
  - lets a style on the content set its nesting variable
  - renders into the container its portal names
  - mounts a closed overlay forced by itself or by its portal
  - keeps a title in its place among the others when its id changes
  - puts focus guards at both ends of the page while open, and takes them away once closed
  - moves focus from its last element to its first on Tab, and back on Shift+Tab
- Dialog returning focus
  - returns focus to its trigger when something else opened it, {"modal":true}
  - returns focus to its trigger when something else opened it, {"modal":false}
- Dialog scroll lock
  - lets a registered branch scroll and keeps the rest of the page locked
  - leaves a registered branch to screen readers and hides the rest of the page from them
  - leaves a dialog opened from it to screen readers when one of its branches closes
- Dialog giving the page back on close
  - removes the content before it gives the page back its pointer events and its scroll
  - gives the page back at once when the content is force mounted to animate out
  - gives the page its pointer events back while a CSS exit animation runs
- Dialog opened from another dialog
  - marks the dialog opened from another as nested, and the one it was opened from as holding it
  - counts how deep the open dialogs go, and stops counting one once it closes
  - stops counting a nested dialog that leaves the page while it is open
  - counts an alert dialog opened from a dialog
  - is not nested in a dialog whose root holds it outside the content
- Dialog focus targets
  - focuses the element initialFocus names on open rather than the first one
  - leaves focus on the trigger when initialFocus is false
  - focuses the element finalFocus names on close rather than the trigger
  - lets an auto focus handler that prevents the default win over the targets

**Unit, `dialog.radix.test.tsx`**

- given a default Dialog
  - should have no accessibility violations in default state
- given a default Dialog &gt; after clicking the trigger
  - should open the content
  - should have no accessibility violations
  - should focus the close button
- given a default Dialog &gt; after clicking the trigger &gt; when pressing escape
  - should close the content
- aria-controls
  - should not reference a non-existent element while closed
  - should reference the rendered content while open
  - should reference content with a custom id while open
- aria-labelledby / aria-describedby references
  - should reference `Title` and `Description` when they are rendered
  - should normalize existing aria-describedby ids and append the Description id
  - should not set `aria-labelledby` when no `Title` is rendered
  - should not set `aria-describedby` when no `Description` is rendered
  - should update references when `Title`/`Description` mount and unmount
  - should reference a `Title` with a custom id
  - should update the `Title` reference when its custom id changes or is removed
  - should fall back to a generated id for a `Title` with an empty id
  - should reference a `Description` with a custom id
  - should reference every rendered `Description` with unique ids
  - should merge `aria-describedby` on `Content` with custom `Description` ids
  - should update the `Description` reference when its custom id changes or is removed
  - should remove only the unmounted `Description` from `aria-describedby`
  - should keep custom id references across React strict mode remounts
- given a modal Dialog
  - should restore `body` pointer-events after closing
  - should not prevent ctrl + wheel (page zoom) while open
- given a Dialog with `asChild` on the Content
  - forwards content props and the ref to the child (modal: true)
  - forwards content props and the ref to the child (modal: false)
  - registers portalled descendants as focus scope branches
  - still dismisses on escape when slotted
- given two overlapping modal Dialogs (forceMount)
  - should restore `body` pointer-events after both close
- given a modal Dialog containing a nested modal layer (eg. a DropdownMenu)
  - does not call `onOpenChange(false)` on a controlled dialog when the nested layer is dismissed by an outside interaction
- given a modal Dialog with an Overlay
  - gives the overlay a click listener of its own so iOS Safari dispatches click for taps on it (asChild: false)
  - gives the overlay a click listener of its own so iOS Safari dispatches click for taps on it (asChild: true)
  - waits for the click that follows a pointer down on the overlay, then closes and calls the consumer handlers once
  - stays open when `onPointerDownOutside` is prevented
  - stays open when `onInteractOutside` is prevented
- Dialog.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Dialog.Overlay
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Dialog.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - forwards props to the child element when `asChild` is set on a non-modal dialog
- Dialog.Title
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Dialog.Description
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Dialog.Close
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**End to end, `dialog.e2e.ts`**

- Dialog
  - modal, it hides the page from assistive tech until it closes
  - modal, it locks the page while its own list scrolls
  - modal, an overlay with lockScroll off leaves the page free to scroll
  - a popover opened from it takes focus and typing, scrolls under the lock, and Escape closes only it
  - non-modal, the page stays usable and scrolls, and a press outside closes it and reaches the page
  - right-to-left, the direction lands on the content and the overlay, not the trigger
- Dialog focus targets
  - focuses what initialFocus names on open, and what finalFocus names on close
  - leaves focus where it is when initialFocus or finalFocus is false
- Dialog guarded and nested
  - closes on Escape while nothing is unsaved
  - stays open on Escape and an outside press while notes are unsaved
  - marks a nested dialog and its overlay, and counts the dialogs in front of the one they were opened from
  - closes only the nested dialog on Escape, and both from its own button

**End to end, `dialog.radix.e2e.ts`**

- Dialog &gt; given a modal dialog
  - can be open/closed with a keyboard
  - can be open/closed with a pointer
  - keeps focus trapped even if focused element is removed
- Dialog &gt; given a non-modal dialog
  - can be open/closed with a keyboard
  - can be open/closed with a pointer
- Dialog with a nested DropdownMenu
  - dismissing the dropdown does not close the dialog
  - pressing Escape closes only the dropdown
- Dialog extension overlay interactions
  - keeps the dialog open when interacting with a shadow tree inside the dialog
  - keeps the dialog open when an outside overlay stops later mouse events
  - closes the dialog when the overlay is tapped

</details>
<!-- /behaviour -->

## Beyond Radix

- Nested dialogs, as in Base UI. A dialog whose root renders inside another's content is nested: its
  content and overlay carry `data-nested`, the content it was opened from carries
  `data-nested-dialog-open`, and `--gentleduck-dialog-nested-dialogs` counts the dialogs in front of it.
  Alert Dialog and Sheet get the same.
- `FocusScope` takes `branches`, nodes outside its DOM that focus may move into, so a popover or select
  portalled out of a modal dialog can take focus and scrolls under the dialog's scroll lock.
- `Portal` takes a ref as its `container`.
- `Dialog.Content` takes `initialFocus` and `finalFocus`, as in Base UI and Ark: the element to focus on
  open and on close, or `false` to leave focus where it is. A handler that prevents the default still
  wins. Sheet's content is this one, and Alert Dialog's takes them too.

## Fixed

- Passes every Radix test for `Dialog`, `AlertDialog`, `FocusScope` and `DismissableLayer`.
- `Dialog.Title` and `Dialog.Description` register with their content, so `aria-labelledby` and
  `aria-describedby` list every one mounted, and a passed `aria-describedby` comes first.
- An `id` on the content reaches the trigger's `aria-controls`, set only while open.
- The development warnings fire only when the content has no title or label, or no description, and Alert
  Dialog no longer logs a second warning.
- A primary press outside dismisses once the click lands, so stopping the later events cancels it. A
  touch waits for its click, so that click no longer lands on what the closing layer uncovered.
- Tab and Escape during an IME composition are left to the input method.
- A scope inside an iframe reads focus in its own document.
- A layer that disables outside pointer events sets its own `pointer-events` on its first render.
- A modal dialog in a second document, such as an iframe's, locks that document's body too, and closing the
  first document's dialog first no longer leaves its body locked.
- A modal dialog leaves a layer portalled out of it, such as a popover's content, to screen readers when it hides
  the rest of the page. It hid every layer that mounted with it. A dialog opened from it stays reachable when one
  of those layers closes.
- A non-modal dialog kept mounted with `forceMount` forgets a press outside when it opens again. A press on the
  page while it was closed, or the one that closed it, kept focus moving outside from closing it, and kept focus
  from going back to the trigger once it unmounted.

## Smaller and faster

- The page gets its pointer events and scroll back once the content has left, not the commit before, so
  closing no longer restyles every element.
- The content keeps one ref, where an inline callback reattached it every render.
- Each layer has its `pointer-events` written from one shared stack and adds no listeners of its own, so
  unmounting 100 open dialogs takes 0.61 of Radix's time.
- `FocusScope` finds the first visible element with `checkVisibility` where the browser has it.
- With 2,000 elements on the page a Dialog closes in 1.11ms against Radix's 1.86, where it took 3.11, and
  opens in 3.73ms against Radix's 3.81, where it took 5.17.
- Modal and non-modal content are one component, and `WarningProvider` renders only its children in production.
- The root reads the direction provider once and hands it to the content and the overlay, where each subscribed to
  `<html dir>` for a value that content portalled into the page inherits anyway.

## Breaking changes

- `Dialog.Trigger`, `Dialog.Close`, `Dialog.Title` and `Dialog.Description` carry no `dir` attribute; a
  `dir` passed to the root lands on the content and the overlay.
- With no `dir` on the root and no `DirectionProvider`, the content and the overlay carry no `dir` attribute and
  take their direction from where they are portalled, where they copied `<html dir>` onto themselves.
- `Dialog.Title` and `Dialog.Description` must render inside `Dialog.Content`.
- The context drops `titleId` and `descriptionId` and gains `onContentIdChange`, `branches`,
  `branchRegistry`, `layers` and `layerRegistry`. `WarningProvider` takes `descriptionName` and drops `docsSlug`.
- `IDialog.DialogContentElement` is `IDialog.ContentElement`.
- A `DismissableLayer` whose element never takes its ref joins no stack, so nothing dismisses it. It used
  to dismiss on presses and focus outside it and on Escape.
- `IDialog.IContentImplProps` and `IDialog.IContentTypeProps` are gone; `IDialog.IContentProps` holds every
  content prop. A `modal` changed while the dialog is open keeps the content mounted, where it mounted it again.

## registry-ui

- `DialogContent` and `MotionDialogContent` step back behind a dialog opened from them, smaller and
  higher for each one in front, with the transition off under `prefers-reduced-motion`.
- The overlay of a dialog, alert dialog or sheet opened from a dialog is clear, so the page dims once.
- `IDialogContentProps` is exported.
- `DialogFooter` spaces its buttons when they stack on small screens, where they touched.
- The close button drops its `disabled` and `data-[state=open]` classes, which never applied.
- The examples cover a controlled dialog, an active trigger, a nested dialog, focus targets, a dialog kept open
  while unsaved, a body that scrolls, a non-modal dialog, a select and a popover inside, right-to-left, motion,
  and the responsive dialog that becomes a drawer on a narrow screen.

## Later

- `IDialog.ContentElement` stays an alias of the primitive's ref; removing it is breaking.
- A focusable `<svg>` at either end of a trapped dialog is not read as an edge, so Tab loops back before it and
  leaves the dialog from it. FocusScope takes HTML elements only. Pinned by a failing test in `focus-scope/__tests__`.
