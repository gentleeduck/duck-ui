}>
  The calendar follows the [WAI-ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) for date pickers. Prop getters apply all ARIA attributes automatically.

## ARIA roles and attributes

| Element | Role / Attribute | Value |
| :--- | :--- | :--- |
| Grid container | `role="grid"` | - |
| Grid container | `aria-roledescription` | `"calendar"` |
| Grid container | `aria-readonly` | `true` with `readOnly` |
| Day cell | `role="gridcell"` | - |
| Day cell | `aria-label` | Full date (e.g. "Saturday, March 14, 2026") |
| Day cell | `aria-selected` | `true` when selected |
| Day cell | `aria-disabled` | `true` when disabled or `unavailable` |
| Day cell | `aria-invalid` | `true` on a selected day while the selection is invalid |
| Day cell | `aria-current` | `"date"` for today |
| Nav wrapper | `role="navigation"` | Set by the `CalendarNav` primitives compound component, not by the hook |
| Nav button | `aria-label` | `"Go to previous month"` / `"Go to next month"` (from `getNavProps`) |
| Nav button | `disabled` | `true` when navigation in that direction is not allowed (from `getNavProps`) |
| Month header | `aria-live` | `"polite"` |

***

## Keyboard navigation

| Key | Action |
| :--- | :--- |
| <Kbd>ArrowLeft</Kbd> / <Kbd>ArrowRight</Kbd> | Move focus +/- 1 day |
| <Kbd>ArrowUp</Kbd> / <Kbd>ArrowDown</Kbd> | Move focus +/- 1 week |
| <Kbd>PageUp</Kbd> / <Kbd>PageDown</Kbd> | Move focus +/- 1 month, or every shown month with `pageBehavior: 'visible'` |
| <Kbd>Shift+PageUp</Kbd> / <Kbd>Shift+PageDown</Kbd> | Move focus +/- 1 year |
| <Kbd>Home</Kbd> / <Kbd>End</Kbd> | Move to start/end of week |
| <Kbd>Enter</Kbd> / <Kbd>Space</Kbd> | Select focused date |
| <Kbd>Escape</Kbd> | Dismiss (calls `onDismiss`) |

The arrow keys skip a `disabled` day but stop on an `unavailable` one, which stays focusable so a screen reader can say it is booked. With `readOnly`, focus still moves and nothing can be picked.

The `Calendar.MonthView` and `Calendar.YearView` primitives are grids too, with one tab stop: the arrow keys move along and between rows, <Kbd>Home</Kbd> / <Kbd>End</Kbd> go to the start and end of a row, and <Kbd>PageUp</Kbd> / <Kbd>PageDown</Kbd> move a year or a decade.

Focus moving past the shown months moves the view by one month. For example, pressing <Kbd>ArrowRight</Kbd> on the last day of the month moves focus to the first day of the next month and shows that month. With `numberOfMonths` above 1, moving between the shown months leaves the view where it is.

***

## Roving tabIndex

Exactly one day has `tabIndex=0`: the focused date while a shown month holds it, otherwise the first selected day, today, or the first day that can be picked. A day drawn from a neighbouring month never holds it, so two months showing one week still give one stop. All other days have `tabIndex=-1`. This means:

* <Kbd>Tab</Kbd> moves focus into the calendar grid (to that day), then out
* Arrow keys move focus between days within the grid
* The user never has to tab through every day cell

***

## Screen reader announcements

The `useAnnouncer` hook (used internally by `useCalendar`) creates an `aria-live="polite"` region that announces:

* Month navigation changes (e.g. "March 2026")
* Selection changes (e.g. "March 14 selected", or "Range: March 14 to March 18" in range mode)
* Attempted selection of a disabled or `unavailable` date, or a range spanning an `unavailable` one (e.g. "March 14 is unavailable")

When using compound components, the announcer portal is rendered automatically inside `Calendar.Root`.

}>
  The prop getters (`getDayProps`, `getGridProps`, `getNavProps`, `getHeaderProps`) apply ARIA attributes for their respective elements automatically. Note that `getNavProps` provides `aria-label`, `disabled`, and `onClick` for individual prev/next buttons. The `role="navigation"` wrapper is provided by the `CalendarNav` primitives compound component.