}>
  `@gentleduck/calendar` is a headless calendar engine. It ships the date math, grid logic, and keyboard handling. You own the markup and styles.

## Benchmarks

Built to replace `react-day-picker`. The measurements:

5.8 KB gzipped for `useCalendar` with the `NativeAdapter`, and 9.7 KB for a whole calendar built with `@gentleduck/primitives`, against 20.0 KB for react-day-picker, 36.9 KB for React Aria's and 43.3 KB for Ark UI's. Zero dependencies. 4 calendar systems. 7 date adapters. Full keyboard navigation and WAI-ARIA grid pattern. See the [full benchmarks](/duck-calendar/benchmarks) and the [comparison with react-day-picker](/www/comparisons/vs-react-day-picker).

## The four layers

**Core** - Pure functions for grid building, selection logic, and navigation. No React, no state, no side effects.

**Adapter** - An `Adapter.IDateAdapter<TDate>` interface that abstracts date operations. Ships with a zero-dependency `NativeAdapter` for `Date` and adapters for dayjs, date-fns and Luxon; write your own for anything else, such as Temporal.

**React hooks** - `useCalendar`, `useTimePicker`, `useDateTime` manage state and return prop getters you spread onto your elements.

**Compound components** - Available in `@gentleduck/primitives/calendar` when you want them. The hooks are first-class.

***

## Design goals

Existing React calendar libraries bundle CSS, mandate a specific date library, or ship monolithic components you cannot tree-shake. `@gentleduck/calendar` addresses each:

* **5.8 KB gzipped** - `useCalendar` with the `NativeAdapter`, measured the way the benchmarks measure React Aria and Ark UI.
* **Zero runtime dependencies** - `NativeAdapter` uses `Date` and `Intl.DateTimeFormat`.
* **Pluggable date backend** - swap `Date` for dayjs, date-fns, Luxon or your own adapter without touching calendar code.
* **No CSS** - style with data attributes and Tailwind.
* **WAI-ARIA grid pattern** - keyboard navigation and screen reader announcements built in.

***

## What's in the package

| Export | Description |
| :--- | :--- |
| `NativeAdapter` | Zero-dep adapter for the native `Date` object |
| `buildCalendarMonth` | Build a single month grid |
| `buildMultiMonth` | Build multiple consecutive month grids |
| `buildCalendarYear` | Build a 12-month picker |
| `buildDecadeView` | Build a decade year picker |
| `selectDay` | Compute new selection value |
| `applySelection` | Decorate weeks with selection flags |
| `navigate` / `canNavigate` | Navigate and check bounds |
| `useCalendar` | Main calendar React hook |
| `useTimePicker` | Time picker React hook |
| `useDateTime` | Combined date+time React hook |

***

## Next pages

} className="[&_ul]:my-0">
  * [Getting Started](/duck-calendar/getting-started) - Install and build a calendar.
  * [Guides](/duck-calendar/guides) - Adapters, styling, accessibility.
  * [API Reference](/duck-calendar/api) - Prop and return type reference.
  * [Course](/duck-calendar/course) - Lessons from zero to production.