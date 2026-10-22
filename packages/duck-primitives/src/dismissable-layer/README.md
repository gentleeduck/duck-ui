# Dismissable Layer

The layer under every overlay here. It closes on Escape, on a press outside it and on focus moving outside it,
and it can block the page beneath it while open.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/dismissable-layer` |
| API docs | [`duck-primitives/api/dismissable-layer.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/dismissable-layer.mdx) |
| Used by | `dialog`, `popover`, `tooltip`, `hover-card`, `select`, `navigation-menu` and every `menu` |

It has no styled component of its own. registry-ui reaches it through the components above.

## Tests

The stories cover Escape, a press outside and focus moving outside, each with its handler preventing it;
blocking the page from a render while open and stopping again; a child layer portalled out of its parent, with
either one blocking the page; a branch; a deferred press, with a right press, a control press, a stopped click, a
dismiss surface and a tap; the scrollbars of a box on either side and the page's own, styled to take room and as
the system draws them; a layer in an iframe; and a layer in a shadow root, with a branch, a deferred press, focus
moving within the shadow root and a scroll box. The end-to-end suite runs each in Chromium, Firefox and WebKit.
Headless Firefox draws its scrollbars over the box, taking no room, and takes no press on them, so its seven
scrollbar tests skip. Playwright can only tap, so a touch that turns into a scroll has unit tests alone.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 115 | `dismissable-layer.radix.test.tsx` 35, `dismissable-layer.test.tsx` 80 |
| End to end | 31 | `dismissable-layer.e2e.ts` 31 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>146 behaviours, one per test</summary>

**Unit, `dismissable-layer.test.tsx`**

- DismissableLayer
  - renders children
  - renders as a div
  - calls onEscapeKeyDown when Escape is pressed
  - calls onDismiss when Escape is pressed
  - forwards ref
  - does not call onDismiss on non-Escape keys
  - onEscapeKeyDown receives the keyboard event
  - passes className through
- DismissableLayer stack
  - dismisses only the highest layer on Escape
  - makes a layer the highest once the one under it is gone
  - finds the highest layer again on each Escape while the layers under it go
  - turns pointer events off on a modal layer while another opens over it, and back on once it closes
  - leaves a layer opened over a modal one pressable when it blocks nothing itself
  - blocks the page from the render that tells it to while open, and gives it back from the one that stops
  - leaves its pointer events to a style that sets them, and takes them back once the style drops them
- DismissableLayer branch
  - stays put when focus moves into one of its branches, and not elsewhere
- DismissableLayer and focus leaving it
  - dismisses once focus moves from inside it to an element outside
  - stays when onFocusOutside prevents the default
- DismissableLayer branch without a node
  - is no branch when its child never takes the ref, and the next focus outside still dismisses
- DismissableLayer in two documents
  - locks the body of each document holding a modal layer, and gives each its own back
  - hears a press outside only from its own document
  - leaves a layer pressable and hearing presses outside while a modal layer blocks only another document
  - leaves Escape to the highest layer only in the document it is pressed in
- DismissableLayer whose element changes
  - keeps the new element interactive over the page it locks, and gives the page back its own value
  - gives back the pointer events of an element whose style takes them over as undefined
  - gives an element the hook lets go of, and that stays, the pointer events it had
- DismissableLayer outside a deferred press
  - waits for the click after a touch even without deferPointerDownOutside
  - leaves the focus that moves during a deferred touch to the click that follows
  - dismisses at once on a right press, even when it defers
  - dismisses at once on a control press, even when it defers
  - listens to focus again once a stopped click has settled the press
  - does not dismiss from a click that lands after it unmounted
  - does not dismiss when it unmounts between the click and the dismissal
  - reads a press cancelled before its click as over, so the next press decides alone
  - waits for the click a tap sends a task after it lifts
  - keeps a press made before the last one was found clickless, and settles it on its own click
  - listens to focus again once the mouse lifts with no click to wait for
  - leaves a click with no press of its own, as Enter on a button sends, to the button
  - listens to focus again once a touch turns into a scroll, which sends no click
  - stays open when a modal layer opens over it between the press and its click
  - settles a stopped click on its own press, not on a press made before the stop is read
  - settles a tap on a click a browser holds back 350ms after the lift, waiting out a double tap
  - listens to focus again once a tap sends no click for a second after it lifts
  - closes on a mouse press on a surface that stops its click, as a dialog overlay may
