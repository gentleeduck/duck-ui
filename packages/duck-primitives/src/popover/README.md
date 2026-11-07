# Popover

Anchored content opened from a trigger, modal or not.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/popover` |
| API docs | [`duck-primitives/api/popover.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/popover.mdx) |
| Styled component | [`registry-ui/src/popover`](../../../registry-ui/src/popover) |
| Styled docs | [`duck-ui/components/popover.mdx`](../../../../apps/duck/content/docs/duck-ui/components/popover.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 5. Faster in all 22 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI |
|---|--:|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 24,338 | 24,345 (1.00x) | 41,743 (0.58x) | 32,305 (0.75x) | 32,424 (0.75x) | 30,888 (0.79x) |
| Mount x100, ms | 2.64 | 2.95 (0.90x) | 7.09 (0.37x) | 5.64 (0.47x) | 6.43 (0.41x) | 17.3 (0.15x) |
| Unmount x100, ms | 0.486 | 0.546 (0.89x) | 1.13 (0.43x) | 0.831 (0.58x) | 0.825 (0.59x) | 2.39 (0.20x) |
| Unmount open x100, ms | 1.80 | 3.88 (0.46x) | 6.33 (0.28x) | 4.65 (0.39x) | 762 (0.00x) | - |
| Open, ms | 1.44 | 1.66 (0.87x) | 3.25 (0.44x) | 2.20 (0.65x) | 2.54 (0.57x) | - |
| Close, ms | 0.802 | 0.806 (1.00x) | 1.72 (0.47x) | 1.06 (0.76x) | 1.15 (0.70x) | - |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 1.1.23, Base UI 1.0.0-rc.0, React Aria 1.22.1, Ark UI 5.40.0 and Headless UI 2.2.10.

Headless UI has no controlled open state, so its copies are timed mounting and unmounting closed, and no more.
<!-- /benchmarks -->

## Tests

The stories cover a popover opened from its trigger or from outside, modal or not, right to left, measured from a
custom anchor, focusing the field it is given and leaving focus alone on close; an animated one, and one kept
mounted while closed; each side and alignment, left to right and right to left; one popover inside another, modal
or not; parts given through `asChild`; one in a scrolling box that hides while its trigger is scrolled out; one
inside a dialog, modal or not; and one under an overlay a browser extension draws. The end-to-end suite runs each
in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 90 | `popover.radix.test.tsx` 28, `popover.test.tsx` 62 |
| End to end | 28 | `popover.e2e.ts` 25, `popover.radix.e2e.ts` 3 |
| registry-ui | 8 | `popover-force-mount.test.tsx` 1, `popover.test.tsx` 7 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>118 behaviours, one per test</summary>

**Unit, `popover.test.tsx`**

- Popover
  - renders trigger with data-slot="popover-trigger"
  - trigger has aria-haspopup="dialog"
  - trigger has aria-expanded=false when closed
  - trigger toggles aria-expanded on click
  - calls onOpenChange on trigger click
  - trigger has type="button"
  - forwards ref to trigger
  - toggles closed on second click
  - puts a dir given to the root on the content and leaves the trigger to the page
  - gives portaled content the direction of &lt;html dir&gt; when nothing else sets one
  - passes className to trigger
- PopoverClose
  - renders with data-slot="popover-close"
  - close button has type="button"
  - close button forwards ref
  - portaled content inherits dir from DirectionProvider
- Popover parts
  - renders its arrow inside open content
  - names the popper's measurements under the popover's own variables, beside the style it was given
  - marks each part with its own data-slot
  - puts focus guards at the edges of the page while open
  - hands Escape to onEscapeKeyDown, which can keep it open
  - keeps every element of a collision boundary list that exists
- Popover modal focus on close
  - returns focus to the trigger after a primary click outside
  - leaves focus alone after a right click or a control click outside
  - leaves focus alone after a right click outside, though the trigger had it before opening
  - hands a focus and a press outside to the handlers it was given
  - returns focus to the trigger on Escape after a right click outside that was kept from closing it
  - returns focus to the trigger after a pointer down a script dispatched with no button
- Popover non-modal outside interaction
  - stays open when other code stops the click that follows a press outside
  - closes from a press on its trigger rather than closing and opening again
  - stays open when focus moves back to its trigger
  - returns focus to the trigger when it closes with no press outside
  - returns focus to the trigger on Escape after a press outside that was kept from closing it
  - closes when focus moves outside with no press
  - closes when focus moves outside once reopened after a press outside closed it
  - leaves focus where the user clicked
  - ignores the focus that follows a click outside while the content is still mounted
- Popover anchor
  - measures from a PopoverAnchor rather than from its trigger
- Popover anchor removed
  - measures from its trigger again once the PopoverAnchor unmounts
- PopoverPortal
  - renders into the container it is given
  - keeps a content kept mounted out of the page while the portal is closed
- Popover modal overrides
  - leaves the page scrolling when lockScroll is false
  - lets a pinch zoom through its scroll lock
  - keeps focus inside
  - lets focus leave when trapFocus is false
  - leaves pointer events on outside when disableOutsidePointerEvents is false
- Popover closing
  - closes from a close button inside it
  - keeps a modal popover open when focus is reported outside it while trapped
- Popover title and description
  - lets an aria-labelledby or aria-describedby on the content win over the parts
  - points at the id a title or description was given
  - stops pointing at a title or description once it unmounts
- Popover modal content ref
  - attaches a ref callback once across renders
- Popover non-modal content props
  - keeps the modal-only lockScroll off the element
- Popover inside a scroll lock
  - scrolls when it is portalled out of a modal dialog
  - lets a popover portalled out of a modal one scroll, and nothing else
- Popover modal focus trap
  - lets focus into a branch portalled out of it
- Popover kept mounted
  - hides the page from a screen reader only while a modal one is open
- Popover giving the page back on close
  - removes a modal content before it gives the page back its pointer events
- Popover focus targets
  - focuses the element initialFocus names on open rather than the first one
  - leaves focus on the trigger when initialFocus is false
  - focuses the element finalFocus names on close rather than the trigger
  - moves focus nowhere on close when finalFocus is false
  - lets an auto focus handler that prevents the default win over the targets

**Unit, `popover.radix.test.tsx`**

- aria-controls
  - should not reference a non-existent element while closed
  - should reference the rendered content while open
  - should not reference the content before it is open
  - should reference the content when it is open
  - should stop referencing the content once it closes
- Title and Description
  - should not reference a title or description when none are rendered
  - should label the content via aria-labelledby when a Title is rendered
  - should describe the content via aria-describedby when a Description is rendered
  - should reference both Title and Description when rendered together
- given a Popover with `asChild` on the Content
  - forwards content props and the ref to the child (modal: true)
  - forwards content props and the ref to the child (modal: false)
- Popover.Anchor
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Popover.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Popover.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - spreads props it does not consume onto the element it renders on a modal popover
  - forwards props to the child element when `asChild` is set on a modal popover
- Popover.Title
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Popover.Description
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Popover.Close
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Popover.Arrow
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- handlers with a narrower parameter type than the prop
  - accepts an `onOpenChange` handler typed with a narrower parameter

**End to end, `popover.e2e.ts`**

- Popover
  - opens a dialog named by its title and described by its description, focusing the first field
  - closes on Escape and on its close button, handing focus back to the trigger
  - opens from controlled state
  - without modal, lets an outside click reach the page and closes
  - modal, holds focus inside, hides the page from a screen reader and swallows an outside click
  - focuses the field it is given on open, and leaves focus alone on close when told to
  - sits beside a custom anchor instead of the trigger, on the side asked, the arrow past its offset
  - writes its direction on the content
  - kept mounted, stays in the page while closed, marked closed
- Popover animated
  - stays in the page until its exit animation ends, then hands focus back
  - leaves focus where the user clicked once its exit animation ends
  - hands focus back to the trigger after a keyboard reopens it during its exit animation
  - stays in the page while closed when kept mounted
- Popover placement
  - opens on the top of its trigger
  - opens on the right of its trigger
  - opens on the bottom of its trigger
  - opens on the left of its trigger
  - lines its start up with the start of the trigger, the right edge right to left
  - opens on the right for the left side, right to left
- Popover nested
  - takes focus into the inner one and closes one layer per Escape
  - closes on a press on the outer one, which stays open
- Popover nested, modal
  - takes focus into the inner one and closes one layer per Escape
  - closes on a press on the outer one, which stays open and never sees the press
- Popover with asChild
  - puts the trigger and the content on the elements given to it
- Popover in a scrolling box
  - hides while its trigger is scrolled out of the box, and shows again when it is back

**End to end, `popover.radix.e2e.ts`**

- Popover
  - keeps the popover open when an external overlay stops later mouse events
- non-modal popover nested in dialog
  - dismisses both the popover and the dialog when clicking outside both layers
- modal popover nested in dialog
  - dismisses only the popover when clicking outside the popover

</details>
<!-- /behaviour -->

## Beyond Radix

- `Popover.Content` takes `initialFocus` and `finalFocus`, as in Base UI and Ark: the element to focus on
  open and on close, or `false` to leave focus where it is. A handler that prevents the default still wins.
- `Popover.Title` and `Popover.Description` name and describe the content through `aria-labelledby` and
  `aria-describedby`; one passed to the content wins.
- While open, the trigger carries `data-popper-side` and `data-popper-align` with where the content was
  placed after any flip.
- With `hideWhenDetached`, content hides once its anchor scrolls out of a scrolling box, not only the
  viewport.

## Fixed

- Passes every Radix popover and popper test.
- The trigger sets `aria-controls` only while open.
- A non-modal popover no longer hands `lockScroll` to its element, where React warned about an unknown
  prop.
- Inside a modal `Dialog` but portalled out of it, the content registers with the dialog, so focus can
  move into it and it scrolls under the dialog's scroll lock. A modal popover does the same for a layer
  portalled out of it.
- A press outside dismisses once its click lands, as on a `Dialog`.
- A press on a scrollbar outside no longer dismisses it.
- A right click outside that was kept from closing a modal popover no longer stops a later close from handing focus
  back to the trigger.
- A modal popover kept mounted hides the rest of the page from screen readers only while it is open.
- A non-modal popover kept mounted and closed by a press outside closes again when focus moves outside it after it
  reopens. The press was remembered until the content unmounted, which kept content never does.

## Smaller and faster

- The root no longer resolves its direction, which the content does: a closed popover mounts in 0.91 of
  Radix's time.
- Layers hold no state and share one listener per event type, so unmounting 100 open popovers takes 0.49 of
  Radix's time.
- A modal popover's content keeps one composed ref across renders.

## Breaking changes

- `Popover.Trigger` and `Popover.Close` carry no `dir` attribute. A `dir` passed to the root lands on the
  content. The context's `dir` is the prop as passed, `undefined` when none was.

## registry-ui

- `PopoverTitle` and `PopoverDescription`, styled as the heading and muted paragraph the examples drew by
  hand.
- `MotionPopoverContent` defines `--popover-border-color`, so a `PopoverArrow` draws its outline.
  `PopoverContent` sets the variable with a class, so a class can change it.
- `PopoverArrow` passes `className` and `style` straight through, and the content stops setting the
  default `align`.
- A new example focuses a note field on open with `initialFocus`.

## Later

- Base UI's `openOnHover`, `onOpenChangeComplete` and `Backdrop`.
- Kept mounted, a popover hands focus back to its trigger only when its content unmounts, as in Radix, so content
  hidden by CSS on close keeps focus inside it. The fix belongs in `FocusScope`, which every layer shares.
