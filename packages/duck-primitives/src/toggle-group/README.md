# Toggle Group

A set of toggles where one or several are on, with roving focus.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/toggle-group` |
| API docs | [`duck-primitives/api/toggle-group.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/toggle-group.mdx) |
| Styled component | [`registry-ui/src/toggle-group`](../../../registry-ui/src/toggle-group) |
| Styled docs | [`duck-ui/components/toggle-group.mdx`](../../../../apps/duck/content/docs/duck-ui/components/toggle-group.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 4. Faster in all 12 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI |
|---|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 5,051 | 8,396 (0.60x) | 8,574 (0.59x) | 15,699 (0.32x) | 9,066 (0.56x) |
| Mount x100, ms | 5.98 | 15.0 (0.40x) | 10.5 (0.57x) | 20.2 (0.30x) | 8.86 (0.67x) |
| Update x100, ms | 2.94 | 9.64 (0.31x) | 3.98 (0.74x) | 16.7 (0.18x) | 6.53 (0.45x) |
| Unmount x100, ms | 1.09 | 2.03 (0.54x) | 1.56 (0.70x) | 2.08 (0.53x) | 1.10 (0.99x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.1.19, Base UI 1.0.0-rc.0, React Aria 1.22.1 and Ark UI 5.40.0.
<!-- /benchmarks -->

## Tests

The stories cover a single group with a render function and a disabled item, under right-to-left, vertical,
`loop={false}`, `deselectable={false}` and group-level `disabled`; a multiple group with and without roving focus;
and a controlled group whose owner can refuse a change. The end-to-end suite drives each in Chromium, Firefox and
WebKit. Roving focus moves focus in a timeout after the keydown, as Radix does, so the suite waits for each move
before the next key.

Each test written for this module was proven by changing the code and watching a test fail. The suites taken from
Ark UI and Base UI run that library's own cases against this code. Each file's header names its source and every
case left out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 73 | `toggle-group.ark.test.tsx` 6, `toggle-group.base-ui.test.tsx` 10, `toggle-group.radix.test.tsx` 17, `toggle-group.test.tsx` 40 |
| End to end | 13 | `toggle-group.e2e.ts` 12, `toggle-group.radix.e2e.ts` 1 |
| registry-ui | 9 | `toggle-group.test.tsx` 9 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>86 behaviours, one per test</summary>

**Unit, `toggle-group.ark.test.tsx`**

- Ark UI toggle group
  - has no axe violations
  - starts on its default value
  - tells onValueChange the item pressed
  - presses several items when multiple
  - presses nothing while disabled
  - loops focus from the last item to the first by default, and stops at the end with loop off

**Unit, `toggle-group.base-ui.test.tsx`**

- Base UI toggle group
  - renders a group, with no aria-orientation on it, once roving focus is off
  - moves focus with ArrowRight and ArrowLeft in ltr horizontal
  - moves focus with ArrowLeft and ArrowRight in rtl horizontal
  - moves focus with ArrowDown and ArrowUp in ltr vertical
  - moves focus with ArrowDown and ArrowUp in rtl vertical
  - moves focus to the first item on Home and the last on End
  - presses and releases an item on Enter
  - presses and releases an item on Space
  - presses one item at a time when single, checking it as a radio
  - disables the whole group, or one item

**Unit, `toggle-group.radix.test.tsx`**

- given a single ToggleGroup
  - should have no accessibility violations
- given a single ToggleGroup &gt; when clicking `One`
  - should have no accessibility violations
  - should have radiogroup role
  - should change value to `One`
- given a single ToggleGroup &gt; when clicking `One` &gt; then clicking `Two`
  - should change value to `Two`
- given a single ToggleGroup &gt; when clicking `One` &gt; then clicking `Two` &gt; and clicking `Two` again`
  - should change value to empty string
- given a multiple ToggleGroup
  - should have no accessibility violations
  - should have toolbar role
- given a multiple ToggleGroup &gt; when clicking `One`
  - should have no accessibility violations
  - should change value to `One`
- given a multiple ToggleGroup &gt; when clicking `One` &gt; and clicking `One` again`
  - should change value to empty array
- given a multiple ToggleGroup &gt; when clicking `One` &gt; then clicking `Two`
  - should add `Two` to value
- given a multiple ToggleGroup &gt; when clicking `One` &gt; then clicking `Two` &gt; and clicking `Two` again`
  - should change value to `One`
- ToggleGroup.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- ToggleGroup.Item
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `toggle-group.test.tsx`**

- ToggleGroup (single)
  - renders with data-slot="toggle-group"
  - renders items with data-slot="toggle-group-item"
  - selects an item on click
  - deselects previous when selecting another in single mode
  - calls onValueChange with selected value
  - supports defaultValue
  - is a radiogroup
- ToggleGroup roles
  - makes a multiple group a toolbar
  - makes a multiple group without roving focus a plain group, since its arrow keys do nothing
  - lets a role passed to it win
  - names its orientation when it has one
- ToggleGroup (multiple)
  - allows multiple items to be on
  - calls onValueChange with array of values
  - toggles item off when clicking again
  - supports defaultValue as array
- ToggleGroup (shared)
  - disabled group disables all items
  - items have data-state on/off
  - passes className to group
  - sets dir attribute
  - forwards ref
  - flips horizontal arrow keys under a DirectionProvider without a dir prop
- ToggleGroup without roving focus
  - puts every enabled item in the tab order and leaves a disabled one out
- ToggleGroup without a type
  - keeps one item on at a time
  - draws its items as radios
- ToggleGroup single values
  - shows one item on once a multiple group becomes single
  - keeps an item whose value is empty off, as the empty value it reports means
- ToggleGroup deselectable
  - keeps the item of a single group on when it is clicked again
  - still moves a single group to another item
  - keeps the last item of a multiple group on and lets the others go
- ToggleGroup.Item children as a function
  - renders what the function returns for each item as the value moves
  - hands the element it returns to asChild
- ToggleGroup wiring
  - forwards its ref as a multiple group too
  - reads an empty value as nothing on, so an item valued with the empty string starts off
  - follows a controlled multiple value, and reports a press its owner has not taken
  - loops from the last item to the first by default
  - writes its dir without roving focus too
  - hands its items its dir, and an item's own dir wins
  - draws its items as buttons that submit no form, with roving focus or without
  - hands its items the scope it is given
  - names the group and its item in React DevTools

**End to end, `toggle-group.e2e.ts`**

- ToggleGroup single
  - is a radio group whose items turn each other off, and the item on can be turned off
  - deselectable={false} keeps the item on when it is pressed again
  - Tab enters on the item that is on and leaves with the next Tab; the arrows move focus, skip a disabled item and wrap
  - Space and Enter turn the focused item on, and the render function reads its state
  - loop={false} stops the arrows at either end
  - right-to-left turns the left and right arrows around
  - vertical, it reads the up and down arrows and leaves left and right alone
  - disabled, it takes no click and no focus
- ToggleGroup multiple
  - is a toolbar of pressed buttons, each on or off by itself
  - deselectable={false} turns an item off only while another stays on
  - rovingFocus={false} makes it a plain group with every enabled item in the tab order
- ToggleGroup controlled
  - reports each press, moves only when its owner follows, and follows a value set from outside

**End to end, `toggle-group.radix.e2e.ts`**

- ToggleGroup &gt; given a ToggleGroup as the first focusable element inside a Dialog
  - should move focus into the group when the dialog opens

</details>
<!-- /behaviour -->

## Beyond Radix

- `deselectable={false}` keeps the last item on, as a segmented control needs, like `disallowEmptySelection`
  in React Aria and `deselectable` in Ark.
- An item's children can be a function of whether it is on, as `Toggle` takes. With `asChild` the function
  returns the element to render.

## Fixed

- Passes every Radix toggle-group test.
- A single group is a `radiogroup`, which its radio items need, and a multiple one a `toolbar`, as in Radix
  and React Aria, or a plain `group` when `rovingFocus` is off and the arrow keys do nothing. A `role`
  passed to the root wins.
- The root sets `aria-orientation` from `orientation` while roving focus is on.
- A group given no `type`, which only JavaScript allows, is single all the way through, where its items
  announced themselves as pressed buttons rather than radios.
- A single group shows at most one item on, the first, when it was multiple and kept the list it held, and an
  item whose value is empty stays off, since an empty value means nothing is on.

## Smaller and faster

- An item renders its own button, where Radix's renders a whole `Toggle` with a controllable state of its
  own for each item.
- An item takes its tab stop and keys from `useRovingFocusItem`, where it wrapped its button in
  `RovingFocusGroup.Item` and a collection slot.
- The root renders the group's element itself through `useRovingFocusGroup`, and a single and a multiple group are
  one component. A group rendered `ToggleGroupSingle` or `ToggleGroupMultiple`, then `ToggleGroupImpl`,
  `RovingFocusGroup`, its slot and `Primitive.div`.
- An item renders its button directly, where `Primitive.button` added a component to each.

## Breaking changes

- The root's role is `radiogroup` or `toolbar` where it was always `group`. Pass `role="group"` to keep the
  old one.
- An item carries no `data-collection-item` attribute.

## registry-ui

- `MotionToggleGroupItem` draws its sliding indicator from the item's own state in the first render. It
  read the state back from the DOM after paint, so the item that started on showed no indicator for a
  frame, and the server markup had none. It drops the `MutationObserver` and the state it kept.
- `MotionToggleGroup` drops a context that repeated the id its `LayoutGroup` already gives each `layoutId`.
- `ToggleGroupItem` and `MotionToggleGroupItem` take a function of whether the item is on as their children.
- `ToggleGroup` and `ToggleGroupItem` stop setting the `data-slot` the primitive already sets.
- In a multiple `MotionToggleGroup`, turning one more item on hid the indicators of the items already on,
  since they shared one `layoutId` and motion animated them as one element. Each item now fades its own.
- A vertical `ToggleGroup` lays its items out in a column, rounded at its top and bottom, where it kept them in a
  row rounded at the sides. An outline group's items share the border between them either way, and a group of
  one item keeps its end border.
- The examples name every group, `disabled` is shown on the group, and new examples show a controlled group
  that always has a value, a vertical group with a disabled item, and a multiple group summing up its value.

## Later

- Items still write the group's `dir` and the context carries it. `RadioGroup` dropped both from its items;
  doing the same here is breaking.
