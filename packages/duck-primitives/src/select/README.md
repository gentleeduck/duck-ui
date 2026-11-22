# Select

A listbox select with a hidden native `<select>` for forms.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/select` |
| API docs | [`duck-primitives/api/select.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/select.mdx) |
| Styled component | [`registry-ui/src/select`](../../../registry-ui/src/select) |
| Styled docs | [`duck-ui/components/select.mdx`](../../../../apps/duck/content/docs/duck-ui/components/select.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 5. Faster in all 22 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI |
|---|--:|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 31,289 | 31,643 (0.99x) | 46,138 (0.68x) | 59,115 (0.53x) | 35,369 (0.88x) | 35,005 (0.89x) |
| Mount x100, ms | 9.96 | 59.5 (0.17x) | 13.8 (0.72x) | 33.7 (0.30x) | 15.2 (0.65x) | 18.3 (0.55x) |
| Unmount x100, ms | 0.857 | 4.14 (0.21x) | 1.30 (0.66x) | 3.40 (0.25x) | 1.64 (0.52x) | 2.92 (0.29x) |
| Unmount open x100, ms | 6.73 | 11.0 (0.61x) | 10.8 (0.62x) | 16.5 (0.41x) | 828 (0.01x) | - |
| Open, ms | 2.23 | 3.17 (0.70x) | 2.97 (0.75x) | 3.56 (0.63x) | 2.86 (0.78x) | - |
| Close, ms | 1.23 | 1.83 (0.67x) | 2.13 (0.58x) | 2.11 (0.58x) | 1.67 (0.74x) | - |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 2.3.7, Base UI 1.0.0-rc.0, React Aria 1.22.1, Ark UI 5.40.0 and Headless UI 2.2.10.

gentleduck is given `items`, as Ark UI is given its collection. Headless UI's Listbox has no controlled open state, so its copies are timed mounting and unmounting closed, and no more.
<!-- /benchmarks -->

## Tests

The stories cover a form that refuses an empty required select, then submits and resets the value picked; a click
opening labelled groups; the keyboard opening the list, stepping past a disabled item, typing ahead, and Escape
handing focus back to the trigger; typing on the closed trigger; a value set from outside; the pick, the typing
and the outside value again with `items`; a select that is
disabled, and one inside a disabled fieldset; right to left; popper and item-aligned placement; scroll buttons on a
list taller than its box; a select inside a dialog and inside a popover, where an outside click closes only the
select; an overlay from a browser extension stopping later mouse events; a select inside an iframe and inside
a shadow root; and a multiple select picked by click, with and without `items`, and from the keyboard, showing its
picks in the order made, submitting each, refusing to submit empty when required, emptied by a reset, and opening
item-aligned on its first pick without moving as picks are made. The end-to-end suite runs each in Chromium, Firefox and WebKit, except a touch scroll of a list
portalled into a shadow root, which only Chromium can drive.

Each test written for this module was proven by changing the code and watching a test fail. The suites taken from
Ark UI, Base UI, Headless UI and React Aria run that library's own cases against this code. Each file's header
names its source and every case left out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 284 | `select.ark.test.tsx` 8, `select.base-ui.test.tsx` 12, `select.headless.test.tsx` 49, `select.radix.test.tsx` 65, `select.react-aria.test.tsx` 7, `select.test.tsx` 143 |
| End to end | 34 | `select.e2e.ts` 25, `select.radix.e2e.ts` 9 |
| registry-ui | 11 | `select.test.tsx` 11 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>318 behaviours, one per test</summary>

**Unit, `select.ark.test.tsx`**

- Ark UI select
  - has no axe violations
  - shows the item picked on its trigger, and closes on the pick
  - stays shut while disabled
  - picks several items when multiple, staying open
  - opens when its owner tells it to through onOpenChange
  - mounts its items only while open, and unmounts them on close
  - marks its trigger required for assistive technology
  - focuses its trigger on a click of the label naming it

**Unit, `select.base-ui.test.tsx`**

- Base UI select value
  - shows its placeholder with nothing picked, and the pick once there is one
  - shows the children it is given over the label and the placeholder
  - hands a render function the values picked
  - shows the label items give, and changes it as the value does
  - shows its placeholder with nothing picked when multiple
- Base UI select items
  - picks an item clicked and closes
  - picks no disabled item, neither on a click nor on Enter
  - takes its disabled state from the root
  - runs the onClick of an item once per click
  - focuses the picked item as it opens
  - picks the item a press of the trigger is dragged onto and released over, and no disabled one
  - picks nothing on a mouse up that follows a touch

**Unit, `select.headless.test.tsx`**

- Headless UI listbox safe guards
  - renders closed without crashing
  - renders in multiple mode without crashing
- Headless UI listbox uncontrolled
  - starts on its default value and tells onValueChange each new pick
- Headless UI listbox opening from the keyboard
  - opens on Enter with its first option active
  - opens on Enter on its picked option
  - stays closed on Enter while disabled
  - opens on Enter with no option active when it has none
  - opens on Enter on its first option that is not disabled, past several that are
  - opens on Space with its first option active
  - opens on Space on its picked option
  - stays closed on Space while disabled
  - opens on Space with no option active when it has none
  - opens on Space on its first option that is not disabled, past several that are
  - opens on ArrowDown with its first option active
  - opens on ArrowDown on its picked option
  - stays closed on ArrowDown while disabled
  - opens on ArrowDown with no option active when it has none
  - opens on ArrowDown on its first option that is not disabled, past several that are
  - opens on ArrowUp with its first option active
  - opens on ArrowUp on its picked option
  - stays closed on ArrowUp while disabled
  - opens on ArrowUp with no option active when it has none
  - opens on ArrowUp on its first option that is not disabled, past several that are
- Headless UI listbox keys while open
  - picks the active option on Enter and closes, giving focus back to its trigger
  - picks the active option on Space and closes, giving focus back to its trigger
  - closes on Escape, giving focus back to its trigger
  - moves down on ArrowDown and up on ArrowUp, past disabled options
  - stays on its one option that is not disabled on ArrowUp and ArrowDown
  - moves to the last option on End, past disabled options
  - moves to the last option on PageDown, past disabled options
  - moves to the first option on Home, past disabled options
  - moves to the first option on PageUp, past disabled options
- Headless UI listbox typeahead
  - moves to the option a whole word names
  - moves to the option the start of a word names, whatever the case
  - takes a search with a space in it
  - passes over a disabled option
  - stays on its option while the letters typed still match it
- Headless UI listbox with the mouse
  - focuses its trigger on a click of the label naming it
  - opens on a press of its trigger on its picked option
  - stays closed on a right press, and on a press while disabled
  - opens on a programmatic click of its trigger
  - closes on a press outside it
  - makes the option the pointer moves over active, and none once it leaves, passing over a disabled option
  - picks an option clicked and closes, and does nothing on a click of a disabled option
  - makes an option active when it takes focus
- Headless UI listbox picking many
  - opens on its first picked option, stays open as the keyboard picks, and toggles an option clicked
- Headless UI listbox in a form
  - submits the value it holds
  - submits nothing while disabled
  - hands its native select the form it names

**Unit, `select.radix.test.tsx`**

- aria-controls
  - should not reference a non-existent element while closed
  - should reference the rendered content while open
- clearing an optional value (#2706)
  - allows a `Select.Item` with an empty string value to be rendered
  - marks the empty value item as selected when the value is empty
  - shows the placeholder (not the item text) when the empty value item is selected
  - lets the user reset a previously selected value back to the placeholder
  - renders a single empty native option when a clear item is provided
- handlers with a narrower parameter type than the prop
  - accepts an `onValueChange` handler typed with the item values on a controlled select
  - accepts an `onValueChange` handler typed with the item values on an uncontrolled select
  - accepts an `onOpenChange` handler typed with a narrower parameter
- given all select items are disabled
  - positions content relative to the trigger
- disabled item
  - does not select a disabled item that is clicked
  - still calls a consumer-provided `onClick` on a disabled item
- keys from focusable descendants
  - does not select an item from Space/Enter typed into a portaled focusable descendant
  - still selects the item via Enter when the item itself is focused
- Select ref stability
  - keeps a stable composed ref on Content
  - keeps a stable composed ref on Item
  - keeps a stable composed ref on ItemText
- given a Select in a form that is reset &gt; uncontrolled
  - should restore its `defaultValue` when the form is reset
  - should restore the placeholder when reset with no initial value
- given a Select in a form that is reset &gt; controlled
  - should restore its initial `value` when the form is reset
- given a Select in a form that is reset &gt; external form association
  - should restore its `defaultValue` when reset from an external form
  - should restore its initial `value` when reset from an external form
- Select.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.Icon
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.Content
  - spreads props it does not consume onto the element it renders with `position="item-aligned"`
  - forwards props to the child element when `asChild` is set with `position="item-aligned"`
  - spreads props it does not consume onto the element it renders with `position="popper"`
  - forwards props to the child element when `asChild` is set with `position="popper"`
- Select.Viewport
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.Group
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.Label
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.Item
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.ItemIndicator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.ScrollUpButton
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.ScrollDownButton
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.Separator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.Arrow
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Select.BubbleInput
  - spreads props it does not consume onto the element it renders
- Select.Value
  - spreads unknown props and the ref onto the element it renders
  - applies the consumer's `className` and `style`
  - forwards props to the child element when `asChild` is set
- Select.ItemText
  - spreads unknown props and the ref onto the element it renders
  - applies the consumer's `className` and `style`
- bubble input change events
  - does not bubble a programmatic value change to ancestor `onChange` listeners
  - bubbles a user-driven value change to ancestor `onChange` listeners
  - bubbles a typeahead value change to the parent form
  - does not bubble a user-driven value change when the consumer stopped propagation
  - does not bubble a programmatic update after a selection that did not change the value
  - bubbles a user-driven value change once when the controlled parent applies it after a timeout
  - bubbles a user-driven value change once when the controlled parent applies it in a transition
  - bubbles the value a controlled parent applies in place of the user-selected one
  - bubbles a user-driven value change that the controlled parent ignores, without applying it
  - does not bubble a user-driven value change when the consumer stopped propagation and the controlled parent applies it later

**Unit, `select.react-aria.test.tsx`**

- React Aria select typeahead on the closed trigger
  - picks the next item starting with a letter typed twice quickly, not one starting with it twice
  - moves on to the next item on the same letter typed again after a pause
  - wraps to the first match once no item after the picked one matches
- React Aria select
  - focuses its trigger with autoFocus
  - moves on each repeat of an arrow key held down in the open list
  - disables its native select while disabled
  - goes back to its default value on a reset of its form, given no name

**Unit, `select.test.tsx`**

- Select
  - renders trigger with data-slot="select-trigger"
  - trigger has role="combobox"
  - trigger has type="button"
  - trigger has aria-expanded=false when closed
  - trigger has data-state="closed"
  - trigger has data-state="open" while open
  - trigger has aria-autocomplete="none"
  - shows placeholder text
  - shows data-placeholder when no value selected
  - disabled trigger has disabled attr
  - forwards ref to trigger
  - calls onOpenChange on trigger keyboard events
  - opens on Enter key
  - opens on Space key
  - shows selected value instead of placeholder
  - value element has data-slot="select-value"
  - value element shows placeholder text
  - value element has pointer-events none
  - points aria-controls at the content only while it is open
  - passes className to trigger
  - sets dir on trigger
  - required select has aria-required
  - shows the placeholder when the value clears
  - shows the placeholder when the picked item leaves in the update that clears the value
  - shows string children given while the picked item text is shown
  - slots an element child with asChild
  - refuses asChild with a render function, which gives it no element to slot onto
- Select item indicator and arrow
  - draws the indicator on the selected item only
  - draws no arrow when the content sits over the trigger rather than beside it
  - draws no arrow while closed, though its content is kept mounted
- Select with the pointer
  - opens on a mouse press and claims it
  - opens nothing on a ctrl press
  - releases the pointer capture the press would otherwise keep on the trigger
  - keeps the item under the pointer when the opening press is released without moving
  - selects the item a press is dragged onto and released over
  - closes when a dragged press is released outside the content
  - selects an item on a tap, where a mouse selects on release
  - stays shut on a press while disabled
  - stays shut on a mouse press inside a disabled fieldset, as a native select does
  - stays shut on a tap inside a disabled fieldset, as a native select does
  - stays shut on a key inside a disabled fieldset, as a native select does
  - takes the click after a mouse press as part of that press, so the next keyboard open selects on release
  - leaves selecting to the release when a mouse clicks an item
  - leaves focus alone when a touch moves over an item
  - keeps focus on an item when the mouse leaves another
  - focuses the item a mouse moves over
  - hands focus back to the list when the mouse moves onto a disabled item
  - hands focus back to the list when the mouse leaves the focused item
- Select keyboard on the trigger
  - picks the next item after the selected one that a typed letter starts
  - steps on from its last match when the owner keeps the value
  - takes a space typed as part of a search as part of it, not as a key that opens
- Select keyboard in the list
  - focuses the item a typed letter starts
  - keeps Tab from leaving the list
  - moves to the last item on Shift+G, rather than searching for a G
  - selects with Space and keeps the page from scrolling
  - takes a space typed as part of a search as part of it, not as a select
  - moves with the arrows past the disabled item, and to the ends with Home and End
- Select items whose element never takes the ref
  - leave focus where it is when a typed letter matches one
  - are passed over by a search when they show no text the list can read
  - are passed over by a search on the closed trigger when they show no text it can read
- Select typeahead text
  - finds an item by the label it shows now, not the one it mounted with
  - finds an item by the textValue it has now, not the one it mounted with
  - matches the item text rather than the rest of the item
  - reads the whole item when its item text shows nothing
- Select item-aligned position
  - lines the selected item text up under the value from the right, right to left
- Select with a list taller than its viewport
  - pins the list to the top and scrolls the selected item level with the trigger when it would overflow the top
  - scrolls down an item at a time while the pointer rests on the scroll-down button
  - shows the scroll-up button once scrolled, and scrolls up while it is pressed
  - grows with what the list is scrolled by, pinned to the bottom, up to the window less its margins
  - stops growing at the window less its margins, leaving any further scroll to the list
  - keeps its height and its place on a scroll event that scrolled nothing
  - grows without pinning to the bottom when it opened pinned to the top
  - scrolls once per tick while the pointer both rests on and presses the scroll-down button
  - scrolls nothing either way once the item it scrolls by has left the list
  - keeps the focused item in view when a scroll button appears, in the page
  - keeps the focused item in view when a scroll button appears, in a shadow root
  - focuses the picked item again when its first scroll button appears after it opened
  - keeps the viewport's bottom padding below the last item when it is the one picked
- Select closing
  - closes when the window loses focus
  - closes when the window resizes
  - stays open when focus is reported outside it while trapped
  - closes on Escape
  - gives the page back as soon as it starts to animate out: its pointer events, and focus that leaves
  - cancels a right click in the list, so no context menu opens over it
- Select in another root
  - opens on the picked item and moves one item at a time inside a shadow root
  - goes on to the next item a typed letter starts inside a shadow root
  - hands focus back to the list when the mouse leaves the focused item inside a shadow root
  - opens on the picked item and moves one item at a time inside an iframe
  - goes on to the next item a typed letter starts inside an iframe
  - hands focus back to the list when the mouse leaves the focused item inside an iframe
  - restores its pick on a reset of a form inside an iframe
  - keeps the item under the pointer when the opening press is released without moving inside an iframe
  - selects the item a press is dragged onto and released over inside an iframe
  - closes on a blur of the window of the iframe it is in
  - closes on a resize of the window of the iframe it is in
  - grows no taller than the window of the iframe it is in, less its margins
  - keeps inside the width of the iframe it is in, less its margins
  - keeps inside the width of the iframe it is in, less its margins, right to left
  - grows on a scroll no taller than the window of the iframe it is in, less its margins
  - lines up and grows by the window it runs in when its document has none of its own
- Select opening and closing
  - renders each item once as it opens as a popper, and again only the one it focuses
  - renders each item once as it opens aligned to the item, and again only the one it focuses
  - renders no item as it closes when it is given its items
  - renders each item once as it closes, into the hidden copy a closed select reads
- Select native options
  - shows the picked item once in the trigger, and lists each item once, while it animates out and after
  - lists each item once while the content stays mounted after closing
  - lists an item by the text it shows now, after that text changes
  - lists an item by the value it holds now, after that value changes
  - lists an item as disabled once it is disabled
- Select giving the page back on close
  - removes the content before it gives the page back its pointer events
- Select with items
  - renders none of its items while closed
  - shows the picked item's label from items
  - shows the label once while open
  - lists its items in the form
  - picks the next label a letter typed on the closed trigger starts, passing over a disabled item
  - picks the first label a letter typed on the closed trigger starts while nothing is picked
  - puts the label in the HTML a server renders
  - shows children given to the value in place of the label
  - shows the label of an item picked from the list
- Select with multiple
  - adds a picked item and stays open, and a second pick takes it out
  - adds the first pick of a select made multiple after it mounted with nothing picked
  - picks the item a press is dragged onto and released over, and stays open
  - shows its picks in the order they were made, and its placeholder once none is left
  - shows the labels of a default value while closed
  - takes the labels of its picks from items, on the server too
  - marks its list multiselectable and says on every option whether it is picked
  - leaves a single select out of aria-multiselectable
  - draws the indicator on every pick
  - toggles the focused item with Enter and Space and stays open
  - picks nothing when a letter is typed on its closed trigger
  - opens on its first pick, and keeps focus where it is when that pick is taken out
  - hands a function child its picks, and a single select its one value as a list
  - holds each pick in its native select, and refuses a required submit with none
  - takes the picks its native select is given, as autofill gives them
  - tells the form about each pick once, and calls onValueChange once for it
  - calls onValueChange once for each pick when its parent holds the value
  - sends the form no change when its parent passes an equal array afresh
  - gives back the picks it started with on a form reset
- Select and its native select in a form
  - restores its starting value on a reset of a form named by form that mounts after it
  - keeps its value when a handler cancels the reset
  - puts the native select back when a controlled owner refuses an autofilled value
  - hands an autofilled value to the select as well as to the native select's own onChange
  - resets the native select to its starting value after new options remount it

**End to end, `select.e2e.ts`**

- Select
  - a required select left empty refuses to submit, and shows its placeholder
  - the keyboard opens it, steps past a disabled item, and Escape closes it back to the trigger
  - a click opens labelled groups, and a pick closes it and fills the form until a reset
  - typing on the closed trigger picks the first match without opening it
  - a value set from outside shows on the trigger, and the list opens on that item
  - a click opens labelled groups, and a pick closes it and fills the form until a reset given items
  - typing on the closed trigger picks the first match without opening it given items
  - a value set from outside shows on the trigger, and the list opens on that item given items
  - a pick shows once on the trigger and once in the form, while the list fades out and after
  - a select in a disabled fieldset opens on neither a click nor a key, as a native select does
  - a disabled select does not open
  - right-to-left reaches the trigger and the list
  - popper opens below the trigger, and item-aligned lays the chosen item over it
  - a list taller than its box shows scroll buttons that scroll it
- Select with multiple
  - stays open through clicks, shows the picks in the order made, and submits each one
  - stays open through clicks, shows the picks in the order made, and submits each one given items
  - the keyboard toggles items with Space and Enter, and the list opens again on the first pick
  - a required one left empty refuses to submit, and a reset clears its picks
  - item-aligned lays the first pick over the trigger, and the list holds still through picks
- Select in another root
  - opens on the picked item and moves one item at a time inside an iframe
  - goes on to the next item a typed letter starts inside an iframe
  - opens on the picked item and moves one item at a time inside a shadow root
  - goes on to the next item a typed letter starts inside a shadow root
  - keeps the list open when the press that opened it is released over the picked item inside an iframe
  - closes when focus leaves the iframe it is in

**End to end, `select.radix.e2e.ts`**

- Select &gt; given a select inside a form
  - should submit and react to changes
- Select &gt; given a select with no value
  - should display the placeholder
  - can be reset to the placeholder
  - submits an empty value after being reset to the placeholder
- Select &gt; given an open select whose value changes externally
  - keeps the positioned content stable
- Select extension overlay interactions
  - closes when an external overlay stops later mouse events
- Select nested in Dialog
  - dismisses only the select when clicking inside dialog outside select
- Select nested in Popover
  - dismisses only the open select when clicking another select trigger
- Select (shadow DOM) &gt; given a select with a shadow DOM portal
  - should remain open after touch-scrolling and allow item selection

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-select` 2.3.7, the version the benchmarks run. 2.4.1, the latest, has since taken an
empty `value`, the two halves of the root (as `unstable_Provider` and `unstable_BubbleInput`) and the touch scroll in
a shadow root from this section, and from Fixed the form reset, the bubbling `change`, keys from a portalled
descendant, the first item lined up when every item is disabled, and `aria-controls` only while open. It still
drops `className` and `style` on `Select.Value` and `Select.ItemText`, and still has each iframe, shadow root and
fieldset defect under Fixed.

- A `Select.Item` may take an empty `value`, which clears the selection and shows the placeholder.
- `Select.Provider` and `Select.BubbleInput` are the two halves of `Select.Root`, for placing the native
  select by hand or giving it props.
- `Select.Value` and `Select.ItemText` take `className` and `style`, which Radix drops. The value keeps
  `pointer-events: none` over any style given.
- Content portalled into a shadow root stays open after a touch scroll of its list, since the event's
  composed path decides what counts as outside.
- `items` on `Select.Root`, a list of `{ value, label, disabled? }`, lets a closed select render none of its
  items. The trigger's label, the native `<select>` options and typing on the closed trigger all come from the
  list, and the label is in the server's HTML, where without `items` it appears only once the browser has
  rendered the items. Children given to `Select.Value` still win over the label. Base UI's `items` and Ark's
  collection do the same job. Without `items` nothing changes.
- `multiple` on `Select.Root` holds a list of values, as Base UI, Ark and React Aria can. `value`,
  `defaultValue` and `onValueChange` then take and give `string[]` in the order the values were picked, typed
  from the prop. A pick toggles its item and leaves the list open, `Select.Value` shows the picked labels
  joined by ", ", and the listbox carries `aria-multiselectable` with `aria-selected` on every option. The
  native select is a `<select multiple>`, so a form gets `name` once per value, `required` asks for one pick
  and a reset restores the starting list. Typing on the closed trigger picks nothing, since the pick would be
  out of sight, and item-aligned content lines up the first pick and holds still while picks are made.
- A function given to `Select.Value` as its child is called with the picked values, a single select's one
  value as a list, and not while nothing is picked.
- PageUp and PageDown move to the first and last item in the open list, as Home and End do and as the menus here
  do.

## Fixed

- A form reset is heard once it has bubbled, from the form the select belongs to then, so a form named by `form`
  that mounts after the select resets it, and a reset a handler cancels leaves it alone.
- The hidden native select resets to the starting value even after new options remount it, and goes back to the
  owner's value when the browser changes it, as autofill does, and a controlled owner refuses the change. An
  `onChange` given to `Select.BubbleInput` runs beside its own handler, where it replaced it.
- Passes every Radix select test.
- A form reset restores the starting value, including a form named by `form` that does not contain the
  trigger.
- A pick by the user fires a bubbling `change` from the hidden select, even one a controlled parent has
  not applied yet, unless the item's handler stopped propagation.
- Keys pressed in a focusable element portalled out of an item no longer select that item.
- With every item disabled, item-aligned positioning lines up the first item instead of nothing.
- The trigger sets `aria-controls` only while open, since a closed select has no listbox.
- `Select.Value` with `asChild` renders its child with the text inside, where it rendered nothing.
- A closed select whose content is force mounted or animating out lists each item once in its native
  `<select>`, where React warned about duplicate keys.
- Typing the name of the focused item keeps focus on it, where a full match counted as a miss and moved
  focus to the next item on the last key.
- `Select.Content`, `Select.Item` and `Select.ItemText` keep one composed ref across renders, so a child
  ref that sets state no longer loops.
- Typeahead searches the text an item shows now and the `textValue` it has now, where it kept the first of
  either it saw.
- Inside an iframe or a shadow root, the list opens with focus on the picked item, the arrow keys move one item
  at a time and a typed letter goes on to the next item it starts. Each check of which element had focus read the
  top document, which names only the iframe or the shadow host, so focus went on to the list itself, the arrow
  keys skipped an item and typeahead stayed put, as Radix's still does.
- Inside an iframe or a shadow root, the mouse leaving the focused item hands focus back to the list, and a scroll
  button appearing keeps the focused item in view, which read the top document the same way.
- Inside an iframe, the press that opened the list can be released over the picked item without picking it, the
  list closes when the iframe's window loses focus or is resized, and item-aligned content keeps inside that
  window, growing on a scroll no taller than it. Each listened to or measured the top window, as Radix's still
  does.
- A select inside a disabled `<fieldset>` stays shut on a press, a tap or a key, as a native select does. The
  fieldset disabled its trigger, but only the select's own `disabled` was read (Radix issue 2417).
- In development under StrictMode, a letter typed before React ran the trigger's or the list's mount
  effects stayed in the search, so the next letter, however much later, searched for both. The replayed
  cleanup cleared the timer that empties the search.
- Inside an iframe, a form reset restores the starting value. The select checked the form with
  `instanceof HTMLFormElement`, which is false for a form from another window, so it never heard the reset.
- An item's option in the hidden native `<select>` shows the text the item shows now, where it kept the label
  the item had before a change. It read the text while rendering, before React had written the new one.

## Smaller and faster

- Registering the native options no longer rerenders every part of the select.
- With `items`, a closed select renders none of its items, so a hundred mount in 0.59 of Ark UI's time and
  0.16 of Radix's, and unmount in 0.49 of Ark UI's.
- Opening renders each item once, and again only the one it focuses, where each rendered three times. The
  content's viewport, selected item and positioned state sit in a context the items do not read. A select
  opens in 0.84 of Ark UI's time and 0.81 of Base UI's.
- An item and its `Select.ItemText` each render once on mount, where storing the text took each a second
  render.
- Closing renders no item when the select has `items`, where each rendered once, and otherwise renders each
  once, into the hidden copy a closed select reads, where each rendered twice. Whether the select is open sits in
  a context of its own, which the items do not read, and the hidden copy mounts once the content has left,
  after any exit animation, so the two are never on the page together. Without `items`, a select of 200 closes
  about 0.4 ms sooner; with ten, or with `items`, the time is the same within noise.
- The page gets its pointer events and scroll back once the content has left or started its exit
  animation, so closing does not restyle the whole page. With 2,000 elements on the page a Select closes
  in 2.49ms against Radix's 2.84.

## Breaking changes

- A change made through `value` dispatches a `change` that does not bubble, so a form's `onChange` no
  longer hears it.

## registry-ui

- `SelectContent` and `MotionSelectContent` draw one highlight that slides to each item as it takes focus,
  so a fast pointer passes over every item in between. It appears in place on the first item, fades out
  when focus leaves the items, and does not slide under `prefers-reduced-motion`. The primitive's focus
  model is unchanged.
- `SelectItem` no longer paints its own focused background.
- A `className` or `style` given to `SelectValue` reaches its span.
- A new example shows the list as the select mounts, through `defaultOpen`, for a value edited on demand.