- DismissableLayer and scrollbars outside it
  - stays open when a scrollbar outside it is pressed, and closes on the content beside it
  - finds the vertical scrollbar on the left of a right-to-left box
  - closes where a horizontal scrollbar would be on a box that only scrolls down
  - closes on the border of a box that does not scroll
  - closes on the border of a scrolling box whose content fits
  - closes on a touch where a scrollbar would be, since a touch scrolls without one
  - stays open when the press on a scrollbar outside it focuses that box, until the pointer lifts
  - closes when focus moves to anything but the box whose scrollbar was pressed
  - stays open when the page's own scrollbar is pressed
- DismissableLayer and scrollbars drawn over a box outside it
  - stays open on a press at the edge of a box whose scrollbars take no room, since a scrollbar sends no click
  - closes on the click that follows a press at that edge, which only a press on the box sends
  - finds that edge on the left of a right-to-left box
  - closes at once on a press away from that edge, or at the edge of a side that does not scroll
  - closes at once at the edge of a box whose content fits
  - closes at once on a press beside a scrollbar that takes room
  - closes at once on a right press at that edge, which sends no click to wait for
  - stays open on a press at the edge of a page whose scrollbars take no room, and closes on the page's content
  - finds the page's edge on the left of a right-to-left page, whatever the direction under the press
  - measures the page of the frame it is in, not the window around the frame
  - closes at once at the edge of a page that does not scroll, or whose scrollbars take room
- DismissableLayer closed by the press it hears
  - hears no more of a press outside once the layer under it has closed it
- DismissableLayer and the press around its mount
  - leaves alone the press that opened it, which reaches the document after it mounts
  - hears a press outside made after it mounted, without waiting for the task that mounted it to end
  - hears a press dispatched on the document itself as outside
- DismissableLayer and a press inside it
  - hears the next press outside after one inside stopped before reaching the document
  - reads a press inside as inside when its own pointer down capture prevents the default
- DismissableLayer inside a shadow root
  - stays open on a press or focus in a branch inside the shadow root
  - stays open on a press or focus in a shadow root a branch holds
  - closes once focus moves from inside it to an element outside it in the same shadow root
  - keeps hearing focus in the shadow root while another layer there stays open
  - stops hearing focus in the shadow root once its last layer there closes
  - hears focus moving into the shadow root once, though the shadow root and the document both hear it
  - hands a press outside the element pressed, not the shadow host, when deferring is false
  - hands a press outside the element pressed, not the shadow host, when deferring is true
  - closes on a press on a surface inside the shadow root, though the surface stops its click
  - closes on a press in a shadow root a surface holds, though the surface stops its click

**Unit, `dismissable-layer.radix.test.tsx`**

