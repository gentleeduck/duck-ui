# Tooltip

A hover and focus label for a trigger.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/tooltip` |
| API docs | [`duck-primitives/api/tooltip.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/tooltip.mdx) |
| Styled component | [`registry-ui/src/tooltip`](../../../registry-ui/src/tooltip) |
| Styled docs | [`duck-ui/components/tooltip.mdx`](../../../../apps/duck/content/docs/duck-ui/components/tooltip.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 4. Faster in 19 of 20 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI |
|---|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 19,232 | 19,402 (0.99x) | 33,094 (0.58x) | 19,867 (0.97x) | 23,181 (0.83x) |
| Mount x100, ms | 3.04 | 3.72 (0.82x) | 6.42 (0.47x) | 5.61 (0.54x) | 4.19 (0.73x) |
| Unmount x100, ms | 0.649 | 0.774 (0.84x) | 1.27 (0.51x) | 0.849 (0.76x) | 0.760 (0.85x) |
| Unmount open x100, ms | 1.48 | 4.51 (0.33x) | 3.17 (0.47x) | **1.29 (1.15x)** | 1.66 (0.89x) |
| Open, ms | 1.05 | 1.40 (0.75x) | 2.02 (0.52x) | 1.11 (0.94x) | 1.87 (0.56x) |
| Close, ms | 0.501 | 0.567 (0.88x) | 0.966 (0.52x) | 0.588 (0.85x) | 0.788 (0.64x) |

Where gentleduck is behind:

- Unmount open x100 against React Aria: 1.15x, 0.196 ms more.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 1.2.16, Base UI 1.0.0-rc.0, React Aria 1.22.1 and Ark UI 5.40.0.
<!-- /benchmarks -->

## Tests

The stories cover hover and focus opening, moving between triggers in one provider, the grace area, content that is
not hoverable, `closeDelay`, `disableCloseOnClick`, `disabled`, a controlled tooltip whose owner can refuse to close,
a `Toggle` as the trigger, and a dialog's trigger, closed once with the pointer and once with Escape. The end-to-end suite drives each in Chromium, Firefox and WebKit, with the pointer
moving in steps as a real one does, and once in a single jump, which the grace area has to act on in that one move.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 106 | `tooltip-libs.test.ts` 7, `tooltip.radix.test.tsx` 19, `tooltip.test.tsx` 80 |
| End to end | 12 | `tooltip.e2e.ts` 12 |
| registry-ui | 7 | `tooltip-force-mount.test.tsx` 1, `tooltip.test.tsx` 6 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>118 behaviours, one per test</summary>

**Unit, `tooltip.radix.test.tsx`**

- Tooltip rendering
  - renders tooltip trigger
  - renders tooltip content when trigger is hovered
  - appends the tooltip id to an existing aria-describedby
  - normalizes and deduplicates aria-describedby ids when the tooltip opens
  - appends the tooltip id to aria-describedby on an asChild trigger
  - does not duplicate content children
  - uses aria-label without duplicating content children
  - keeps aria-describedby in sync with a custom content id
  - keeps a custom id unique when combined with aria-label
  - renders tooltip content is dismissed when trigger is clicked
- Tooltip behavior
  - hovering one tooltip does not re-render sibling tooltips
  - skips the delay when moving between triggers within skipDelayDuration
  - does not skip the delay when skipDelayDuration is 0
- Tooltip.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Tooltip.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Tooltip.Arrow
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `tooltip-libs.test.ts`**

- tooltip geometry
  - names the edge of a box nearest a point
  - refuses a point with no position
  - pads an exit point back inside the edge it left by
  - lists the corners of a box clockwise from the top left
  - lists the convex hull in order from its top-left corner, dropping the points inside
  - finds the hull of points stacked in a column, whatever order they come in
  - keeps one point once however often it repeats

**Unit, `tooltip.test.tsx`**

- Tooltip
  - renders trigger with data-slot="tooltip-trigger"
  - trigger has data-state="closed" when closed
  - trigger does not have aria-describedby when closed
  - closes on blur
  - respects open prop (controlled)
  - trigger with disableCloseOnClick uses data-tooltip-state instead of data-slot="tooltip-trigger"
  - leaves an asChild child's own data-state and data-slot alone under disableCloseOnClick
  - names the popper's measurements under the tooltip's own variables, beside the style it was given
  - keeps the click handler it was given, and stays open on a click when told to
  - TooltipProvider renders children
  - trigger renders as a button
  - trigger passes className
  - multiple tooltips can coexist
  - a press on a trigger with disableCloseOnClick keeps it open, pointer down and up included
  - a press on a trigger without disableCloseOnClick closes it once
  - opened with no trigger mounted, it still closes on a press outside
  - trigger without disableCloseOnClick closes on click
  - portaled content inherits dir from DirectionProvider
  - puts a dir given to the root on the content and leaves the trigger to the page
  - gives the content the direction of &lt;html dir&gt; when nothing else sets one
  - scrolls when it is portalled out of a modal dialog
- Tooltip grace area
  - stays open while the pointer crosses the gap from the trigger to the content
  - closes once the pointer strays outside the area between the trigger and the content
  - drops the grace area once the pointer reaches the content
  - closes a tooltip a hover opened once the pointer strays outside the area
  - closes on the move that takes the pointer off the trigger and out of the area at once
  - opens the next trigger in the provider on the move that reaches it
  - builds a grace area back to the trigger when the pointer leaves the content
  - drops the grace area once the pointer comes back onto the trigger
  - keeps one grace area when the pointer leaves the trigger twice
  - leaves a trigger the pointer crosses on its way to the content closed
  - ends the crossing when the content closes under it, so the next trigger opens
  - starts no crossing from its trigger once its content has closed
  - starts no crossing from its content once its trigger is gone
- Tooltip trigger
  - closes when the trigger is clicked down on while open
  - opens for a mouse moving over it and not for a finger
  - closes when another tooltip opens
  - opens on keyboard focus
  - closes on leaving the trigger when the content is not hoverable
  - cancels a pending delayed open when the pointer leaves first
  - cancels a pending delayed open when the tooltip unmounts
  - does not open on hover or focus while disabled
  - closes once it is disabled while open
  - stays closed while disabled, though its parent holds it open
  - opens for the next move over its trigger once it is enabled again
  - drops a delayed open that was pending when it was disabled
  - closes when an ancestor of the trigger scrolls
- Tooltip close delay
  - waits the close delay before closing when the pointer leaves a trigger whose content is not hoverable
  - stays open when the pointer comes back to the trigger within the close delay
  - drops a pending open when the pointer leaves before it, whatever the close delay
  - waits the close delay once the pointer strays outside the grace area
  - stays open when the pointer reaches the content within the close delay
  - closes at once on a press, whatever the close delay
  - drops a pending close when the tooltip unmounts
  - takes the close delay from its provider, and its own over the provider's
- Tooltip focus after a press
  - opens on no focus a press gives its text field trigger, and on a later focus no input led to
  - stays open when focus moves outside its content
  - stays open when something that does not hold its trigger scrolls
  - hears a press whose propagation something stopped
  - hears a press in the document its trigger is in, an iframe included
- Tooltip delays
  - waits 700ms before opening by default
  - takes its own delay over the provider's
  - opens at once within the skip delay after it closes, and waits again once that has passed
  - waits again once the skip delay is turned off while a tooltip is open
  - keeps skipping the delay while a tooltip it opened at once is showing
  - counts the skip delay from the last tooltip to close
  - stays closed after a click until the pointer leaves the trigger and comes back
  - stays open when the pointer comes back within the close delay and the open waits again
  - closes after its close delay with the pointer on content that is not hoverable
  - stays open each time it opens with an id given to its content
  - names the id a content given through asChild keeps for its own
  - stops hearing scrolls once it closes, so a scroll leaves the next delayed open alone
- Tooltip parts
  - runs the trigger's own pointer, focus and blur handlers
  - runs the content's own pointer enter, outside press and escape handlers
  - lets props given to the trigger and the content override their own attributes
  - places its content above the trigger by default
  - portals its content into the container it is given
  - keeps closed content in the page under its own forceMount or its portal's
  - marks its arrow
- Tooltip scope
  - hands its parts the scope it is given

**End to end, `tooltip.e2e.ts`**

- Tooltip
  - a hover opens it after the delay, the trigger names it, and the pointer leaving closes it
  - keyboard focus opens it at once, and Escape closes it with focus left on the trigger
  - moving to another trigger in the provider soon after opens the next one at once
  - a pointer that jumps off the trigger closes it, or opens the next trigger it lands on, in that one move
  - the pointer can cross onto the content and stay, unless the content is not hoverable
  - closeDelay keeps it open a while after the pointer leaves
  - pressing the trigger closes it, unless disableCloseOnClick
  - on a toggle under disableCloseOnClick, a press toggles it and leaves its on state and the tooltip showing
  - disabled, it never opens, and turning it off closes an open one
  - controlled, it asks its owner on every dismissal and stays as the owner says
- Tooltip on a dialog trigger
  - stays closed when the dialog closed with the pointer gives focus back to the trigger
  - opens when Escape closes the dialog and gives focus back to the trigger

</details>
<!-- /behaviour -->

## Beyond Radix

- `closeDelay` on `Tooltip` and `Tooltip.Provider`, as in Base UI, Ark and React Aria: how long the
  tooltip stays open after the pointer leaves. A press, a blur, Escape, a scroll or another tooltip still
  closes it at once. It defaults to `0`.
- `disabled` keeps the tooltip closed, even while a parent holds `open`, closes it if open, and drops a pending
  delayed open. A hover over the trigger while disabled leaves the next one free to open it.

## Fixed

- Passes every Radix tooltip test.
- The content renders its children once and is itself the `role="tooltip"` element the trigger's
  `aria-describedby` names, so an `id` given to the content, or kept by a child given through `asChild`, is the
  one the trigger names. Only an `aria-label` renders a visually hidden element.
- While open, the trigger joins its own `aria-describedby` with the content's id.
- `skipDelayDuration={0}` keeps the delay on every tooltip, where the next one opened at once. So does a
  `skipDelayDuration` turned to `0` while a tooltip is open, where every tooltip after it opened at once.
- Inside a modal `Dialog` but portalled out of it, the content scrolls under the dialog's scroll lock.
- A tooltip a hover opened closes once the pointer leaves the trigger and the way to the content. The content read
  its own element in render, which is null in the commit that mounts it, so it never listened for the pointer
  leaving and stayed open until another tooltip or a press closed it.
- `disableCloseOnClick` keeps the tooltip open on a press. The content took a press on the trigger for one outside
  it and closed anyway; the trigger alone now decides.
- `disableCloseOnClick` leaves an `asChild` child's own `data-state` and `data-slot`, where it passed `undefined`
  for both and wiped a `Toggle`'s `on` and `off`.
- The tooltip opens on focus only when the last input was not a pointer press and the trigger matches
  `:focus-visible`. A menu item chosen with the pointer hands focus back focus-visible, and a dialog closed with
  the pointer hands it back after a press on its own button, so each check catches what the other lets through.
  Escape, Tab and a focus no input led to, such as a screen reader moving it, still open it.

## Smaller and faster

- The root no longer resolves its direction, which the content does.
- The provider drops an unmount effect that cleared the timer id it read at mount, which was never a timer.
- Content mounts in the commit that opens the tooltip, rather than two commits later. The `tooltip.open` event
  names the opening tooltip's content id as its `detail`, so that content does not close on its own announcement.
- Layers hold no state and share one listener per event type, so unmounting 100 open tooltips takes 0.33 of
  Radix's time.
- Content that stays open under the pointer is no separate component: the grace area is a hook the content
  calls. The root hands the trigger to the popper as its anchor, where the trigger rendered `Popper.Anchor`.
- The content follows no scroll, since a scroll that moves its trigger closes it, so an open tooltip adds no
  scroll listeners.
- Every open tooltip shares one listener for another tooltip opening and one for scrolls, where each added its
  own to the document and the window. The grace area starts from the trigger's and the content's
  `onPointerLeave`, which React hears through one listener on its root, where it added a native listener to each.

## Breaking changes

- `Tooltip.Trigger` carries no `dir` attribute; a `dir` passed to the root lands on the content.
- The content's children are no longer rendered a second time inside a visually hidden element.
- `ITooltip.IContentHoverableProps` is gone.

## registry-ui

- `MotionTooltipContent` draws the same surface as `TooltipContent` and defines `--tooltip-border-color`,
  so a `TooltipArrow` shows, where `overflow-hidden` clipped it.
- `TooltipContent` sets the variable with a class.
- A new example gives a toolbar's tooltips a `closeDelay`.
- New examples place a tooltip on each side, turn a copy button's tooltip to Copied, explain an `aria-disabled`
  Publish button until it is available, and announce a shortcut through `aria-label`. The second motion example,
  a copy of the first, opens on the right with an arrow.

## Later

- Base UI's `trackCursorAxis` and `onOpenChangeComplete`.
