# Progress

A bar showing how far a task has come, or that it is under way when the amount is unknown.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/progress` |
| API docs | [`duck-primitives/api/progress.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/progress.mdx) |
| Styled component | [`registry-ui/src/progress`](../../../registry-ui/src/progress) |
| Styled docs | [`duck-ui/components/progress.mdx`](../../../../apps/duck/content/docs/duck-ui/components/progress.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 4. Faster in 10 of 12 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI |
|---|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 2,464 | 2,847 (0.87x) | 2,928 (0.84x) | 4,641 (0.53x) | 8,297 (0.30x) |
| Mount x100, ms | 1.19 | **1.09 (1.09x)** | 1.64 (0.73x) | 2.21 (0.54x) | 3.75 (0.32x) |
| Update x100, ms | 0.563 | 0.617 (0.91x) | 1.24 (0.46x) | 1.83 (0.31x) | 3.27 (0.17x) |
| Unmount x100, ms | 0.346 | **0.310 (1.12x)** | 0.401 (0.86x) | 0.625 (0.55x) | 0.636 (0.54x) |

Where gentleduck is behind:

- Unmount x100 against Radix: 1.12x, 0.036 ms more.
- Mount x100 against Radix: 1.09x, 0.097 ms more.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.1.16, Base UI 1.0.0-rc.0, React Aria 1.22.1 and Ark UI 5.40.0.
<!-- /benchmarks -->

## Tests

The stories cover a bar stepped to `max` and back, an unknown amount, a value past `max`, a scale counted in
files through `getValueLabel`, one running from a minimum, a label shown and taken away, and a bar right to left
by its own `dir` and by the page's. The end-to-end suite runs each in Chromium, Firefox and WebKit.

registry-ui has no browser suite. Its tests check in jsdom that the bars write no `dir` and set no transform
origin, and the side `MotionProgress` grows from and the way its shimmer runs, on a right-to-left page and on a
left-to-right box inside one, were measured once in all three browsers.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 69 | `progress-libs.test.ts` 22, `progress.radix.test.tsx` 4, `progress.test.tsx` 43 |
| End to end | 9 | `progress.e2e.ts` 9 |
| registry-ui | 13 | `progress.test.tsx` 13 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>78 behaviours, one per test</summary>

**Unit, `progress.radix.test.tsx`**

- Progress.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Progress.Indicator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `progress.test.tsx`**

- Progress
  - renders with data-slot="progress"
  - has role="progressbar"
  - sets aria-valuemin, aria-valuemax, aria-valuenow
  - defaults max to 100
  - computes aria-valuetext as percentage
  - uses custom getValueLabel
  - sets data-state="loading" when value &lt; max
  - sets data-state="complete" when value === max
  - sets data-state="indeterminate" when value is null
  - forwards ref
  - value=0 is loading, not indeterminate
  - handles custom max value
  - sets data-value and data-max attributes
  - indeterminate has no aria-valuenow
  - passes className
  - sets dir attribute
  - takes any dir an element takes, auto included, since it reads none
  - leaves the direction to the document when no dir is passed
- Progress with invalid props
  - logs an invalid max and falls back to 100
  - logs nothing in production, and still falls back
  - logs nothing when no value is given, and is indeterminate
  - logs a max of 0 and falls back to 100
  - logs a value past max and renders it as indeterminate
- Progress min
  - measures the value from min
  - hands min to getValueLabel
  - logs a value below min and renders it as indeterminate
  - logs a max that is not above min and falls back to 100
  - falls back to a max 100 past a min that reaches 100, so the label stays a number
- Progress parts
  - hands its parts the scope it is given
  - names each part in React DevTools
  - hands the label and the value their refs
- ProgressIndicator
  - carries the root's value, max and state
- ProgressLabel
  - names the progress bar it sits in
  - keeps an id passed to it
  - stops naming the progress bar once it unmounts
  - leaves an aria-labelledby passed to the root alone
  - carries the state of the progress
- ProgressValue
  - shows the value as a percentage of max, hidden from assistive technology
  - shows the label the root formats
  - shows nothing while the progress is indeterminate
  - hands the label and the value to a render function
  - shows children it is given in place of the label
  - carries the state of the progress

**Unit, `progress-libs.test.ts`**

- progress.libs
  - DEFAULT_MAX is 100
- progress.libs &gt; isNumber
  - returns true for numbers
  - returns false for non-numbers
- progress.libs &gt; isValidMaxNumber
  - accepts positive numbers
  - rejects zero
  - rejects negative
  - rejects NaN
  - rejects non-numbers
- progress.libs &gt; isValidValueNumber
  - accepts values between 0 and max
  - rejects negative values
  - rejects values above max
  - rejects NaN
  - rejects non-numbers
- progress.libs &gt; getProgressState
  - returns indeterminate for null
  - returns indeterminate for undefined
  - returns complete when value equals max
  - returns loading when value is less than max
- progress.libs &gt; defaultGetValueLabel
  - returns percentage string
  - rounds to nearest integer
  - works with custom max
- progress.libs &gt; error messages
  - getInvalidMaxError includes prop value and component name
  - getInvalidValueError includes prop value and component name

**End to end, `progress.e2e.ts`**

- Progress
  - is named by its label and reads its value out as text
  - marks every part complete at max, and loading again below it
  - an unknown amount is indeterminate, with no value to read
  - refuses a value past max and shows it as indeterminate
  - reads its value through getValueLabel
  - measures from min, so the default label is the share of the way from min to max
  - fills from the right in right-to-left
  - fills from the right on a right-to-left page, with no dir of its own
  - drops aria-labelledby once its label is gone

</details>
<!-- /behaviour -->

## Beyond Radix

- `Label` names the bar: while it is mounted, the root's `aria-labelledby` points at its id. An
  `aria-labelledby` passed to the root still wins. Base UI has it.
- `Value` shows the text `getValueLabel` returns, and nothing while indeterminate. It is `aria-hidden`, since
  the root already announces that text as `aria-valuetext`, and takes a function as children to format it.
  Base UI has it.
- `min` is the value an empty bar stands for, announced as `aria-valuemin`, as in Base UI, Ark and React
  Aria. A value below it is refused as one above `max` is, the default label measures the way from `min` to
  `max`, and `getValueLabel` receives it as its third argument. A `max` it refuses falls back to 100, or to 100
  past `min` once `min` reaches 100.

## Fixed

- Passes every Radix progress test.
- `dir` takes any value an element takes, `auto` included. It was typed `'ltr' | 'rtl'`, though the root only
  writes it to the attribute.

## Smaller and faster

- An invalid `max` or `value` is logged in development only, as the other primitives do with their
  warnings, so a production build drops the messages. That took 258 bytes off the module.
- Stops resolving its direction, which it only wrote to the `dir` attribute the page already passes down,
  and the context drops its `dir`.

## Breaking changes

- Without a `dir` prop the root and the indicator carry no `dir` attribute, where they carried `dir="ltr"`.

## registry-ui

- `Progress` and `MotionProgress` are built on the primitive's `Root` and `Indicator`. They announce
  `aria-valuetext`, expose `data-state`, and take `min`, `max` and `getValueLabel`. They take no `asChild`,
  since their indicator is their only child.
- `MotionProgress` animates the primitive's `Indicator`, so its fill carries
  `data-slot="progress-indicator"` and `data-state`, where it was a bare `div`.
- `Progress` and `MotionProgress` write no `dir` of their own, so they fill from the side the element around
  them reads from: a `DirectionProvider`, a `dir` on any ancestor, or `<html dir>`. They wrote the direction
  `useDirection` resolved, which sees no plain ancestor, so a bar inside `<div dir="rtl">` filled from the left,
  and on the server they wrote `ltr`, so a right-to-left page filled from the left until it hydrated.
  `MotionProgress` grows from the inline start and runs its shimmer toward the inline end through CSS `:dir()`.
  Tailwind's `rtl:` would also match a left-to-right box inside a right-to-left page.
- `Progress` fills and pulses while indeterminate, where the bar stayed empty, and a value outside `min` to `max`
  reads as indeterminate, as the primitive reads it, where it overflowed.
- Breaking: `value` is optional and `null` means indeterminate. The fill sizes by `width`, so a stylesheet
  that set its `transform` has to set its `width` instead.

## Later

- Mounting takes 1.09 times Radix's time, for the `data-slot` attributes Radix does not set, and unmounting
  1.12 times.
- Base UI's `format` and `locale`. The default label is `30%` in every language; `getValueLabel` can format
  it, and a default built on `Intl.NumberFormat` could differ between the server and the browser.
- Ark's circular progress parts.