- DismissableLayer
  - dismisses on an outside pointer interaction
  - dismisses immediately on pointer down outside by default
  - does not dismiss on pointer down inside
  - does not dismiss when pointer down outside is prevented
  - does not dismiss when interact outside is prevented for a pointer down outside event
  - dismisses on focus outside
  - does not dismiss on focus inside
  - does not dismiss when interacting with a branch
  - defers touch pointer down outside dismissal until click
  - does not flush sync when a deferred outside click is dispatched from a passive effect
  - dismisses immediately on non-primary mouse pointer down outside
  - dismisses immediately on non-primary pen pointer down outside
  - cancels pending touch outside dismissal when pointer down moves back inside
  - treats a shadow tree inside the layer as inside
  - dismisses when a later outside interaction event is stopped by default
  - does not dismiss when a later outside interaction event is stopped and pointer down outside is deferred
  - dismisses when a registered dismiss surface stops propagation
  - dismisses when a registered dismiss surface stops propagation without deferring
  - only exempts registered dismiss surfaces from stopped propagation
  - gives a registered dismiss surface a click listener of its own until it unmounts so iOS Safari dispatches click for taps on it
  - does not dismiss when focus moves outside during a deferred stopped interaction
  - does not dismiss a deferred parent when a child layer dismisses first
  - does not dismiss a deferred modal parent when a nested layer is dismissed by an outside touch tap
  - keeps a stable composed ref (no infinite render loop)
  - calls the latest escape key handler after re-rendering
  - observes the latest state when preventing escape dismissal
  - leaves an escape key that belongs to an IME composition to the input method
  - leaves an escape key the IME processed (keyCode 229) to the input method
  - dismisses on the escape key that follows a finished composition
- DismissableLayer.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - merges its own `pointerEvents` into the consumer's `style`
  - has its pointer-events auto override in place in the commit that disables the body, before paint
- DismissableLayer.Branch
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**End to end, `dismissable-layer.e2e.ts`**

- DismissableLayer
  - stays open after the press that opened it, and closes on Escape
  - stays open on an Escape that onEscapeKeyDown prevents
  - closes on a press outside, which still reaches what it pressed
  - stays open on a press outside that onPointerDownOutside prevents
  - stays open while focus moves inside it, and closes once it moves outside
  - stays open on focus outside that onFocusOutside prevents
  - blocks the page once told to while open, and a press on the page closes it without reaching what it pressed
  - gives the page back once told to stop blocking it while open
- DismissableLayer nested
  - closes the child on Escape, then the parent
  - closes neither on a press in the child portalled out of the parent, and only the child on one in the parent
  - closes both on a press outside both, where focus stays put
  - keeps a child over a parent that blocks the page pressable
  - blocks the parent under a child that blocks the page, and a press outside closes only the child
- DismissableLayer branch
  - stays open on a press or focus in a branch, and closes on a press outside it
- DismissableLayer deferring a press outside
  - closes once the click lands, or on the press itself when it does not defer
  - closes on a right press or a control press without waiting, since neither sends a click
  - stays open when code outside stops the click, and closes when it does not defer
  - closes on a press on a surface, though the surface stops its click
  - waits for the click after a tap even when it does not defer, so that click lands on the surface and not behind it
- DismissableLayer and scrollbars outside it
  - stays open on a press on a scrollbar outside it, on either side of a box, and closes on the box beside it
  - stays open on a press on the page's own scrollbar
- DismissableLayer and scrollbars drawn over what is outside it
  - stays open on a press on a box scrollbar that takes no room, and closes on the box beside it
  - closes when focus leaves once the press on that scrollbar is over
  - stays open on Enter on a button inside it once the press on that scrollbar is over
  - stays open on a press on the page's own scrollbar when it takes no room
- DismissableLayer in an iframe
  - blocks only the frame, and hears presses and Escape only in the frame
- DismissableLayer in a shadow root
  - stays open on a press inside it, or a press or focus in its branch
  - closes once focus moves from inside it to an element outside it in the same shadow root
  - closes on a press outside, and names the element pressed
  - closes on a press outside once its click lands, and names the element pressed
  - stays open on a press on a scrollbar beside it

</details>
<!-- /behaviour -->

## Beyond Radix

Against Radix 1.1.19, the version `@radix-ui/react-dialog` 1.1.23 ships.

- A press outside counts from the moment the layer mounts. Radix starts listening a timer after the mount, which
  a busy page runs after the input queued behind it, so a quick press just after a menu opened did nothing. Until
  that timer runs, a press counts only when it is stamped later than the mount, which the press that opened the
  layer never is.
