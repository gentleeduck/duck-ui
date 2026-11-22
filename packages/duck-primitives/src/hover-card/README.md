# Hover Card

A preview card for a link, opened by hover or keyboard focus.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/hover-card` |
| API docs | [`duck-primitives/api/hover-card.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/hover-card.mdx) |
| Styled component | [`registry-ui/src/hover-card`](../../../registry-ui/src/hover-card) |
| Styled docs | [`duck-ui/components/hover-card.mdx`](../../../../apps/duck/content/docs/duck-ui/components/hover-card.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 4. Faster in all 20 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI |
|---|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 17,747 | 17,770 (1.00x) | 27,024 (0.66x) | 32,258 (0.55x) | 24,964 (0.71x) |
| Mount x100, ms | 2.65 | 3.02 (0.88x) | 6.99 (0.38x) | 6.91 (0.38x) | 4.71 (0.56x) |
| Unmount x100, ms | 0.511 | 0.671 (0.76x) | 0.793 (0.64x) | 1.07 (0.48x) | 0.800 (0.64x) |
| Unmount open x100, ms | 1.51 | 3.70 (0.41x) | 1.86 (0.81x) | 3.25 (0.47x) | 768 (0.00x) |
| Open, ms | 1.18 | 1.46 (0.81x) | 2.02 (0.58x) | 1.69 (0.70x) | 2.09 (0.56x) |
| Close, ms | 0.530 | 0.653 (0.81x) | 0.929 (0.57x) | 0.780 (0.68x) | 0.944 (0.56x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 1.1.23, Base UI 1.0.0-rc.0, React Aria 1.22.1 and Ark UI 5.40.0.

React Aria's hover card is its PreviewTrigger.
<!-- /benchmarks -->

## Tests

The stories cover a card's delays; one controlled and one disabled; a list of triggers; a card holding text to
select; content that loads after it opens; an animated card, and one kept mounted while closed; content given
through `asChild`; each side, left to right and right to left; and a card in an iframe and one in a shadow root.
The end-to-end suite runs each in Chromium, Firefox and WebKit, with a tap on a touch screen.

Each test written for this module was proven by changing the code and watching a test fail. The suites taken from
Ark UI and Base UI run that library's own cases against this code. Each file's header names its source and every
case left out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 76 | `hover-card.ark.test.tsx` 4, `hover-card.base-ui.test.tsx` 7, `hover-card.radix.test.tsx` 10, `hover-card.test.tsx` 55 |
| End to end | 30 | `hover-card.e2e.ts` 30 |
| registry-ui | 10 | `hover-card-force-mount.test.tsx` 1, `hover-card.test.tsx` 9 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>106 behaviours, one per test</summary>

**Unit, `hover-card.ark.test.tsx`**

- Ark UI hover card
  - has no axe violations
  - opens on hover, mounting its content only then, and closes once the pointer leaves
  - tells onOpenChange as it opens
  - starts open with defaultOpen

**Unit, `hover-card.base-ui.test.tsx`**

- Base UI preview card
  - opens on hover and closes once the pointer leaves
  - opens on focus and closes on blur
  - tells onOpenChange each change, and nothing again when the trigger is hovered again while open
  - closes once the pointer leaves the trigger after opening by default
  - opens after its open delay, and closes after its close delay
  - closes on Escape, and opens again on the next hover
  - stays closed as focus comes back to its trigger with the window, once Escape closed it

**Unit, `hover-card.radix.test.tsx`**

- HoverCard
  - does not open when leaving the trigger before the open delay elapses
  - opens after the open delay when the trigger stays hovered
  - closes after the close delay when leaving an open trigger
  - does not leave a card open when sweeping across a list of triggers
- HoverCard.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- HoverCard.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- HoverCard.Arrow
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `hover-card.test.tsx`**

- HoverCard
  - renders trigger with data-slot="hover-card-trigger"
  - trigger renders as an anchor element
  - trigger has data-state="closed" initially
  - respects controlled open prop
  - forwards ref to trigger
  - trigger has href attribute
  - passes className to trigger
  - puts a dir given to the root on the content and leaves the trigger to the page
  - gives the content the direction of &lt;html dir&gt; when nothing else sets one
  - open=false shows data-state closed
  - portaled content inherits dir from DirectionProvider
  - an explicit dir on content overrides the inherited one
- HoverCard delays
  - opens 700ms after the pointer rests on the trigger, and closes 300ms after it leaves, by default
  - stays open when the pointer comes back before the close delay ends
  - opens nothing once the pointer leaves, though focus asked it to open as well
  - stays open when the pointer comes back, though a blur asked it to close as well
  - drops a pending open when it unmounts
  - drops a pending close when it unmounts
- HoverCard disabled
  - does not open on hover or focus while disabled
  - closes once it is disabled while open
  - stays closed while disabled, though its parent holds it open
  - drops a pending open when it is disabled
- HoverCard focus and touch
  - opens when the trigger takes keyboard focus
  - closes when the trigger loses focus
  - opens when a mouse press focuses the trigger
  - does not open for the focus a touch gives the trigger
  - opens for the next keyboard focus after a touch
  - opens for keyboard focus after a touch that scrolled the page instead
  - ignores a touch pointer entering the trigger or leaving the card
  - calls its own pointer enter and focus handlers first, and opens for neither when they prevent the default
  - leaves a touch start to the browser, so a page still scrolls from the trigger
- HoverCard content
  - names the popper's measurements under the hover card's own variables, beside the style it was given
  - takes what is tabbable in it out of the tab order, and nothing else
  - takes what is added to it after it opens out of the tab order too
  - takes an element back out of the tab order when it is given a tab index after it opens
  - leaves the page under it taking the pointer while it is open
  - calls its own pointer down and Escape handlers first, and does neither part when they prevent the default
  - marks its arrow with data-slot="hover-card-arrow"
  - stays open when focus moves outside it
- HoverCard text selection
  - confines text selection to the card while the pointer is down on it
  - stays open while the pointer that pressed on it is down
  - stays open after the pointer leaves once text inside it is selected
  - stays open when the pointer leaves as soon as a press that selected text ends
  - gives the page its text selection back, and closes as the pointer leaves, after a press the browser cancels
  - closes as the pointer leaves after a press that clears the text selected in it
  - closes when the pointer leaves after a press that selected nothing
- HoverCard opened again
  - closes as the pointer leaves, after it closed while the pointer was down on it
  - closes as the pointer leaves, after it closed with text in it selected
  - closes as the pointer leaves, after it closed with text in it selected while kept mounted
- HoverCard text selection beyond the card element
  - gives the page its text selection back after a press on content it holds no element of
  - leaves the page selectable for a press in a portal opened from inside the card
- HoverCard in an iframe
  - keeps a press on it from making the frame's page unselectable, and leaves the page outside the frame alone
  - closes as the pointer leaves after a press on it ends in the frame
  - stays open after the pointer leaves once text inside it is selected in the frame's document
- HoverCard dismissing
  - closes on Escape

**End to end, `hover-card.e2e.ts`**

- HoverCard delays
  - waits openDelay before opening on hover, and closeDelay before closing once the pointer leaves
  - stays open while the pointer moves about on its trigger
  - keeps the same card open while the pointer moves from the trigger onto it
  - opens on focus, closes on Escape, and closes once focus leaves
- HoverCard controlled and disabled
  - opens from its owner, and closes on Escape through onOpenChange
  - closes once it is disabled while open, and stays shut on hover and focus while disabled
- HoverCard by touch
  - never shows the card for a tap on the trigger, even for a moment
- HoverCard in a list
  - opens nothing for a pointer that sweeps across the triggers
  - hands the open card to the next trigger the pointer rests on
- HoverCard holding selected text
  - stays open once the pointer leaves after text in it is selected, until a press outside
  - keeps a drag that starts in the card from selecting the page
  - closes once the pointer leaves after a click that clears the text selected in it
  - closes as the pointer leaves the next time it opens, after it closed with text in it selected
  - closes once the pointer leaves after a press that selected nothing
- HoverCard whose content arrives late
  - takes what arrives in it after it opens out of the tab order too
- HoverCard animated
  - stays in the page until its exit animation ends
  - stays in the page while closed when kept mounted
- HoverCard with asChild
  - puts the trigger and the content on the elements given to it
- HoverCard placement
  - opens on the top of its trigger
  - opens on the right of its trigger
  - opens on the bottom of its trigger
  - opens on the left of its trigger
  - puts the direction it is given on the card and not on the trigger
- HoverCard in an iframe
  - closes once the pointer leaves after a press on it
  - stays open once the pointer leaves after text in it is selected
  - keeps a drag that starts in the card from selecting the text beside it
- HoverCard in a shadow root
  - closes once the pointer leaves after a press on it
  - stays open once the pointer leaves after text in it is selected
  - keeps a drag that starts in the card from selecting the text beside it
- HoverCard in an iframe, beside the page
  - leaves the page selectable after a press on it

</details>
<!-- /behaviour -->

## Beyond Radix

- `disabled`, as in Ark, keeps the card closed, even while a parent holds `open`, closes it if open, and drops an
  open still waiting on `openDelay`.

## Fixed

- Passes every Radix hover-card test.
- A pointer that leaves the trigger before the open delay ends, or sweeps across a list of triggers,
  opens nothing, though a press focused the trigger on the way. A second open or close scheduled over a pending
  one replaces it, where Radix lost the first timer, so the card opened after the pointer left or closed under it.
- Content kept mounted with `forceMount` forgets a press and a selection at each close, so it closes for the
  pointer leaving once it opens again. Radix forgets them only when the content unmounts.
- A touch no longer opens the card through the focus a tap gives the link. Radix tried to stop it by
  cancelling the touch start, which React makes passive, so it only logged a warning. The trigger leaves
  the touch start alone, so the page still scrolls from it.
- The content takes a focusable SVG element out of the tab order, as it does an HTML one.
- A press on content given through `asChild` to a component that drops its ref gives the page its text
  selection back on release, where the page stayed unselectable.
- Content portalled into an iframe follows a press on it, and the text it selects, in the iframe's document.
  Radix listens on the page's document, which hears nothing of a release in the frame, so after one press the
  card never closed again, and it made the page's body unselectable in place of the frame's.
- What renders into the content after it opens, such as a profile that loads, leaves the tab order too, and so
  does an element given a tab index later. Radix sweeps only when the content itself renders.
- The card decides whether to close when the close delay ends, so a pointer leaving straight after a press that
  selected text keeps it open. Radix decides as the pointer leaves, before the press's selection is read.
- A press the browser cancels, as when a touch turns into a scroll, gives the page its selection back and lets
  the card close. Radix waits only for a `pointerup`.
- Focus coming back with the window to the trigger it left from leaves the card shut, where it opened it again,
  so a card closed with Escape came back each time the window did.

## Smaller and faster

- The root no longer resolves its direction, which the content does.
- Layers hold no state and share one listener per event type, so unmounting 100 open cards takes 0.38 of
  Radix's time.

## Breaking changes

- The trigger no longer calls `preventDefault` on `touchstart`.
- `HoverCard.Trigger` carries no `dir` attribute. The context's `dir` is the prop as passed, and its
  unused `onOpenChange` is gone.
- registry-ui: pass `openDelay` where you passed `delayDuration`, and `side` on `HoverCardContent` where
  you passed `placement`.

## registry-ui

- `HoverCard` is the primitive's root itself, without the dead `delayDuration`, `skipDelayDuration`,
  `placement` and an unattached `ref`.
- `MotionHoverCard` passes `open` and `defaultOpen` on, so a controlled or default-open card shows.
- `MotionHoverCardContent` draws the same surface as `HoverCardContent` and defines
  `--hover-card-border-color`, so a `HoverCardArrow` shows.
- A new example turns link previews off with `disabled`.
- A new example loads a profile once the card opens, its button kept out of the tab order with the rest of the
  card.
- `HoverCardPlacementContext` holds a side, never `undefined`, so `MotionHoverCardContent` falls back to the root's
  `placement` and no further (breaking for a provider written by hand with `undefined`).

## Later

- Base UI's `onOpenChangeComplete` and `actionsRef`.
