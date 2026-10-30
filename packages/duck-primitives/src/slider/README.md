# Slider

One or more thumbs on a track, with keyboard stepping and a hidden input per thumb inside a form.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/slider` |
| API docs | [`duck-primitives/api/slider.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/slider.mdx) |
| Styled component | [`registry-ui/src/slider`](../../../registry-ui/src/slider) |
| Styled docs | [`duck-ui/components/slider.mdx`](../../../../apps/duck/content/docs/duck-ui/components/slider.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 4. Faster in 10 of 12 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI |
|---|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 6,753 | 9,743 (0.69x) | 12,453 (0.54x) | 14,321 (0.47x) | 14,993 (0.45x) |
| Mount x100, ms | 7.16 | 9.48 (0.76x) | 11.6 (0.62x) | 12.6 (0.57x) | 12.6 (0.57x) |
| Update x100, ms | 3.07 | 3.40 (0.90x) | 4.68 (0.66x) | 6.83 (0.45x) | 6.88 (0.45x) |
| Unmount x100, ms | 1.01 | **0.950 (1.06x)** | 1.20 (0.84x) | 1.31 (0.77x) | **0.998 (1.01x)** |

Where gentleduck is behind:

- Unmount x100 against Radix: 1.06x, 0.061 ms more.
- Unmount x100 against Ark UI: 1.01x, 0.013 ms more.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.4.7, Base UI 1.0.0-rc.0, React Aria 1.22.1 and Ark UI 5.40.0.
<!-- /benchmarks -->

## Tests

The stories cover a controlled slider dragged, pressed on its track and stepped by key and by `largeStep`, right
to left, vertical, inverted and disabled; a drag the browser cancels; a right click and a Control click on the
track; a press beside a thumb that leaves its value, and a drag begun there counted at each change; a thumb
kept inside the slider at either end, in each orientation and direction; a range whose thumbs swap or keep their
order `minStepsBetweenThumbs` apart, pressed on the content inside a thumb and counted at each commit; a form that
submits every thumb, takes a slider outside it through `form` and resets them all, leaving focus on Reset; and a
thumb composed from its parts. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 158 | `slider-libs.test.ts` 32, `slider.radix.test.tsx` 39, `slider.test.tsx` 87 |
| End to end | 25 | `slider.e2e.ts` 25 |
| registry-ui | 16 | `slider.test.tsx` 16 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>183 behaviours, one per test</summary>

**Unit, `slider.radix.test.tsx`**

- Slider
  - steps by a normal step value on arrow key press
  - steps correctly when step is serialized in scientific notation
  - preserves precision for fractional scientific-notation steps
- Slider &gt; when the value is off the step grid
  - snaps to the next aligned value on arrow up without skipping a step
  - snaps to the next aligned value on arrow down without skipping a step
- Slider &gt; ref stability
  - keeps a stable composed ref on the root
  - keeps a stable composed ref on the thumb
- Slider &gt; when dragging a range thumb to overlap another
  - calls `onValueCommit` with the narrowed value
  - does not call `onValueCommit` when the value is unchanged
- Slider &gt; preserveThumbOrder
  - allows thumbs to swap by default
  - prevents a thumb from crossing its neighbour when set
  - respects `minStepsBetweenThumbs` when preserving order
- Slider &gt; within a form that is reset
  - should restore its `defaultValue` when the form is reset (uncontrolled)
  - should restore its initial `value` when the form is reset (controlled)
- Slider &gt; with external form association
  - should restore its `defaultValue` when reset from an external form
  - should restore its initial `value` when reset from an external form
- Slider.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Slider.Track
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Slider.Range
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Slider.Thumb
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Slider.ThumbTrigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Slider.BubbleInput
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - does not bubble a programmatic value change to ancestor `onInput` handlers
  - bubbles a user-driven value change to ancestor `onInput` handlers
  - bubbles a user-driven change to ancestor `onInput` handlers in a controlled slider
  - bubbles a user-driven change to ancestor `onInput` handlers when the controlled value is applied later
  - bubbles a user-driven change to ancestor `onInput` handlers when the controlled value is applied in a transition
  - bubbles the value a controlled parent applies in place of the user-requested one to ancestor `onInput` handlers
  - only bubbles the user-driven thumb change to ancestor `onInput` handlers in a range slider
  - only bubbles the user-driven thumb change to ancestor `onInput` handlers when a controlled parent moves another thumb in the same render
  - bubbles every thumb value a user drag changes to ancestor `onInput` handlers when a controlled parent adjusts the values
  - does not treat a programmatic change as user-driven after a rejected user interaction
  - does not re-render the slider for pointer moves that do not change the value

**Unit, `slider.test.tsx`**

- Slider
  - renders with data-slot="slider"
  - renders track with data-slot="slider-track"
  - renders range with data-slot="slider-range"
  - renders thumb with role="slider"
  - thumb has aria-valuemin, aria-valuemax, aria-valuenow
  - defaults to min=0 max=100 value=[0]
  - supports horizontal orientation by default
  - supports vertical orientation
  - disabled slider has data-disabled on all parts
  - forwards ref
  - custom min/max range
  - multiple thumbs render multiple sliders
  - slider renders as span elements
  - passes className
  - sets dir attribute
  - ArrowRight increases and ArrowLeft decreases in LTR
  - flips horizontal arrow keys under a DirectionProvider without a dir prop
  - anchors the range and thumb to the right edge in RTL
- Slider vertical
  - reads a drag from the bottom up
  - reads a drag from the top down when inverted
  - steps up on ArrowUp and down on ArrowDown
  - keeps the track where it was when the slide began
  - places the thumb and the range from the top when inverted
  - steps down on ArrowUp when inverted
- Slider Home and End
  - jumps to min on Home and to max on End, and claims both keys
- Slider thumb pointer
  - focuses a thumb pressed directly without moving the value
  - focuses a thumb pressed on its own content without moving the value
- Slider presses that do not slide
  - reports a drag begun by a press that left the value where it was once per change
  - moves nothing for a right click, which opens the context menu
  - moves nothing for a Control click, which opens the context menu
  - focuses the closest thumb for a press that leaves the value where it was
- Slider under StrictMode
  - commits a key step once, though StrictMode runs each state update twice
- Slider range Home and End
  - move the focused thumb, as far as its neighbour allows
  - without preserveThumbOrder, End takes the first thumb past the second, and focus goes with it
- Slider preserveThumbOrder
  - stops a thumb dragged down past its neighbour at the minimum distance above it
  - stops a thumb dragged up past its neighbour at the minimum distance below it
  - keeps the moved thumb active once it meets its neighbour
- Slider hidden input
  - renders one per thumb on the server, before a thumb can find its form
  - names each input by its own thumb, over the root
  - lets through an input event it did not dispatch, after one it stopped
  - renders none outside a form
  - renders one for a form named by `form` that does not contain the slider
  - treats a parent moving back to the last requested value as programmatic
- Slider on the server
  - renders a lone thumb where its value puts it, with that value in its input
  - renders each thumb of a range where its value puts it, once told its index
  - keeps each thumb of a range hidden on the server when told no index, rather than all at the first value
  - takes the index of a thumb composed from its parts from its provider
- Slider focus after a change
  - shows the focus ring only when the keyboard moved the thumb
  - hides the focus ring for a press after a key that moved nothing
  - hides the focus ring for a press that leaves the value where it was
- Slider form reset
  - leaves focus on what has it, though a key moved the thumb last
  - restores its value on reset when it renders into another document, such as an iframe
  - stops listening to a form it is no longer tied to
- Slider largeStep
  - moves a thumb ten steps on Page Up, Page Down and Shift with an arrow when unset
  - moves a thumb by largeStep on Page Up, Page Down and Shift with an arrow
  - keeps a plain arrow key to one step
- Slider.Value
  - shows the values and follows them as a thumb moves
  - hands the values to a function child
  - is hidden from assistive technology and carries the root state
- Slider right to left
  - reads a press from the right edge
- Slider pointer capture
  - moves nothing for a pointer passing over it unpressed
  - commits nothing on a release once it no longer holds the pointer
  - ends a slide the browser cancels as a release, committing it and measuring the track again next time
  - stops a drag past either end of the track at min or max
  - commits nothing for a second slide that ends where it began
- Slider keys it steps with
  - claims each arrow and page key, so the page does not scroll as the thumb moves
- Slider keys it does not use
  - leaves a key that is not a step, Home or End to the page
- Slider disabled
  - moves nothing for a drag while disabled
  - commits nothing for a release while disabled, though its parent changed the value during the press
  - marks a root given the group role disabled, as registry-ui gives a range
  - moves for no key while disabled
  - tells assistive technology whether each thumb of a disabled slider is disabled, which the root alone does not
  - tells assistive technology whether each thumb of an enabled slider is disabled, which the root alone does not
- Slider minimum distance
  - counts the minimum in steps
  - refuses a drag that would bring two thumbs closer than the minimum, even when they may swap
- Slider with no value given
  - starts with one thumb at min
  - hides a thumb beyond the values it has
- Slider parts
  - marks every part with its slot, orientation and disabled state
  - writes its direction on the root alone, which every part inherits
  - fills the range between two thumbs
- Slider with no values
  - steps nothing for a key from a focusable element inside it
- Slider thumb in bounds
  - keeps a measured thumb inside the track by half its width at the start edge
- Slider track position
  - reads a press against where the track starts
  - reads a vertical press against where the track starts
  - keeps the track where it was when the slide began
  - measures the track again on the next slide
  - measures a vertical track again on the next slide

**Unit, `slider-libs.test.ts`**

- slider.libs &gt; getNextSortedValues
  - inserts value at index and sorts
  - handles single value
  - sorts after insertion
  - handles empty with default
- slider.libs &gt; convertValueToPercentage
  - converts to percentage
  - works with custom range
  - clamps to 0-100
- slider.libs &gt; getLabel
  - single value returns undefined
  - two values return Minimum/Maximum
  - three+ values return numbered label
- slider.libs &gt; getClosestValueIndex
  - single value returns 0
  - returns closest index
  - returns first when equidistant
- slider.libs &gt; hasMinStepsBetweenValues
  - returns true when steps meet minimum
  - returns false when steps are too close
  - returns true when minSteps is 0
- slider.libs &gt; linearScale
  - scales linearly
  - scales from where the input starts
  - handles identical input range
  - handles inverted ranges
- slider.libs &gt; getDecimalCount
  - integer has 0 decimals
  - counts decimal places
  - counts the exponent of a number printed in scientific notation
  - a non-finite number has 0 decimals
- slider.libs &gt; getNextStepValue
  - moves an aligned value by whole steps
  - snaps an off-grid value to the next grid line in the direction of travel
  - counts the snap as the first of several steps
  - keeps the precision of a fractional step
- slider.libs &gt; roundValue
  - rounds to specified decimals
  - no-op for integers
- slider.libs &gt; getThumbInBoundsOffset
  - pulls a 20px thumb half its width inside the track at either end and leaves it centred midway
  - keeps a right-to-left thumb inside too, where the -50% translate still pulls it left

**End to end, `slider.e2e.ts`**

- Slider
  - arrow keys move a step, Shift and the Page keys a large step, Home and End to the ends, each one committed
  - a drag moves the value as it goes and commits it once, on release
  - a drag the browser cancels ends where it stopped, committed
  - a press on the track moves the thumb there
  - a right click or a Control click on the track moves nothing, since each opens the context menu
  - a press beside the thumb that leaves the value where it was still focuses it, so a key moves it
  - a drag begun beside the thumb, where the value stays, reports each change once
  - keeps the thumb inside the slider at either end
  - keeps the thumb inside the slider at either end, right-to-left
  - keeps the thumb inside the slider at either end, inverted
  - keeps the thumb inside the slider at either end, vertical
  - keeps the thumb inside the slider at either end, vertical and inverted
  - right to left, the track fills from the right and ArrowRight lowers the value
  - vertical, the value rises from the bottom and ArrowUp raises it
  - inverted, the track runs from the right and ArrowRight lowers the value
  - disabled, the thumb says so, takes no focus, and a press moves nothing
  - Home and End move the focused thumb, kept minStepsBetweenThumbs from the other
  - an uncontrolled slider commits a key once
  - a press on the content inside a thumb focuses that thumb and moves nothing
  - without kept order, End takes the first thumb past the second, and focus goes with it
  - dragged past the other, a thumb swaps with it, unless the order is kept
  - a form submits a value per thumb, a range under name[], and a slider outside it through form
  - a key reaches the form's onChange, and Reset restores every default, the outside slider's too
  - Reset leaves focus on the button, though a key moved a thumb last
  - composed from its parts, the hidden input carries the name and value, and its change bubbles

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-slider` 1.4.7, the version the benchmarks run. 1.6.1, the latest, has since taken
`preserveThumbOrder`, and stops the `input` a change made through `value` dispatches at the hidden input.

- `largeStep`, as in Base UI: how far Page Up, Page Down and Shift with an arrow key move a thumb, ten
  steps when unset.
- `Slider.Value` shows the values as text, as Base UI's `Slider.Value`, Ark's `ValueText` and React
  Aria's `SliderOutput` do, following each thumb as it moves. It takes a function of the values, and is
  hidden from assistive technology, since each thumb announces its own value.
- `preserveThumbOrder` stops a thumb at its neighbour, `minStepsBetweenThumbs` away, instead of letting it
  cross and swap places.
- `index` on `Slider.Thumb` and `Slider.ThumbProvider`, as in Base UI, places a thumb among the values before
  it mounts, so a range renders its thumbs on the server.
- `Slider.ThumbProvider`, `Slider.ThumbTrigger` and `Slider.BubbleInput` are the parts of `Slider.Thumb`,
  for placing the hidden input by hand or giving it props. Radix exports them marked `unstable_`.

## Fixed

- Passes every Radix slider test.
- The root's props are typed for the `span` it renders, so a handler reads a `span` as its `currentTarget`.
  They were typed for a `div`, as in Radix.
- An arrow key on a value off the `step` grid moves to the next grid line, where it moved a full step and
  rounded past it.
- A `step` that prints in scientific notation, such as `1e-7`, keeps its precision, where every value
  rounded to 0.
- A form reset restores the values the slider started with and leaves focus where it is. Radix's moves focus
  to the thumb a key moved last.
- A thumb renders at its value on the server: a lone thumb always, and each thumb of a range given `index`.
  Every thumb rendered hidden, beside an empty hidden input, until it mounted, so a server-rendered slider
  showed a bare track, as Radix's still does.
- `onValueCommit` fires whenever a drag changed any value, where it compared one thumb and missed a drag
  that left two thumbs on the same value.
- Focus moves to the changed thumb without the focus ring when a pointer moved it.
- A right click or a Control click on the track moves nothing, since each opens the context menu. Either
  moved the closest thumb to the pointer, as Radix's still does.
- A press on content inside a thumb, such as an icon, focuses that thumb and moves nothing. Only a press on
  the thumb element itself did, so a press on its content slid the thumb to the pointer, as Radix's still
  does.
- A press on the track that leaves the value where it was focuses the closest thumb, so a key then moves it.
  Focus moved only with a change, so it stayed where it was, as in Radix.
- An uncontrolled slider commits a key once. `onValueCommit` ran inside a state updater, which StrictMode
  runs twice, so it fired twice in development, as Radix's still does.
- A drag the browser cancels commits where it stopped, and the next press measures the track again. Only a
  pointer up ended a drag, so a cancelled one committed nothing and the next drag read the track where it had
  been, as in Radix.
- Each thumb of a disabled slider carries `aria-disabled`. Only the root did, which assistive technology
  does not pass on to the `role="slider"` inside it, so Chromium exposed every thumb as settable, as Radix's
  still does.
- A slider inside an iframe restores its values when its form resets. It checked the form with
  `instanceof HTMLFormElement`, which is false for a form from another window, so it never heard the reset.

## Smaller and faster

- The root keeps its element in a ref rather than state, and a thumb outside a form renders without a
  context of its own, so a Slider mounts and updates faster than Radix's, where it was slower at both.
- The hidden input keeps its previous value in a ref, where it ran `usePrevious`.
- A drag measures the track from the pointer event's own element, so neither orientation keeps a ref or
  composes one.

## Breaking changes

- A change made through `value` dispatches an `input` that stops at the hidden input, so an ancestor's
  `onInput` no longer hears it. A form's `onChange` still does.
- `ISlider.IThumbElement` is `ISlider.ThumbElement`, named like every other element type.
- `Slider.Track`, `Slider.Range` and the thumbs no longer write `dir`, which they take from the root. A
  stylesheet selecting `[dir]` on one of them now has to select the root.

## registry-ui

- `Slider` and `MotionSlider` name their slider. An `aria-label` or `aria-labelledby` landed on the root, a
  plain element that cannot take one, so every thumb was unnamed. One thumb now takes the name; several
  share it through a `role="group"` root and keep their own Minimum and Maximum names. Every example
  passes one.
- They render one thumb when given neither `value` nor `defaultValue`, where a second thumb rendered and
  never showed.
- They stop setting the `data-slot` and `data-orientation` the primitive already sets.
- The docs list `largeStep` and the label props.
- A disabled slider fades once, at its root, so its thumb is as faint as its track. The thumb faded itself
  as well, to a quarter.
- They pass each thumb its `index`, so a server-rendered range shows its thumbs before it hydrates.

## Later

- Base UI's `thumbAlignment` and `thumbCollisionBehavior`, and Ark's markers.
- registry-ui could render `Slider.Value` beside the track.
