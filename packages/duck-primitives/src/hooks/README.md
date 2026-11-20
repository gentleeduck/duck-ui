# Hooks

The hooks the components are built from. Each is its own entry point, `@gentleduck/primitives/hooks/<name>`.

| Hook | Does | Radix's |
|---|---|---|
| `useCallbackRef` | A function that never changes identity and always calls the latest callback | `react-use-callback-ref` |
| `useControllableState` | One `[value, setValue]` over a controlled `prop` or an uncontrolled `defaultProp` | `react-use-controllable-state` |
| `useEscapeKeydown` | Calls back on Escape anywhere in a document | `react-use-escape-keydown` |
| `useFocusGuards`, `FocusGuards` | Keeps a focusable guard at each edge of the body while any user is mounted | `react-focus-guards` |
| `useId` | A stable id, or the one it is given | `react-id` |
| `useLayoutEffect` | React's layout effect, and nothing on the server | `react-use-layout-effect` |
| `usePrevious` | The value before the last change | `react-use-previous` |
| `useSize` | An element's border-box size as it changes | `react-use-size` |
| `useStateMachine` | `[state, send]` over a transition table | inside `react-presence` |

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/hooks/*` |
| API docs | [`duck-primitives/api/hooks.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/hooks.mdx) |
| Used by | every component; registry-ui's `Tabs`, `Checkbox` and `NavigationMenu` import `useControllableState` and `useLayoutEffect` directly |

## Tests

The stories cover Escape heard anywhere on the page but not one ending an IME composition; two users of the focus
guards sharing one pair however they come and go, removed with the last; a box whose height is set from the width `useSize` reports; a
controlled and an uncontrolled switch, each reporting a change once; the value before the last change kept through
two renders that change nothing; a player machine ignoring an event its state does not take and reading two sends in
one handler in order; and two fields, each label naming its own input by `useId`. The end-to-end suite runs each
in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

`use-size.radix.test.tsx`, `use-controllable-state.radix.test.tsx` and `focus-guards.radix.test.tsx` hold Radix's
tests for those hooks, from its main branch.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 80 | `focus-guards.radix.test.tsx` 8, `hooks-extra.test.tsx` 2, `hooks.test.tsx` 35, `use-controllable-state.radix.test.tsx` 7, `use-focus-guard.test.tsx` 6, `use-size.radix.test.tsx` 12, `use-size.test.tsx` 10 |
| End to end | 7 | `hooks.e2e.ts` 7 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>87 behaviours, one per test</summary>

**Unit, `focus-guards.radix.test.tsx`**

- useFocusGuards
  - injects a single pair of guards at the edges of &lt;body&gt;
  - does not duplicate guards when multiple consumers mount
  - removes the guards only after the last consumer unmounts
  - does not write to the DOM when an extra consumer mounts and the guards are already in place
  - re-asserts the trailing guard as the last child when a node is appended after it
- FocusGuards
  - renders text children
  - renders JSX children
  - injects a single pair of guards at the edges of &lt;body&gt;

**Unit, `hooks-extra.test.tsx`**

- useLayoutEffect
  - is a function
  - runs synchronously during render in jsdom

**Unit, `hooks.test.tsx`**

- useCallbackRef
  - returns a stable function reference across renders
  - calls the latest callback
  - handles undefined callback without throwing
  - has the latest callback in place before a child's effect calls it in the same commit
- usePrevious
  - returns the previous value after an update
  - keeps the previous value through a render with the same value
  - leaves out a value from a render React threw away, as when a transition suspends and another replaces it
- useStateMachine
  - starts in the initial state
  - transitions on valid events
  - ignores invalid events
  - renders nothing for an event its state does not take
  - keeps send the same function through every transition
- useEscapeKeydown
  - calls handler on Escape keydown
  - does not call handler on other keys
  - cleans up listener on unmount
  - listens on the document it is given, as one inside an iframe
- useId
  - returns a deterministic ID when provided
  - takes an empty id as none given, as a blank id prop passes it
  - generates a prefixed ID when no deterministic ID is given
  - returns stable IDs across renders
- useControllableState
  - uses defaultProp when uncontrolled
  - uses prop when controlled
  - calls onChange when uncontrolled value changes
  - calls onChange when controlled value differs from prop
  - accepts a function updater
  - does not call onChange when setting the same controlled value
  - hands a controlled updater the controlled value, not the default
  - reports an uncontrolled change back to the value it started at
  - reports an uncontrolled change to the onChange it was given last
  - warns each time it switches between controlled and uncontrolled, the switch back included
  - works with boolean values
  - works with numeric values
- useStateMachine (edge cases)
  - handles rapid state transitions
- useControllableState in production
  - switches from uncontrolled to controlled without the development warning
- useLayoutEffect on the server
  - is a no-op rather than React's, which React 18 warns about there

**Unit, `use-controllable-state.radix.test.tsx`**

- useControllableState &gt; given a controlled value
  - should initially use the controlled value
  - should update the value when set internally
  - should update the value when set externally
- useControllableState &gt; given a default value
  - should initially use the default value
  - should update the value
- useControllableState &gt; switching between controlled and uncontrolled &gt; controlled to uncontrolled
  - should warn
- useControllableState &gt; switching between controlled and uncontrolled &gt; uncontrolled to controlled
  - should warn

**Unit, `use-focus-guard.test.tsx`**

- useFocusGuards
  - puts one focusable, invisible guard at each edge of the body
  - leaves the body alone when another consumer mounts with the guards in place
  - moves back only the guard that something was put in front of
  - removes the pair with the last consumer and makes a new one for the next
  - keeps one pair through the double effect of StrictMode
- FocusGuards
  - renders its children and guards the body while mounted

**Unit, `use-size.radix.test.tsx`**

- useSize
  - returns `undefined` when the element is `null`
  - provides the size synchronously from offset dimensions on mount
  - observes the element using the `border-box` box model
  - updates the size from `borderBoxSize` reported as an array
  - updates the size from `borderBoxSize` reported as a plain object
  - falls back to offset dimensions when `borderBoxSize` is unavailable
  - ignores empty or non-array observer payloads
  - resets the size to `undefined` when the element becomes `null`
- useSize &gt; requestAnimationFrame batching
  - defers observer-driven updates to the next animation frame
  - coalesces rapid observations, cancelling the previously scheduled frames
  - cancels a pending frame and un-observes on unmount
  - does not warn or error when unmounted before a pending frame runs

**Unit, `use-size.test.tsx`**

- useSize
  - applies a reported size on the next frame, not inside the observer callback
  - applies only the last of several reports in one frame
  - does not render again when a report repeats the size it already has
  - does not render for the first report when it matches the offset size
  - applies a change of height alone
  - measures the offset size when a report carries no border box
  - ignores a report with no entries
  - stops observing and drops a pending report on unmount
  - moves to a new element and drops a report still pending for the old one
  - returns undefined once the element is gone

**End to end, `hooks.e2e.ts`**

- useEscapeKeydown
  - hears Escape anywhere on the page, but not one that ends an IME composition
- useFocusGuards
  - keeps one pair of guards at the edges of the body while any user is mounted, however they come and go
- useSize
  - reports each size the element takes, a height set from the reported width included
- useControllableState
  - reports a change once in each mode, and a controlled value moves only when its owner moves it
- usePrevious
  - gives the value before the last change, through renders that change nothing
- useStateMachine
  - moves only on an event its state takes, reading two sends in one handler in order
- useId
  - gives each field its own id, so each label names its own input

</details>
<!-- /behaviour -->

## Beyond Radix

Against the versions Radix's components ship: `react-use-controllable-state` 1.2.6, `react-id` 1.1.4 and
`react-focus-guards` 1.1.6, as `@radix-ui/react-popover` 1.1.23 ships them, with `react-use-escape-keydown` 1.1.1,
`react-use-size` 1.1.4 and `react-use-previous` 1.1.4, the latest of each.

- `useEscapeKeydown` leaves an Escape pressed during an IME composition to the input method, which cancels the
  composition with it. Radix calls back for it, so a dialog closed while its user was cancelling a word.
- `useSize` applies a ResizeObserver report on the next animation frame, only the last of several in one frame,
  as Radix's main branch does. 1.1.4 applies each report at once, and a layout change made in response loops the
  observer. It also skips a report that repeats the size it has, which Radix applies, so the observer's first
  report, which repeats the size measured on mount, renders nothing.
- `useStateMachine` drops an event with no transition from the current state before it reaches React. Radix's,
  a reducer, schedules a render for it.
- `useId` returns React's `useId`. Radix's holds it in state behind a layout effect, with a counter for React 17,
  which this package does not support.

## Fixed

- `usePrevious` records a value when its render reaches the page. It recorded it while rendering, so a render
  React threw away, as when a transition suspends and another update replaces it, left its value behind as the
  previous one, as Radix's still does. `NavigationMenu` reads it to tell which way its content slides.

## Smaller and faster

Each hook against its Radix package, in bytes, minified and gzipped with everything it imports but React.

| Hook | gentleduck | Radix |
|---|--:|--:|
| `useCallbackRef` | 160 | 294 (1.1.5) |
| `useControllableState` | 326 | 1,107 (1.2.6, with `useControllableStateReducer`) |
| `useEscapeKeydown` | 294 | 260 (1.1.1) |
| `useFocusGuards` | 362 | 472 (1.1.6) |
| `useId` | 112 | 283 (1.1.4) |
| `useLayoutEffect` | 111 | 111 (1.1.4) |
| `usePrevious` | 169 | 220 (1.1.4) |
| `useSize` | 412 | 415 (1.1.4) |
| `useStateMachine` | 177 | - |

`useEscapeKeydown` is the one larger than Radix's: the 34 bytes are the check that leaves an IME composition alone.

## Later

- Radix's `react-use-controllable-state` 1.3.0 adds `useControllableStateReducer`, the same bridge over a
  reducer. No component here needs one yet.
