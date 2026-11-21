# Calendar

The calendar grid over the `@gentleduck/calendar` engine.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/calendar` |
| API docs | [`duck-primitives/api/calendar.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/calendar.mdx) |
| Styled component | [`registry-ui/src/calendar`](../../../registry-ui/src/calendar) |
| Styled docs | [`duck-ui/components/calendar.mdx`](../../../../apps/duck/content/docs/duck-ui/components/calendar.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 3. Faster in 8 of 9 timed comparisons.

| | gentleduck | React Aria | Ark UI | react-day-picker |
|---|--:|--:|--:|--:|
| Size, gzipped bytes | 10,193 | 37,759 (0.27x) | 44,308 (0.23x) | 20,518 (0.50x) |
| Mount x100, ms | 58.2 | 237 (0.25x) | 95.5 (0.61x) | 97.1 (0.60x) |
| Update x100, ms | 42.7 | 113 (0.38x) | 74.7 (0.57x) | **29.1 (1.47x)** |
| Unmount x100, ms | 3.54 | 16.8 (0.21x) | 6.88 (0.51x) | 4.55 (0.78x) |

Where gentleduck is behind:

- Update x100 against react-day-picker: 1.47x, 13.7 ms more.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: React Aria 1.22.1, Ark UI 5.40.0 and react-day-picker 10.0.1.

gentleduck's figure includes the `NativeAdapter` it needs. Ark UI has no calendar of its own, so it is its DatePicker drawn inline; React Aria and Ark UI are the parts a single-month calendar draws, react-day-picker its whole `DayPicker` with the date-fns it requires.
<!-- /benchmarks -->

## Tests

The stories cover a single day, a range across two months paged by both, several days, bounds with a disabled
and an unavailable day, a read-only calendar, a British week starting Monday with ISO week numbers, the month
and year views opened by their triggers, an Arabic calendar right to left, a Persian month, two ranges, a
controlled calendar that reports a page, a pick and Escape, six fixed weeks without the days either side, and an
invalid selection. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test written for this module was proven by changing the code and watching a test fail. The suites taken from
React Aria and react-day-picker run that library's own cases against this code. Each file's header names its source
and every case left out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 137 | `calendar-a11y.test.tsx` 16, `calendar.react-aria.test.tsx` 5, `calendar.react-day-picker.test.tsx` 14, `calendar.test.tsx` 102 |
| End to end | 17 | `calendar.e2e.ts` 17 |
| registry-ui | 38 | `calendar.libs.test.ts` 2, `calendar.test.tsx` 36 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>154 behaviours, one per test</summary>

**Unit, `calendar-a11y.test.tsx`**

- Calendar a11y  -  axe automated checks
  - days view (single mode) has no axe violations
  - days view (range mode) has no axe violations
  - days view (multi mode) has no axe violations
  - month view has no axe violations
  - days view with week numbers, unavailable days and an invalid selection has no axe violations
  - year view has no axe violations
  - days view with disabled dates has no axe violations
  - days view with selection has no axe violations
- Calendar a11y  -  structural assertions
  - day buttons have aria-label with full date string
  - grid has aria-roledescription="calendar"
  - exactly one tabIndex=0 in the grid (roving tabindex)
  - all other day buttons have tabIndex=-1
  - weekday headers have role="columnheader"
  - nav wrapper has role="navigation"
  - header has aria-live="polite"
  - announcer div has role="status" and aria-live="polite"

**Unit, `calendar.react-aria.test.tsx`**

- React Aria calendar
  - leaves the selection as it is on Enter over an unavailable day
  - moves on each repeat of an arrow key held down
  - takes no focus when its controlled month changes
  - selects several days in multi mode, and lets a second press take one off
  - disables the days before fromDate and after toDate, and selects none of them

**Unit, `calendar.react-day-picker.test.tsx`**

- react-day-picker keyboard, from the first day of the month
  - shows the month before and focuses its last day on ArrowLeft
  - stays in the month and focuses the day a week on, on ArrowDown
  - shows the month before on ArrowUp, on the day a week back
  - turns a month on PageUp and PageDown, keeping the day
  - turns a year on Shift with PageUp and PageDown, keeping the day
  - goes to the start of the week on Home and its end on End
  - goes to Monday on Home and Sunday on End in a week starting on Monday
- react-day-picker keyboard, from the last day of the month
  - shows the month after and focuses its first day on ArrowRight
  - stays in the month on ArrowUp, on the day a week back
- react-day-picker keyboard, with navigation held to one month
  - keeps the month and focus on the arrow keys out of it
- react-day-picker two months
  - draws a grid for each, and turns both back on a press of the previous button
- react-day-picker range
  - takes a first click as its start and a later one as its end, and starts again on a third
  - takes a click before its start as the new start, the old one becoming its end
- react-day-picker disabled days
  - still marks a selected day as selected while it is disabled, and no other disabled day

**Unit, `calendar.test.tsx`**

- Calendar (root)
  - renders with role="application" and aria-label="Calendar"
  - has data-slot="calendar"
  - has data-view attribute matching the default viewMode ("days")
  - renders children
  - writes the locale's direction on the root, so the grid lays out the way its arrow keys move
  - reads its direction from a DirectionProvider, and moves the arrow keys with it
  - takes the locale direction over the provider
  - takes a dir given to it over the provider, for the arrow keys as well as the layout
- CalendarHeader
  - renders month/year text by default (March 2026)
  - has data-slot="calendar-header"
  - has aria-live="polite"
  - custom formatMonth prop overrides the title
  - renders children when provided instead of title
  - names the month in the calendar's locale
- CalendarNav
  - renders prev and next buttons by default
  - buttons have data-slot="calendar-nav-button"
  - prev button has aria-label "Go to previous month"
  - next button has aria-label "Go to next month"
  - prev button is disabled when at fromDate boundary
  - next button is disabled when at toDate boundary
  - click prev changes month backward
  - click next changes month forward
  - is named as the calendar navigation
- CalendarPrevButton / CalendarNextButton
  - renders standalone prev button
  - renders standalone next button
  - calls its own onClick and still turns the month
- CalendarViewTrigger
  - opens the view it names, marking itself active while that view shows
  - is a button of its own type that leaves a click it was given a chance to cancel
- CalendarGrid
  - starts each week with its ISO week number when asked
  - draws no week numbers by default
  - hands readOnly, invalid, unavailable and pageBehavior to the calendar, not the element
  - has role="grid"
  - has data-slot="calendar-grid"
  - has aria-labelledby pointing to header id
  - draws its weekdays and a day for every day of the shown month
  - marks the selected day on the days it draws
  - draws each day through a function child
  - draws the month it is given when several are shown
  - keeps the content it is given
  - takes the props it is given over the ones the calendar sets
- CalendarWeekdays
  - renders 7 weekday headers
  - has data-slot="calendar-weekdays"
  - weekday cells are &lt;abbr&gt; elements
  - weekday cells have title attribute with the weekday name
  - custom renderWeekday overrides cell content
  - draws the children it is given in place of the weekdays
  - hands renderWeekday the position of each weekday
- CalendarDay
  - renders as button with data-slot="calendar-day"
  - has role="gridcell" from getDayProps
  - shows day number as text content
  - has aria-selected when selected
  - has aria-disabled when disabled
  - has aria-current="date" when today
  - has data-outside-month when outside current month
  - click selects the date via onClick
  - takes the props, handlers and children it is given, and still selects
  - moves the tab stop to the day under the mouse
- CalendarMonthView
  - renders 12 month buttons
  - has data-slot="calendar-month-view"
  - month buttons have data-slot="calendar-month"
  - draws a grid of rows, three months to a row unless told otherwise
  - lays out three columns when the count it is given cannot make a row
  - marks the shown month selected and gives it the one tab stop
  - moves focus with the arrow keys, Home and End, and stops at the edges
  - ends a short last row at its last month
  - moves the tab stop to a month focused another way
  - swaps left and right in a right-to-left calendar
  - turns the year with PageUp and PageDown, keeping focus on the month
  - leaves a key it does not use to the page, focus included
  - draws the children it is given in place of the months, keeping its slot, props and ref
  - current month is marked with data-current
  - click on month changes viewMode to days and updates header
  - names the months in the calendar's locale
  - takes ArrowRight to the month before in a right-to-left calendar
  - takes the arrow keys, PageUp and PageDown from the page
  - tells assistive technology which month is the current one
- CalendarYearView
  - renders year buttons
  - has data-slot="calendar-year-view"
  - year buttons have data-slot="calendar-year"
  - draws a grid of rows of three years, named by the years it holds
  - marks the shown year selected and gives it the one tab stop
  - moves focus with the arrow keys and turns a decade with PageDown
  - draws the children it is given in place of the years, keeping its slot, props and ref
  - current year is marked with data-current
  - click on year changes viewMode to months and updates the month
  - takes ArrowLeft to the next year in a right-to-left calendar
- Calendar integration
  - keeps the shown months in view when the keys move inside them
  - moves the view one month when the keys leave the last month shown
  - moves the view back when the keys leave the first month shown
  - moves the tab stop with the arrow keys from the first day shown
  - full calendar with header, nav, grid, weekdays renders
  - header and grid share the same id for aria-labelledby
  - click next then header renders next month
  - click prev then header renders previous month
  - navigating multiple months updates correctly
  - clicking a day calls onSelect with the selected date
  - month view to day view flow works
  - year view to month view flow works
  - nav buttons are not disabled when no fromDate/toDate constraints
  - prev is disabled at fromDate, next is disabled at toDate
  - passes additional DOM props to Calendar root
  - submits no form it sits in from its buttons

**End to end, `calendar.e2e.ts`**

- Calendar
  - picks a day on a click, and leaves one day of the month in the tab order
  - moves through the days with the arrow keys, Home, End and PageDown, and picks one on Enter
  - pages a month at a time with its buttons
  - picks a range across two months, and pages by both with pageBehavior visible
  - picks several days, and drops one picked again
  - refuses the days outside its bounds, a disabled day and an unavailable one, and the keys pass over the disabled ones
  - keeps its selection when read-only
  - starts each week on its locale day, with its ISO week number
  - moves the month a year or a month picked in its views points at
  - shows only the picker or the days its view names
  - opens the view its trigger names
  - lays a right-to-left calendar out from the right, and takes ArrowLeft to the next day
  - shows a Persian month, and picks its Gregorian day
  - picks two ranges, a day after the first range ends starting the second
  - shows the month and the day it is handed, and tells the owner of a page, a pick and Escape
  - keeps six rows with fixedWeeks, and hides the days of the months either side
  - marks the grid and the picked days invalid

</details>
<!-- /behaviour -->

## Features

- `Calendar.Grid` draws the month itself: a `Calendar.Weekdays` row, then a `role="row"` per week holding
  a `Calendar.Day` per day. `month` picks which shown month it draws, and a function child draws each day.
- `showWeekNumber` starts each week row with its ISO week number in a `role="rowheader"`.
- `unavailable` takes dates that stay focusable but cannot be picked, such as a booked day. The arrow keys
  stop on them, picking one is refused aloud, and a range cannot span one.
- `readOnly` lets focus move while nothing can be picked, and `invalid` marks the selection invalid.
- `pageBehavior: 'visible'` moves every shown month on next, previous, PageUp and PageDown.
- `Calendar.MonthView` and `Calendar.YearView` are keyboard grids with rows, one tab stop, arrow keys,
  Home, End, PageUp and PageDown, and `columns` for the row length.
- `Calendar.ViewTrigger` opens the view its `view` names and reads `data-state="active"` while it shows, so a
  header button can open the month or the year view, as Ark's `ViewTrigger` does. Only a pick inside a view
  changed it, and the context that holds the view was not exported.
- The engine reads a locale's first day and weekend from `Intl.Locale` (`getLocaleWeekInfo`).

## Fixed

- Exactly one shown day is in the tab order, and the stop follows the view when the nav buttons move it. A
  day drawn from a neighbouring month never holds it, so two months showing the same week give one stop.
- With several months shown, arrow keys moving between them leave the view where it is.
- The month and year views were buttons in a `role="grid"` with no rows, which axe reported as invalid
  ARIA.
- A week's number is read from its Thursday, so a row starting on Sunday or Saturday no longer takes the
  previous week's number.
- `isWeekend` follows the locale's weekend, Friday and Saturday for `ar-SA`.
- The root writes its direction as `dir`, from `locale.direction` or else a `DirectionProvider`. A
  right-to-left locale ran the arrow keys right to left while the days still ran left to right.
- In development under StrictMode, a key pressed before React ran the calendar's mount effects moved the
  tab stop to the next day but left focus on the day before. The replayed cleanup cancelled the frame
  that moves focus.
- A day focused some other way than the arrow keys or the pointer, such as by a screen reader or by code, took
  no tab stop, so the next arrow key moved from the day that held it.
- The days between a range's ends read as not selected to assistive technology, where React Aria and
  react-day-picker mark the whole range selected.

## Smaller and faster

- The root, the month view and the year view stop memoising values the engine renews on every render. The
  context provider already memoises what it is handed.
- A month or year cell takes its name from its text, where it repeated the text in `aria-label`.

## Breaking changes

- `ICalendar.IContext` drops `mode`, which no part read.
- With a `locale` and no `weekStartDay`, the week starts on the locale's first day, Monday for `de-DE`,
  where it always started on Sunday. Pass `weekStartDay: 0` to keep Sunday.

## registry-ui

- `Calendar` and `MotionCalendar` take `weekStartDay`, `showWeekNumber`, `pageBehavior`, `unavailable`,
  `readOnly` and `invalid`. An unavailable day is struck through and stays focusable, and an invalid
  selection is drawn in the destructive colour.
- The focus ring comes from the day's `data-focused`, so it sits on the one day holding the tab stop,
  where two months drawing the same day drew two rings.
- The `calendar-16` example works out today and its booked days when it mounts, where it did so once
  when the module loaded, so a page open past midnight or a long-running server showed a stale day.

## Later

A date picker is a `Calendar` in a `Popover`, as the registry examples compose it, so there is no DatePicker
part.
