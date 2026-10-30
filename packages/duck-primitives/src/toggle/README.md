# Toggle

A button that stays pressed until it is pressed again.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/toggle` |
| API docs | [`duck-primitives/api/toggle.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/toggle.mdx) |
| Styled component | [`registry-ui/src/toggle`](../../../registry-ui/src/toggle) |
| Styled docs | [`duck-ui/components/toggle.mdx`](../../../../apps/duck/content/docs/duck-ui/components/toggle.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 4. Faster in 11 of 12 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI |
|---|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 1,795 | 3,020 (0.59x) | 4,427 (0.41x) | 12,225 (0.15x) | 6,159 (0.29x) |
| Mount x100, ms | 1.16 | 1.34 (0.87x) | 1.64 (0.71x) | 4.38 (0.27x) | 1.85 (0.63x) |
| Update x100, ms | 0.534 | 0.576 (0.93x) | 0.773 (0.69x) | 3.52 (0.15x) | 1.29 (0.41x) |
| Unmount x100, ms | 0.382 | **0.328 (1.16x)** | 0.433 (0.88x) | 0.669 (0.57x) | 0.516 (0.74x) |

Where gentleduck is behind:

- Unmount x100 against Radix: 1.16x, 0.054 ms more.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.1.18, Base UI 1.0.0-rc.0, React Aria 1.22.1 and Ark UI 5.40.0.
<!-- /benchmarks -->

## Tests

The stories cover a toggle with a render function, one starting pressed, a controlled one whose owner can refuse a
change, and `asChild` with an `onClick` that prevents the change. The end-to-end suite drives each of them in
Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 31 | `toggle.radix.test.tsx` 9, `toggle.test.tsx` 22 |
| End to end | 5 | `toggle.e2e.ts` 5 |
| registry-ui | 6 | `toggle.test.tsx` 6 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>36 behaviours, one per test</summary>

**Unit, `toggle.test.tsx`**

- Toggle
  - renders with data-slot="toggle"
  - renders as a button with type="button"
  - takes a type passed to it over its own
  - is named Toggle in React DevTools
  - names itself when it switches from uncontrolled to controlled
  - starts unpressed by default
  - starts pressed when defaultPressed=true
  - toggles on click
  - calls onPressedChange on toggle
  - does not toggle when disabled
  - does not toggle when disabled and rendered as an element a click still reaches
  - works as controlled component
  - forwards ref
  - passes className through
  - leaves the direction to the document when no dir is passed
  - sets dir attribute
  - takes any dir an element takes, auto included, since it reads none
  - renders children as button text
  - multiple rapid clicks toggle correctly
- Toggle children as a function
  - renders what the function returns for the pressed state
  - follows a controlled pressed state
  - hands the element it returns to asChild

**Unit, `toggle.radix.test.tsx`**

- given a Toggle with text
  - should have no accessibility violations
  - should render with attributes as false/off by default
  - Click event should change pressed attributes to true/on
- given a Toggle with text and defaultPressed="true"
  - should render with attributes true/on by default
  - Click event should change attributes back to off/false
- given a Toggle with text and disabled="true"
  - on click the attributes do not change
- given a controlled Toggle (with pressed and onPressedChange)
  - Click event should keep the same attributes, and pass the new state to onPressedChange
- Toggle.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**End to end, `toggle.e2e.ts`**

- Toggle
  - a click, Space and Enter each flip it, and the render function reads the state
  - defaultPressed starts it on, and it stays independent of the one beside it
  - disabled, it neither flips nor takes focus
  - controlled, it reports each press and moves only when its owner follows
  - asChild hands its state, class and ref to the child, and an onClick that prevents default keeps it as it is

</details>
<!-- /behaviour -->

## Beyond Radix

- Children can be a function of the pressed state, as React Aria's `ToggleButton` takes, for content that
  changes with it, such as a muted icon. With `asChild` the function returns the element to render. Ark's
  `Toggle.Indicator` does the same job through a context; this needs none.

## Fixed

- Passes every Radix toggle test.
- `dir` takes any value an element takes, `auto` included. It was typed `'ltr' | 'rtl'`, though the button only
  writes it to the attribute.

## Smaller and faster

- Drops the context it provided. Nothing read it, and providing it made every toggle mount and update about
  1.1 times slower than Radix's.
- Stops resolving its direction, which it only wrote to the `dir` attribute the page already passes down.

## Breaking changes

- `createToggleScope`, `IToggle.IContext` and `IToggle.IScoped` are gone.
- Without a `dir` prop the button carries no `dir` attribute, where it carried `dir="ltr"`.

## registry-ui

- `Toggle` and `MotionToggle` take a function of the pressed state as their children, and `MotionToggle`
  animates what it returns.
- Both stop setting the `data-slot` the primitive already sets.
- A new example swaps a volume icon as the toggle turns on. The examples drop icon size classes the
  toggle already applies, and a class that turned one toggle from `inline-flex` into a block.
- Two more examples: a controlled toggle that shows and hides a password, and one that starts pressed with
  `defaultPressed` and says what its state means.

## Later

- Base UI hands `onPressedChange` the event details, through which a handler can cancel the change.
