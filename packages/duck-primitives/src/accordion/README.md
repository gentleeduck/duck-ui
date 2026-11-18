# Accordion

Stacked items whose triggers open and close their content.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/accordion` |
| API docs | [`duck-primitives/api/accordion.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/accordion.mdx) |
| Styled component (accordion) | [`registry-ui/src/accordion`](../../../registry-ui/src/accordion) |
| Styled docs (accordion) | [`duck-ui/components/accordion.mdx`](../../../../apps/duck/content/docs/duck-ui/components/accordion.mdx) |
| Styled component (collapsible) | [`registry-ui/src/collapsible`](../../../registry-ui/src/collapsible) |
| Styled docs (collapsible) | [`duck-ui/components/collapsible.mdx`](../../../../apps/duck/content/docs/duck-ui/components/collapsible.mdx) |

The registry-ui `Collapsible` is its own component, not built on this one, but its changes are recorded here.

## Benchmarks

<!-- benchmarks -->
Smaller than all 4. Faster in all 12 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI |
|---|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 4,869 | 8,770 (0.56x) | 9,260 (0.53x) | 14,752 (0.33x) | 11,953 (0.41x) |
| Mount x100, ms | 10.2 | 21.6 (0.47x) | 25.3 (0.40x) | 34.7 (0.29x) | 17.9 (0.57x) |
| Update x100, ms | 10.4 | 18.1 (0.57x) | 16.3 (0.64x) | 34.3 (0.30x) | 41.5 (0.25x) |
| Unmount x100, ms | 1.80 | 3.04 (0.59x) | 2.92 (0.61x) | 4.78 (0.38x) | 2.58 (0.70x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.2.20, Base UI 1.0.0-rc.0, React Aria 1.22.1 and Ark UI 5.40.0.
<!-- /benchmarks -->

## Tests

The stories cover a single accordion that collapses, one open on load, one that cannot collapse, one with no
animation, an indicator, a multiple accordion, right to left, a trigger styled from its state, force-mounted and
hidden-until-found content, horizontal accordions left to right and right to left, a disabled root and a disabled
item, `loop={false}`, controlled single and multiple accordions, the events, a nested accordion, items added at
runtime and `asChild`. The end-to-end suite runs each in Chromium, Firefox and WebKit, animations included. Its
`Combinations` story renders all 72 combinations of type, orientation, direction, animation and content
mounting, and each one is opened, closed and walked with the keyboard.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 140 | `accordion.radix.test.tsx` 84, `accordion.test.tsx` 56 |
| End to end | 116 | `accordion.e2e.ts` 116 |
| registry-ui | 19 | `accordion.test.tsx` 7, `collapsible.test.tsx` 11, `motion-collapsible.test.tsx` 1 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>256 behaviours, one per test</summary>

**Unit, `accordion.test.tsx`**

- Accordion
  - renders root with data-slot="accordion"
  - renders triggers with data-slot="accordion-trigger"
  - does not render content when closed by default
  - renders defaultValue content for single accordions
  - toggles a collapsible single item open and closed on click
  - keeps force-mounted content in the DOM while closed
  - calls onValueChange when a single item opens
  - forwards refs to the trigger
- Accordion single without collapsible
  - keeps the item open when it is pressed twice in one task, before React renders the first press
- Accordion.Item without a value
  - opens and closes on its own, apart from its siblings
- Accordion.Trigger asChild
  - stays closed when a disabled item is pressed through an element the browser does not disable
- Accordion.Content asChild
  - opens when its child never takes the ref
- Accordion keyboard
  - leaves a key it does not handle to the browser
  - leaves an arrow key pressed inside the content to the element there
- Accordion.Header
  - wraps the trigger in an h3 carrying its item state
- Accordion disabled
  - disables every item when the root is disabled
- Accordion loop
  - stops at the ends when loop is off
  - wraps at the ends by default
- Accordion.Indicator
  - renders a hidden span carrying its item state
- Accordion.Indicator closed
  - marks the indicator of a closed, enabled item
- Accordion onFocusChange
  - reports the focused item, once per move, and null once focus leaves the triggers
- Accordion find-in-page
  - keeps a closed item in the page as hidden until found
  - opens the item when the browser finds a match in its content
  - hides the content until found again once the item closes
  - keeps a disabled item out of find-in-page
  - takes a closed item out of find-in-page once it is disabled
  - hides the content again when a controlled value keeps the item closed after a find
- Accordion.Item onOpenChange
  - tells an item when its trigger opens and closes it
  - tells only the item whose trigger was pressed
  - stays quiet when an open item that cannot collapse is pressed
  - tells an item when find-in-page opens it
- Accordion dir
  - writes no dir attribute without a dir prop
  - puts a dir prop on the root alone and reads it for the arrow keys
  - reads a dir on any element around it for the arrow keys
- Accordion content animation
  - exposes the open size as CSS variables for the animation to read
  - keeps a size variable its style sets, measuring only the other
  - keeps closing content mounted until its exit animation ends
  - skips the open animation of an item open on mount, and plays every one after
  - hides findable content until found only once its exit animation ends
  - skips the animation of closed content kept in the page until its item first opens
  - drops a size variable once it measures nothing, so the stylesheet falls back to its own
- Accordion multiple
  - hands its ref to the root element
- Accordion single value
  - lets the open item close once collapsible is switched on
  - reads an empty value as no item open, even beside an item valued with the empty string
- Accordion keys and the page
  - keeps the page from scrolling on an arrow key it moves focus with
  - runs an onKeyDown given to the root first, and moves no focus once it prevents the default
- Accordion focus leaving the triggers
  - reports null once focus moves from a trigger to a button in the content
  - reports null once focus moves to a trigger its root does not hold, such as one portalled out
- Accordion.Trigger wiring
  - points the trigger at its own content
  - disables a trigger given disabled, and keeps its item shut
  - leaves a form around it unsent when pressed
  - runs an onFocus and an onBlur given to a trigger
  - lets a data-slot given to the root or a trigger win
- Accordion orientation
  - marks every part with its orientation
- Accordion scope
  - hands its parts the scope it is given
- Accordion find-in-page, again
  - opens the item once for each find, with a close between

**Unit, `accordion.radix.test.tsx`**

- given a single Accordion &gt; with default orientation
  - should have no accessibility violations in default state
- given a single Accordion &gt; with default orientation &gt; when navigating by keyboard &gt; on `ArrowDown`
  - should move focus to the next trigger
  - should move focus to the first item if at the end
- given a single Accordion &gt; with default orientation &gt; when navigating by keyboard &gt; on `ArrowUp`
  - should move focus to the previous trigger
  - should move focus to the last item if at the beginning
- given a single Accordion &gt; with default orientation &gt; when navigating by keyboard &gt; on `Home`
  - should move focus to the first trigger
- given a single Accordion &gt; with default orientation &gt; when navigating by keyboard &gt; on `End`
  - should move focus to the last trigger
- given a single Accordion &gt; with default orientation &gt; when clicking a trigger
  - should show the content
  - should have no accessibility violations
  - should call onValueChange
- given a single Accordion &gt; with default orientation &gt; when clicking a trigger &gt; then clicking the trigger again
  - should not close the content
  - should not call onValueChange
- given a single Accordion &gt; with default orientation &gt; when clicking a trigger &gt; then clicking another trigger
  - should show the new content
  - should call onValueChange
  - should hide the previous content
- given a single Accordion &gt; with orientation=vertical
  - should have no accessibility violations in default state
- given a single Accordion &gt; with orientation=vertical &gt; when navigating by keyboard &gt; on `ArrowDown`
  - should move focus to the next trigger
  - should move focus to the first item if at the end
- given a single Accordion &gt; with orientation=vertical &gt; when navigating by keyboard &gt; on `ArrowUp`
  - should move focus to the previous trigger
  - should move focus to the last item if at the beginning
- given a single Accordion &gt; with orientation=vertical &gt; when navigating by keyboard &gt; on `Home`
  - should move focus to the first trigger
- given a single Accordion &gt; with orientation=vertical &gt; when navigating by keyboard &gt; on `End`
  - should move focus to the last trigger
- given a single Accordion &gt; with orientation=vertical &gt; when clicking a trigger
  - should show the content
  - should have no accessibility violations
  - should call onValueChange
- given a single Accordion &gt; with orientation=vertical &gt; when clicking a trigger &gt; then clicking the trigger again
  - should not close the content
  - should not call onValueChange
- given a single Accordion &gt; with orientation=vertical &gt; when clicking a trigger &gt; then clicking another trigger
  - should show the new content
  - should call onValueChange
  - should hide the previous content
- given a single Accordion &gt; with orientation=horizontal &gt; and default dir="ltr" &gt; when navigating by keyboard &gt; on `ArrowUp`
  - should do nothing
- given a single Accordion &gt; with orientation=horizontal &gt; and default dir="ltr" &gt; when navigating by keyboard &gt; on `ArrowDown`
  - should do nothing
- given a single Accordion &gt; with orientation=horizontal &gt; and default dir="ltr" &gt; when navigating by keyboard &gt; on `ArrowRight`
  - should move focus to the next trigger
  - should move focus to the first item if at the end
- given a single Accordion &gt; with orientation=horizontal &gt; and default dir="ltr" &gt; when navigating by keyboard &gt; on `ArrowLeft`
  - should move focus to the previous trigger
  - should move focus to the last item if at the beginning
- given a single Accordion &gt; with orientation=horizontal &gt; and default dir="ltr" &gt; when navigating by keyboard &gt; on `Home`
  - should move focus to the first trigger
- given a single Accordion &gt; with orientation=horizontal &gt; and default dir="ltr" &gt; when navigating by keyboard &gt; on `End`
  - should move focus to the last trigger
- given a single Accordion &gt; with orientation=horizontal &gt; and dir="rtl" &gt; when navigating by keyboard &gt; on `ArrowUp`
  - should do nothing
- given a single Accordion &gt; with orientation=horizontal &gt; and dir="rtl" &gt; when navigating by keyboard &gt; on `ArrowDown`
  - should do nothing
- given a single Accordion &gt; with orientation=horizontal &gt; and dir="rtl" &gt; when navigating by keyboard &gt; on `ArrowRight`
  - should move focus to the previous trigger
  - should move focus to the last item if at the beginning
- given a single Accordion &gt; with orientation=horizontal &gt; and dir="rtl" &gt; when navigating by keyboard &gt; on `ArrowLeft`
  - should move focus to the next trigger
  - should move focus to the first item if at the end
- given a single Accordion &gt; with orientation=horizontal &gt; and dir="rtl" &gt; when navigating by keyboard &gt; on `Home`
  - should move focus to the first trigger
- given a single Accordion &gt; with orientation=horizontal &gt; and dir="rtl" &gt; when navigating by keyboard &gt; on `End`
  - should move focus to the last trigger
- given a multiple Accordion
  - should have no accessibility violations in default state
- given a multiple Accordion &gt; when navigating by keyboard &gt; on `ArrowDown`
  - should move focus to the next trigger
- given a multiple Accordion &gt; when navigating by keyboard &gt; on `ArrowUp`
  - should move focus to the previous trigger
- given a multiple Accordion &gt; when navigating by keyboard &gt; on `Home`
  - should move focus to the first trigger
- given a multiple Accordion &gt; when navigating by keyboard &gt; on `End`
  - should move focus to the last trigger
- given a multiple Accordion &gt; when clicking a trigger
  - should show the content
  - should have no accessibility violations
  - should call onValueChange
- given a multiple Accordion &gt; when clicking a trigger &gt; then clicking the trigger again
  - should hide the content
  - should call onValueChange
- given a multiple Accordion &gt; when clicking a trigger &gt; then clicking another trigger
  - should show the new content
  - should call onValueChange
  - should not hide the previous content
- given a controlled single collapsible Accordion &gt; when clicking an open item trigger
  - should open the item and call onValueChange once
- given a controlled single collapsible Accordion &gt; when clicking an open item trigger &gt; then clicking the same trigger again
  - should close the item in a single click
  - should call onValueChange exactly once more (with an empty value)
- Accordion.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Accordion.Item
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Accordion.Header
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Accordion.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Accordion.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- given an Accordion whose items change
  - should navigate to an item mounted between existing items
  - should skip an item after it unmounts
  - should follow the new order when keyed items are reordered
  - should follow the new order when items are reordered in a transition
  - should follow the new order when the wrappers around items are reordered
  - should navigate to an item inside a Suspense boundary once it resolves
  - should skip an item hidden when its Suspense boundary suspends again
  - should skip items inside a hidden Activity and restore them when visible
  - should navigate to items inside an initially hidden Activity once visible
  - should not register duplicate items in strict mode
  - should skip an item after it becomes disabled
  - should keep navigation within a nested Accordion separate from its parent

**End to end, `accordion.e2e.ts`**

- Accordion &gt; single and collapsible
  - starts with every item closed and no content in the page
  - opens with an animation and exposes the open height for it
  - ties each trigger to the region it controls
  - plays the exit animation of the open item before removing it when another opens
  - collapses the open item when its trigger is pressed again
  - passes over a trigger a stylesheet hides, since it cannot take focus
  - opens and closes from the keyboard
  - moves focus with the arrow keys, Home and End, and wraps at the ends
- Accordion &gt; open on load
  - skips the open animation of an item open on load
  - exposes the open height of an item open on load
  - plays every animation after the first frame
- Accordion &gt; not collapsible
  - keeps the open item open when its trigger is pressed
  - still swaps the open item for another
- Accordion &gt; without an animation
  - removes closed content at once
  - opens without an animation
- Accordion &gt; with reduced motion
  - opens and closes without waiting for an animation the page turned off
- Accordion &gt; indicator
  - turns with its item and stays out of the trigger name
- Accordion &gt; multiple
  - keeps every opened item open, each with its own animation
  - closes one item and leaves the others open
  - turns each plus indicator with its own item
- Accordion &gt; right to left
  - lays out right to left and keeps the vertical arrows
- Accordion &gt; styled trigger
  - styles the open trigger from its state
- Accordion &gt; force mounted
  - keeps every item in the page, the closed ones hidden
  - opens and closes with the item transition, keeping the content mounted
- Accordion &gt; hidden until found
  - keeps closed content in the page for find-in-page
  - opens the item whose content the browser finds
  - hides the content until found again only once its exit animation ends
- Accordion &gt; horizontal
  - moves with the horizontal arrows only
  - opens across with an animation and exposes the open width for it
  - turns the arrows around right to left
- Accordion &gt; disabled
  - disables every trigger and leaves the open item open
  - skips a disabled item with the arrow keys and keeps it closed
- Accordion &gt; without loop
  - stops at the first and the last trigger
- Accordion &gt; controlled
  - opens what the parent sets, with the animation
  - hands a trigger press to the parent
  - closes everything from outside
  - opens and closes several items for a multiple parent
- Accordion &gt; events
  - reports focus, opening and the value in the order they happen
- Accordion &gt; nested
  - keeps the arrow keys among each accordion own triggers
  - opens an inner item without touching the outer one
  - closes the outer item with the inner accordion inside it
- Accordion &gt; dynamic items
  - follows an item added before the others
  - skips an item once it is removed
- Accordion &gt; as child
  - renders each part as the element it is given and keeps working
- Accordion combinations
  - single-vertical-ltr-animated-unmount
  - single-vertical-ltr-animated-force-mount
  - single-vertical-ltr-animated-until-found
  - single-vertical-ltr-static-unmount
  - single-vertical-ltr-static-force-mount
  - single-vertical-ltr-static-until-found
  - single-vertical-rtl-animated-unmount
  - single-vertical-rtl-animated-force-mount
  - single-vertical-rtl-animated-until-found
  - single-vertical-rtl-static-unmount
  - single-vertical-rtl-static-force-mount
  - single-vertical-rtl-static-until-found
  - single-horizontal-ltr-animated-unmount
  - single-horizontal-ltr-animated-force-mount
  - single-horizontal-ltr-animated-until-found
  - single-horizontal-ltr-static-unmount
  - single-horizontal-ltr-static-force-mount
  - single-horizontal-ltr-static-until-found
  - single-horizontal-rtl-animated-unmount
  - single-horizontal-rtl-animated-force-mount
  - single-horizontal-rtl-animated-until-found
  - single-horizontal-rtl-static-unmount
  - single-horizontal-rtl-static-force-mount
  - single-horizontal-rtl-static-until-found
  - collapsible-vertical-ltr-animated-unmount
  - collapsible-vertical-ltr-animated-force-mount
  - collapsible-vertical-ltr-animated-until-found
  - collapsible-vertical-ltr-static-unmount
  - collapsible-vertical-ltr-static-force-mount
  - collapsible-vertical-ltr-static-until-found
  - collapsible-vertical-rtl-animated-unmount
  - collapsible-vertical-rtl-animated-force-mount
  - collapsible-vertical-rtl-animated-until-found
  - collapsible-vertical-rtl-static-unmount
  - collapsible-vertical-rtl-static-force-mount
  - collapsible-vertical-rtl-static-until-found
  - collapsible-horizontal-ltr-animated-unmount
  - collapsible-horizontal-ltr-animated-force-mount
  - collapsible-horizontal-ltr-animated-until-found
  - collapsible-horizontal-ltr-static-unmount
  - collapsible-horizontal-ltr-static-force-mount
  - collapsible-horizontal-ltr-static-until-found
  - collapsible-horizontal-rtl-animated-unmount
  - collapsible-horizontal-rtl-animated-force-mount
  - collapsible-horizontal-rtl-animated-until-found
  - collapsible-horizontal-rtl-static-unmount
  - collapsible-horizontal-rtl-static-force-mount
  - collapsible-horizontal-rtl-static-until-found
  - multiple-vertical-ltr-animated-unmount
  - multiple-vertical-ltr-animated-force-mount
  - multiple-vertical-ltr-animated-until-found
  - multiple-vertical-ltr-static-unmount
  - multiple-vertical-ltr-static-force-mount
  - multiple-vertical-ltr-static-until-found
  - multiple-vertical-rtl-animated-unmount
  - multiple-vertical-rtl-animated-force-mount
  - multiple-vertical-rtl-animated-until-found
  - multiple-vertical-rtl-static-unmount
  - multiple-vertical-rtl-static-force-mount
  - multiple-vertical-rtl-static-until-found
  - multiple-horizontal-ltr-animated-unmount
  - multiple-horizontal-ltr-animated-force-mount
  - multiple-horizontal-ltr-animated-until-found
  - multiple-horizontal-ltr-static-unmount
  - multiple-horizontal-ltr-static-force-mount
  - multiple-horizontal-ltr-static-until-found
  - multiple-horizontal-rtl-animated-unmount
  - multiple-horizontal-rtl-animated-force-mount
  - multiple-horizontal-rtl-animated-until-found
  - multiple-horizontal-rtl-static-unmount
  - multiple-horizontal-rtl-static-force-mount
  - multiple-horizontal-rtl-static-until-found

</details>
<!-- /behaviour -->

## Beyond Radix

- `Accordion.Item` takes `onOpenChange`, as in Base UI and React Aria: it is called with the item's new
  state when its trigger, or the browser's find-in-page, opens or closes it, and not when another item's
  opening closes it.
- `onFocusChange` on the root reports the focused item's value, then `null` once focus leaves the
  triggers. `loop={false}` stops the arrow keys at either end.
- `disabled` on the root disables every item.
- `Accordion.Header` renders the `h3` that holds a trigger, and `Accordion.Indicator` an `aria-hidden` span
  for the icon. Both carry the item's `data-state`, `data-disabled` and `data-orientation`.
- `hiddenUntilFound` keeps closed content in the page as `hidden="until-found"`, as in Base UI, so the
  browser's find-in-page opens the item holding the match. A disabled item stays out of the search, and content a
  controlled `value` keeps closed is hidden again.

## Fixed

- Passes every Radix accordion test.
- The arrow keys, Home and End move focus between triggers, skipping disabled items and following
  `orientation` and the direction of the page around the root. They find the root and its triggers by
  `data-slot`, so a trigger given another `data-slot` is skipped, and so is a nested accordion's, one React has
  hidden, or one a stylesheet hides.
- Content stays mounted until its closing CSS animation ends, and sets its open size as
  `--gentleduck-accordion-content-height` and `--gentleduck-accordion-content-width` for the keyframes. A
  `style` that sets one of them keeps its value, and only the other is measured. An item open on load skips
  its opening animation.
- Content is inert while it animates closed, so Tab passes over it, and findable again once it is hidden.
- `forceMount` content stays visible when closed, for a JavaScript animation library to drive.

## Smaller and faster

- Content mounts in the commit that opens its item. Radix's Presence takes two more commits, one to mount it and
  one to store its node, and reads its styles as it mounts, which makes the browser recalculate them for every item.
- Content writes its size variables straight onto its node, so measuring it rerenders nothing.
- The arrow keys and a trigger's blur find the accordion's own triggers in the page when they happen, where Radix's
  triggers register in a collection as they render.
- An item open on load skips its animation by a flag cleared on its first change, where Radix's content schedules a
  frame to clear it.
- Ids come straight from React's `useId`, with no state or effect around it.
- No part resolves a direction. The arrow keys read it from the page when pressed, so a `dir` on any element
  around the root counts.
- The trigger toggles through one `onOpenToggle` on the item's context, which the find-in-page listener
  shares.
- Each part's ref is typed as its DOM element.
- The context drops `type`, which no part read.

## Breaking changes

- A single accordion is no longer collapsible by default. Pass `collapsible` to let a click close the open
  item, as Radix requires.
- The root carries a `dir` attribute only when given one, and the items, triggers and content carry none.
- `IAccordion.IContext` has no `type`.

## registry-ui

- `Accordion` and `MotionAccordion` put each trigger in an `h3` and mark the chevron `aria-hidden`.
  `Accordion` takes the primitive's `disabled`, `loop` and `onFocusChange`, and `AccordionItem` its
  `onOpenChange`.
- Closed `AccordionContent` stays in the page as `hidden="until-found"`. With `renderOnce` an item still
  mounts only once it first opens, and its content renders in the pass that opens it rather than one
  render later.
- Content animates its height with tw-animate-css's accordion keyframes, which run in every browser, where
  the height transition needed `interpolate-size` and ran only in Chromium.
- `MotionAccordion` no longer puts a `total` attribute on each item's element.
- `Collapsible` follows a controlled `open` after the first render, and a click calls `onOpenChange` once
  with the new state, where it was called up to three times, first with the old one. A trigger `onClick`
  that calls `preventDefault` keeps it as it is.
- `CollapsibleContent` unmounts its children once the close transition ends, and `forceMount` keeps them
  mounted before the first open. `MotionCollapsibleContent` fills `useCollapsible().contentRef` too.
- The collapsible parts run the cleanup a callback ref returns, where they called the ref again with `null`.
- `Collapsible` carries a `dir` attribute only when given one (breaking).

## Later

- `IAccordionProps` and `AccordionProps` in registry-ui name the same type. Removing one is breaking.
- Building the registry-ui `Collapsible` on a collapsible primitive, so it shares the accordion content's
  measuring and its find-in-page support.
- A text-fragment link (`#:~:text=`) does not open an item in Firefox. Firefox looks for the fragment once, at
  load, and the content is marked `until-found` by an effect after that. Chromium and WebKit look again.
