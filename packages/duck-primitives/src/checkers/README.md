# Checkers

The `useSvgIndicator` and `useCheckedSync` hooks behind the native-input checkbox and switch.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/checkers` |
| API docs | [`duck-primitives/api/checkers.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/checkers.mdx) |
| Styled component (checkbox) | [`registry-ui/src/checkbox`](../../../registry-ui/src/checkbox) |
| Styled docs (checkbox) | [`duck-ui/components/checkbox.mdx`](../../../../apps/duck/content/docs/duck-ui/components/checkbox.mdx) |
| Styled component (switch) | [`registry-ui/src/switch`](../../../registry-ui/src/switch) |
| Styled docs (switch) | [`duck-ui/components/switch.mdx`](../../../../apps/duck/content/docs/duck-ui/components/switch.mdx) |

Radio group has its own README in [`../radio-group`](../radio-group).

## Benchmarks

<!-- benchmarks -->
No other library ships one to compare with. The module is 945 bytes gzipped.

A hook for a native checkbox or switch to draw its own indicator; none of the other libraries ships one.
<!-- /benchmarks -->

## Tests

The stories cover a checkbox masked by three indicators, one written without the SVG namespace, and set to mixed
from a button; a switch masked by its thumb; an indicator swapped while it shows; a checkbox its owner holds, changed
from outside, inside a form that counts what it hears and can be reset; one that keeps its own state in a form; and
one its owner holds with no form around it. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 22 | `checkers.test.tsx` 22 |
| End to end | 9 | `checkers.e2e.ts` 9 |
| registry-ui | 80 | `checkbox.radix.test.tsx` 26, `checkbox.test.tsx` 20, `motion-checkbox.test.tsx` 3, `switch.radix.test.tsx` 13, `switch.test.tsx` 18 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>31 behaviours, one per test</summary>

**Unit, `checkers.test.tsx`**

- useSvgIndicator
  - sets each indicator it is given as a variable
  - sets nothing for an indicator it is not given
  - reads an indicator again when it changes
  - drops an indicator that is taken away
  - keeps its hidden markup mounted while the owner renders again
  - hides the markup it reads from
  - renders a hidden node only for an indicator it is given
  - reads an indicator with space around its svg as the svg alone
  - adds the SVG namespace an image needs when the markup leaves it out
  - keeps a namespace the markup already declares
- useSvgIndicator with hostile text in the markup
  - stays an SVG image inside one quoted url()
  - spawns no live script
- useCheckedSync
  - tells the form of a checked set from outside, and runs none of the input's handlers
  - tells the form of each value set from outside, a change back included
  - hands a click after a value set from outside to the input's handlers
  - tells the form nothing when the owner stops holding the value
  - sends nothing outside a form
  - hands a click and its change to the input's handlers
  - tells the form nothing of a value it already heard from a click
  - puts the owner's value back after a reset the owner does not follow
  - leaves an input that keeps its own state to the reset
  - puts nothing back once it unmounts

**End to end, `checkers.e2e.ts`**

- Checkers
  - hands over every indicator as an image that decodes, one written without a namespace included
  - masks the input with the indicator of the state it is in
- Checkers switch
  - masks a switch with the thumb of the state it is in, and toggles on Space
- Checkers indicator
  - redraws the mask when the indicator it was given changes
- Checkers useCheckedSync
  - tells the form about a change its owner makes, as a click would
  - hands a click to its owner and to the form once
  - goes back on what its owner holds after a form reset the owner does not follow
  - leaves an input nobody holds to its own state, so a form reset puts its default back
  - follows its owner with no form to tell

</details>
<!-- /behaviour -->

## Features

- `indeterminateIndicator` is set as `--svg-indeterminate` beside `--svg-off` and `--svg-on`, with an
  `indeterminateIndicatorReady` flag.
- `useCheckedSync` keeps a native checkbox's form in step with the `checked` its owner sets. A change from
  outside reaches the form as a bubbling click, as Radix's hidden input sends it, without running the
  input's own `onChange` or `onClick`. A form reset the owner does not follow is undone before the next
  paint. Code that imports only `useSvgIndicator` leaves it out of its bundle.

## Fixed

- The indicators are read again after every render, so one that changes is redrawn and one taken away
  clears its variable, where each was read once on mount.
- They are read before paint, so a custom indicator no longer flashes the default as it mounts.
- The returned `SvgIndicator` keeps one identity, where it was a new component every render and remounted
  its hidden markup.
- An `<svg>` written without `xmlns` gets the SVG namespace, without which it drew nothing.

## Smaller and faster

- The hook encodes the markup itself and no longer bundles `mini-svg-data-uri`: 945 bytes with `useCheckedSync` added, from 1,661.

## Breaking changes

None in the hooks. The checkbox's is under registry-ui.

## registry-ui

Checkbox:

- `indeterminateIndicator` for the mixed state; without one it draws a short bar, which sat a third of
  the box too low.
- A `ref` reaches the input, where any ref crashed the checkbox on mount.
- A controlled checkbox stays on `checked` until that changes, where a click moved it on its own.
- The server's HTML draws the checked and mixed states, so the box no longer changes after hydration.
- A form reset puts it back on `defaultChecked`, or the `checked` it was first given, and calls
  `onCheckedChange`. The input's `defaultChecked` follows a later `defaultChecked`.
- `indicator` shows while unchecked, `checkedIndicator` is drawn upright at full size, and with only
  `indicator` checking draws the check mark.
- Breaking: a checkbox given `checked` without `onCheckedChange` no longer moves on a click. A subtask's
  `checked` in `CheckboxGroup` is where it starts and no longer moves it once mounted.

Switch:

- `Switch` and `MotionSwitch` leave their state to the native input and drop `aria-checked`, which only
  repeated it.
- With only `indicator`, the thumb is plain while on.
- A form reset calls `onCheckedChange` with the value it puts the switch back on, and `MotionSwitch` moves
  its thumb back.

Both:

- A `checked` set from outside, inside a form, fires the form's `onChange` as a click would, where the
  form heard nothing. The component's own `onChange`, `onClick` and `onCheckedChange` do not run, and a
  move between unchecked and mixed, which the box shows the same way to the form, fires nothing.
- A controlled checkbox or switch whose owner does not follow a form reset goes back to its `checked`
  before the next paint, where it showed the reset value while its prop said otherwise.

## Later

Nothing parked.
