<p align="center">
  <img src="../../public/logo-dark.svg" alt="@gentleduck/calendar" width="120"/>
</p>

<h1 align="center">@gentleduck/calendar</h1>

<p align="center">
  Headless, framework-agnostic calendar engine with date adapter pattern, React hooks, and compound components.
</p>

<p align="center">
  <a href="../../LICENSE">MIT</a> -
  <a href="../../CHANGELOG.md">Changelog</a> -
  <a href="../../CONTRIBUTING.md">Contributing</a> -
  <a href="https://gentleduck.org/duck-ui">Docs</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@gentleduck/calendar"><img src="https://img.shields.io/npm/v/@gentleduck/calendar.svg" alt="npm"/></a>
  <a href="https://www.npmjs.com/package/@gentleduck/calendar"><img src="https://img.shields.io/npm/dm/@gentleduck/calendar.svg" alt="downloads"/></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/npm/l/@gentleduck/calendar.svg" alt="MIT"/></a>
</p>

---

**About half the size of react-day-picker**  -  9.5 KB gzipped for a whole calendar against 20.0 KB, and 5.8 KB for the `useCalendar` hook alone. Zero dependencies. Full keyboard navigation and ARIA compliance.

## Benchmarks

| Library | Size (gzipped) | Dependencies | Source |
|---|---|---|---|
| **@gentleduck/calendar** (`useCalendar` + `NativeAdapter`) | **5.8 KB** | **0** | Measured |
| **@gentleduck/primitives** Calendar | **9.5 KB** | **0** | Measured |
| react-day-picker 10, date-fns included | 20.0 KB | date-fns, @date-fns/tz | Measured |
| React Aria Calendar | 36.9 KB | 8 | Measured |
| Ark UI DatePicker, inline | 43.3 KB | 69 | Measured |
| react-calendar | ~15 KB | 4 | Published |
| react-datepicker | ~32 KB | date-fns, @floating-ui/react, clsx | Published |

4 calendar systems (Gregorian, Islamic, Persian, Hebrew). 7 date adapters (Native, date-fns, dayjs, luxon + 3 calendar-specific). See the [full benchmarks](https://gentleduck.org/docs/packages/duck-calendar/benchmarks) for feature comparisons.

```bash
bun run benchmark
```

## Quick Start

```tsx
import { NativeAdapter, useCalendar } from '@gentleduck/calendar'

const adapter = new NativeAdapter()

function MyCalendar() {
  const { state, getDayProps, getGridProps } = useCalendar({
    adapter,
    mode: 'single',
  })

  return (
    <div {...getGridProps()}>
      {state.weeks.map(week =>
        week.days.map(day => (
          <button key={day.date.getTime()} {...getDayProps(day)}>
            {day.date.getDate()}
          </button>
        ))
      )}
    </div>
  )
}
```

## Features

- **Date Adapter Pattern**  -  Plug in any date library (native Date, dayjs, date-fns, Temporal)
- **Selection Modes**  -  Single, range, multi-select with type-safe conditional types
- **Multi-Month**  -  Display 1-12 months side by side
- **Time Picker**  -  useTimePicker hook with spinbutton ARIA
- **DateTime Picker**  -  useDateTime composing calendar + time
- **Keyboard Navigation**  -  Arrow keys, Page Up/Down, Home/End, Enter/Space, Escape
- **Screen Reader**  -  aria-live announcements for navigation and selection
- **Roving TabIndex**  -  Proper focus management with DOM focus sync
- **Zero CSS**  -  Style with data-* attributes using Tailwind, CSS modules, or vanilla CSS
- **Tree-Shakeable**  -  `sideEffects: false`, import only what you use

## Architecture

```
@gentleduck/calendar
├── adapter/      -  DateAdapter<TDate> interface + NativeAdapter
├── grid/         -  buildCalendarMonth, buildMultiMonth, year/decade views
├── selection/    -  selectDay, applySelection, range/multi logic
├── navigation/   -  navigate, canNavigate, month/year jumping
├── time/         -  TimeValue, clampTime, incrementField, formatters
└── react/        -  useCalendar, useTimePicker, useDateTime, useKeyboard, useAnnouncer
```

## Documentation

Full docs at [gentleduck.org/docs/packages/duck-calendar](https://gentleduck.org/docs/packages/duck-calendar)

## License

MIT
