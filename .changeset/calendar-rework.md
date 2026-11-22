---
'@gentleduck/calendar': major
---

Each calendar system keeps the dates it is given, right at its edges, and the engine gains locale weeks, paging and unavailable days.

**Added**

- The week starts on the locale's first day and marks its weekend, and week numbers follow the ISO week of each row's Thursday.
- `pageBehavior` pages every shown month at once, unavailable days stay focusable but cannot be picked or spanned, `readOnly` keeps any day from being picked, and `invalid` marks the selection.
- The tab stop sits on a shown selection, then today, then the first day of the month, and every day of a range, its ends and the days between, reads as selected.

**Fixed**

- A year under 100 stays that year in every adapter, the Hebrew leap months keep their places, and a date a system lacks is refused. The Persian adapter refuses a year past its range.
- A range Shift-click no longer spans a booked day, and a page turned from the keyboard keeps inside `fromDate` and `toDate`.

**Breaking**

- With a locale and no `weekStartDay`, the week starts on the locale's first day where it started on Sunday.
- `HEBREW_MONTHS` is `hebrewMonthName`, and every time field takes `tabIndex` 0.
