# Radio Group

Radios with roving focus and a hidden input per item.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/radio-group` |
| API docs | [`duck-primitives/api/radio-group.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/radio-group.mdx) |
| Styled component | [`registry-ui/src/radio-group`](../../../registry-ui/src/radio-group) |
| Styled docs | [`duck-ui/components/radio-group.mdx`](../../../../apps/duck/content/docs/duck-ui/components/radio-group.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 5. Faster in all 15 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI |
|---|--:|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 7,417 | 10,371 (0.72x) | 11,893 (0.62x) | 17,931 (0.41x) | 11,401 (0.65x) | 11,969 (0.62x) |
| Mount x100, ms | 6.33 | 38.4 (0.16x) | 21.2 (0.30x) | 48.3 (0.13x) | 28.6 (0.22x) | 15.1 (0.42x) |
| Update x100, ms | 6.09 | 13.5 (0.45x) | 11.9 (0.51x) | 19.7 (0.31x) | 20.1 (0.30x) | 7.16 (0.85x) |
| Unmount x100, ms | 1.43 | 3.03 (0.47x) | 2.64 (0.54x) | 4.79 (0.30x) | 1.72 (0.83x) | 1.56 (0.92x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.4.7, Base UI 1.0.0-rc.0, React Aria 1.22.1, Ark UI 5.40.0 and Headless UI 2.2.10.
<!-- /benchmarks -->

## Tests

The stories cover a required group in a form refusing an empty submit and handing focus to its first radio, and
a radio picked by a label, the arrow keys, Space, a typed letter, `g g` and `G`; a group horizontal, right to
left, looping or not, disabled whole or one radio at a time, and read-only; a value set from outside and a form
reset; and a group composed by hand from its item parts, submitting with a form outside it. The end-to-end suite
runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 135 | `radio-group.radix.test.tsx` 49, `radio-group.test.tsx` 86 |
| End to end | 10 | `radio-group.e2e.ts` 10 |
| registry-ui | 12 | `radio-group.test.tsx` 12 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>145 behaviours, one per test</summary>

**Unit, `radio-group.radix.test.tsx`**

- RadioGroup &gt; given a default RadioGroup
  - should have no accessibility violations
  - should render all items unchecked
  - should check an item and show its indicator when clicked
  - should move selection to another item
  - should not uncheck an item when clicked again
- RadioGroup &gt; given a RadioGroup with `defaultValue`
  - should render the matching item checked
- RadioGroup &gt; given a disabled RadioGroup
  - should have no accessibility violations
  - should not check an item when clicked
- RadioGroup &gt; given a RadioGroup with a disabled item
  - should not check the disabled item when clicked
  - should still allow checking an enabled item
- RadioGroup &gt; given a controlled RadioGroup
  - should call `onValueChange` with the clicked value
  - should not change selection unless controlled state updates
- RadioGroup &gt; given a controlled RadioGroup that is reset to `null`
  - should uncheck every item and hide indicators when value becomes `null`
  - should allow selecting a new value after being reset
- RadioGroup &gt; keyboard navigation
  - should check an item that receives focus while an arrow key is pressed
  - should not check an item that receives focus without arrow navigation
  - should not check an item on Enter key
  - should call a consumer `onKeyDown` handler passed to an item
- RadioGroup &gt; given an uncontrolled RadioGroup in a form
  - should bubble a change event with the selected value
  - should not trigger a clickable ancestor `onClick` when the value is set programmatically
  - should trigger a clickable ancestor `onClick` on a real user click
  - should not trigger a clickable ancestor `onClick` on a programmatic change after re-selecting the checked radio
  - should trigger a clickable ancestor `onClick` for a user click that the controlled parent ignores
  - should trigger a clickable ancestor `onClick` once and notify the form when the controlled parent applies the value after a timeout
  - should trigger a clickable ancestor `onClick` once and notify the form when the controlled parent applies the value in a transition
  - should trigger a clickable ancestor `onClick` once and notify the form when the controlled parent applies a different value than requested
  - should not notify the form when propagation is stopped on the trigger and the controlled parent applies the value later
  - should not re-select the previously checked radio when another is clicked programmatically via a ref
  - should expose the group as required for native validation
- RadioGroup &gt; given a RadioGroup in a form that is reset &gt; uncontrolled
  - should restore its `defaultValue` selection when the form is reset
  - should restore an empty selection when there is no `defaultValue`
- RadioGroup &gt; given a RadioGroup in a form that is reset &gt; controlled
  - should restore its initial `value` selection when the form is reset
- RadioGroup &gt; given a RadioGroup with external form association that is reset &gt; uncontrolled
  - should restore its `defaultValue` selection when the external form is reset
- RadioGroup &gt; given a RadioGroup with external form association that is reset &gt; controlled
  - should restore its initial `value` selection when the external form is reset
- Composable RadioGroup &gt; given a default composable RadioGroup
  - should have no accessibility violations
  - should render all items unchecked
  - should check an item and show its indicator when clicked
- Composable RadioGroup &gt; given a composable RadioGroup in a form
  - should bubble a change event with the selected value
  - should not bubble to the form when propagation is stopped on the trigger
- RadioGroup.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- RadioGroup.Item
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- RadioGroup.ItemTrigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- RadioGroup.Indicator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- RadioGroup.ItemBubbleInput
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `radio-group.test.tsx`**

- RadioGroup
  - renders with data-slot="radio-group"
  - has role="radiogroup"
  - renders items with role="radio"
  - no item is checked by default
  - selects item on click
  - supports defaultValue
  - calls onValueChange on selection
  - items have data-state on/off
  - disabled group disables all items
  - forwards ref
  - only one item can be checked at a time
  - clicking same item does not uncheck it
  - works as controlled component
  - required group sets aria-required
  - passes className
  - sets dir attribute
  - items have type="button"
  - items have data-slot="radio-group-item"
  - items have data-value attribute
  - renders hidden radio input for form submission when name is set
  - hidden inputs have correct name and value
  - disabled item has disabled attribute on button
  - flips horizontal arrow keys under a DirectionProvider without a dir prop
- RadioGroup keyboard selection
  - selects the item a typed letter starts
  - selects the last item on G
  - g g still checks the first item when a busy page runs the timers of the press before late
- RadioGroup losing focus
  - drops a pending arrow-key selection when focus leaves the group
- RadioGroup Enter key
  - keeps Enter from clicking the radio, which only Space checks
- RadioGroup readOnly
  - announces itself read-only
  - ignores a click
  - moves focus on an arrow key without checking the radio it lands on
- RadioGroup cleared to null
  - leaves an item valued with an empty string unchecked
  - refuses a submit while required, though an item is valued with an empty string
  - hands onValueChange null when a form reset takes it back to no pick
- RadioGroup in a form
  - tells the form once when a radio is picked
  - fires no click when it mounts with a radio checked
  - keeps the hidden inputs out of the tab order and the pointer path
  - hands focus given to a hidden input, as by a form refusing a submit, to the radio it stands for
  - hands that focus to the trigger of an item composed by hand
  - disables the hidden inputs of a disabled group, so the form submits none of them
  - submits with a form outside it named by form
  - draws the hidden inputs invisible and out of the flow
  - keeps the pick it mounted with as the one its inputs reset to
  - runs an onFocus given to a hidden input before handing the focus on
  - restores its pick on reset when it renders into another document, such as an iframe
  - restores the inputs on reset without telling the form, as native radios do
- RadioGroup reset by its form
  - restores its pick when the form it names renders after it
  - keeps its pick when the form around it resets and its form is set empty
  - submits the pick it shows after two resets, once its name came after a change
  - submits the pick it shows when its parent declines the reset
- RadioGroup after a reset
  - tells the form about the next change once a reset restored a pick
  - tells the form about the next change after a second reset
  - tells the form about the next change after a reset with nothing to restore
- RadioGroup typeahead
  - matches an item by its textValue rather than what it shows
  - skips a disabled item
- RadioGroup typeahead where the browser has checkVisibility
  - skips a hidden item
- RadioGroup typeahead sources
  - matches an item by its aria-label when it has no textValue
  - leaves a letter typed in a group nested inside it to that group
  - stays out of a group nested inside it
- RadioGroup arrow keys
  - wraps from the last radio to the first by default
  - checks the radio two quick presses land on
  - takes a typed letter without throwing through a root given to a component that drops its ref
  - skips a disabled radio
  - hands focus entering the group to the checked radio
- RadioGroup picking the checked radio
  - leaves the next change audible when its click stopped propagating
  - tells the form about a change its parent makes after declining a pick whose click stopped propagating
  - does not report a change
- RadioGroup disabled
  - checks no disabled item through a trigger slotted onto an element with no disabled state
  - marks the group for styling
- RadioGroup outside a form
  - renders no hidden input without a name
- RadioGroup typing after other keys
  - starts a new search after an arrow key
  - starts a new search after G
  - starts a new search once focus has left the group and come back
  - searches for no letter typed with Control, Alt or Meta
  - searches for no named key, such as Tab
  - adds no Space to the search, which checks the radio instead
- RadioGroup keys that check
  - checks the radio ArrowUp and Home land on
  - checks nothing focus reaches by other means once an arrow key is done
  - skips a disabled last radio on G
- RadioGroup wiring
  - is not required by default
  - writes no aria-readonly unless read-only
  - takes a data-slot passed to the group or an item over its own
  - writes textValue as data-text-value only
  - runs the onKeyDown and onBlur given to the group and the onFocus given to an item
  - hands its parts the scope it is given
  - names each part in React DevTools

**End to end, `radio-group.e2e.ts`**

- RadioGroup
  - a required group refuses an empty submit, then a label click checks a fruit the form submits
  - a refused submit focuses the first radio, so arrow keys pick a fruit the group shows
  - arrow keys check the radio they land on, pass over a disabled one, and loop unless told not to
  - horizontal and right-to-left, ArrowLeft moves on and ArrowUp moves nowhere
  - Space checks the focused radio and Enter does not
  - a letter jumps to the fruit it starts, and G and g g reach the ends
  - read-only keeps the choice while focus still moves
  - a disabled group disables every radio, and a label click checks nothing
  - a value set from outside checks its radio, and a form reset puts back the first value
- RadioGroup composed from its parts
  - a provider, trigger and bubble input submit with a form outside the group

</details>
<!-- /behaviour -->

## Beyond Radix

- `readOnly` keeps the selection fixed while the radios stay focusable, as in Base UI, React Aria and Ark.
- `form` ties the hidden inputs to a form outside the group.
- `RadioGroup.ItemProvider`, `RadioGroup.ItemTrigger` and `RadioGroup.ItemBubbleInput` compose an item by
  hand, and `value` takes `null` for no selection.

## Fixed

- Passes every Radix radio-group test.
- Picking a radio tells its form once, through the hidden input, and a click handler that stops
  propagation keeps the form from hearing it.
- `required` reaches the hidden inputs, so a form refuses to submit with nothing selected.
- A form reset puts back the starting value and fires nothing. The group finds its form as the form resets, so a
  form named by `form` that renders after the group resets it too, `form=""` ties it to no form, and a form named
  inside a shadow root is found there, as for a native input. Radix looks the form up once, in the document, and
  reads `form=""` as no `form` at all.
- The hidden inputs follow the pick the group shows once a reset is done, so the form submits what the group shows
  when its parent declines the reset or the group gained its `name` after a change. Radix's take back the pick they
  mounted with.
- `value={null}` leaves an item valued `""` unchecked, as Radix does, so a required group cleared to `null` still
  refuses an empty submit.
- Typing a letter and `G` select: the group read its radios from a collection it had not rendered yet and
  always found none. Typeahead matches `textValue`, then `aria-label`, then the text, and skips a nested
  group's radios. Typing the focused radio's name keeps focus on it. A key pressed in a nested group is left to
  that group, where both groups moved focus, and typeahead, `g g` and `G` skip a hidden radio.
- A disabled item given a trigger slotted onto an element with no disabled state, such as a `span`, checks
  nothing when clicked.
- A pick whose click stopped propagating keeps the form from hearing only that pick, not a different value the
  parent sets after declining it.
- Enter no longer clicks a radio.
- `g g`, `G` or a typed letter right after another press on a busy page focused its radio without
  checking it. The page ran the earlier press's late clear after the next press began, which ended that
  press's navigation.
- In development under StrictMode, a letter typed before React ran the group's mount effects stayed in
  the search, so the next letter, however much later, searched for both. The replayed cleanup cleared
  the timer that empties the search.
- A form refusing an empty submit to a required group focuses one of its hidden inputs, and that focus now goes
  to the radio the input stands for, as Base UI does. Focus stayed on the hidden input, so the arrow keys checked
  the hidden radios alone and the form submitted a choice the group did not show. Radix has the same gap.
- A group inside an iframe restores its pick when its form resets. It checked the form with
  `instanceof HTMLFormElement`, which is false for a form from another window, so it never heard the reset.

## Smaller and faster

- The group writes `dir` once. Its own `div` wrote it beside the roving focus group, which writes the same value to
  the same element.
- A radio takes its tab stop and keys from `useRovingFocusItem`, where it wrapped its button in
  `RovingFocusGroup.Item` and a collection slot.
- The group renders its own element through `useRovingFocusGroup`, where it rendered `RovingFocusGroup` around a
  slot around `Primitive.div`.
- A radio renders its button directly, and an indicator uses Presence's hook, where each radio rendered
  `Primitive.button`, and each indicator `Presence` and its context provider.

## Breaking changes

- `RadioGroup.Item` carries no `dir` attribute and takes its direction from the group.
- `IRadioGroup` drops `INavigationItem`, `IBubbleInputProps` and the context's `dir`;
  `IItemBubbleInputProps` types the new input part.
- A radio carries no `data-collection-item` attribute.
- `onValueChange` is typed `string | null`, since a form reset back to no pick calls it with `null`, as Radix's
  does though it types `string`.

## registry-ui

- `RadioGroupItem` and `MotionRadioGroupItem` hand their label to the primitive as `textValue`, so
  typeahead reaches the item it labels.
- A consumer `id` moves the label's `for` with it, and a consumer `style` keeps the indicator's variables.
- `indicator` shows while not selected, and with only `indicator` a selected item draws its dot.
- A label of `0` renders as the label and names the radio, where it was printed as bare text beside a radio
  with no name.

## Later

Nothing parked.