- A touch outside always waits for its click, so that click does not land on whatever the closing layer
  uncovered. With `deferPointerDownOutside`, a right or control press dismisses at once, since macOS sends no
  click for either. Radix waits for that click.
- A press on a scrollbar outside the layer scrolls without dismissing it, whether the scrollbar is the page's or
  a box's, on either side of a right-to-left box. The focus that press gives a focusable box does not dismiss it
  either. Radix dismisses on both.
- Inside a shadow root the layer reads each event's target from its composed path, and it listens for focus on
  the shadow root as well as the document, since focus moving between two elements of one shadow root never
  reaches the document. So a branch, a dismiss surface and a scroll box in the same shadow root work, focus
  leaving the layer for another element there dismisses it, and `onPointerDownOutside` and `onFocusOutside` hand
  over the element pressed or focused. Radix reads `event.target`, which a listener on the document sees as the
  shadow host, and listens only on the document.
- A modal layer in another document, such as an iframe's, locks that document's body, and each body gets its own
  value back when its last modal layer closes. Radix keeps one saved value for every document.
- An Escape while an input method is composing text is left to the input method.
- A dismiss surface listens for its own clicks, since iOS Safari sends no click for a tap on an element without
  a click listener.
- `useDismissableLayer` returns the layer's props and ref to spread onto an element of the caller's, so content
  built on a layer renders no `DismissableLayer` of its own. Radix's layer is always a component. The hook reads
  its element after each render of the component that calls it, so the ref goes on an element that component
  renders; content that attaches it later uses `DismissableLayer`.

## Fixed

- A press on a scrollbar macOS draws over the edge of a box or the page, taking no room, scrolls without
  dismissing the layer. Nothing on the event tells it from a press on the content under it, so a primary press
  within 17 pixels of that edge, on a box or page that scrolls that way, waits for its click, which only a press
  on the content sends. It dismissed the layer, as Radix's still does.
- A deferred mouse press that gets no click, such as one on a scrollbar drawn over a box, is let go once the
  mouse lifts. The layer kept waiting for that click, so focus leaving it did not dismiss it, and the next click,
  even Enter on a button inside the layer, dismissed it for that press.
- A touch outside that turns into a scroll is let go the same way, and so is a tap that sends no click within a
  second of lifting. Radix keeps waiting for its click, so Enter on a button inside its layer dismisses it.
- A modal layer in another document, such as an iframe's, no longer turns off the pointer events of a layer in
  this one or stops it hearing presses outside, as Radix's does.
- A press inside the layer that is stopped before it reaches the document no longer makes the layer miss the
  next press outside, and an `onPointerDownCapture` that prevents the default no longer makes a press inside read
  as outside. Radix's layer misses or dismisses on both.
- These fixes cost 380 bytes, and the module is 4,151 bytes gzipped against Radix's 3,785.

## Smaller and faster

- Every open layer sits in one stack, and a change to it writes each layer's `pointer-events` onto its element,
  so no layer holds state or rerenders when another opens or closes. Closing many layers at once no longer grows
  with the cube of their number.
- The stack compares each layer's `pointer-events` with what it last wrote, where it read every layer's style back
  on every change, and dispatches no event. Unmounting 100 open Tooltips or Popovers takes 0.79 of the time it
  did, about 0.45 ms less.
- The layers in a document share its listeners, where each layer added fifteen of its own.
- Unmounting 100 open overlays at once takes 0.60 of Radix's time for an Alert Dialog, 0.61 for a Dialog, 0.39
  for a Dropdown Menu, 0.38 for a Hover Card, 0.33 for a Tooltip and 0.49 for a Popover, and unmounting 100
  Navigation Menus takes 0.42.

## Breaking changes

- The document hears no `dismissableLayer.update` event when a layer opens, closes or changes. Nothing in the
  library listened for it; Radix's layers listen for it to render again, and these never do.
- A layer whose element never takes its ref, which `asChild` asks of its child, joins no stack, so nothing
  dismisses it. It used to dismiss on presses and focus outside it and on Escape.
