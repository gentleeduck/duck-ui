```tsx
import * as Calendar from '@gentleduck/primitives/calendar'
```

## Anatomy

```tsx
<Calendar.Root>
  <Calendar.Header />
  <Calendar.Nav>
    <Calendar.PrevButton />
    <Calendar.NextButton />
  </Calendar.Nav>
  <Calendar.ViewTrigger view="months" />
  <Calendar.Grid>{(day) => <Calendar.Day day={day} />}</Calendar.Grid>
  <Calendar.MonthView />
  <Calendar.YearView />
</Calendar.Root>
```

***

## Usage

```tsx showLineNumbers
import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'

const adapter = new NativeAdapter()

function DatePicker() {
  return (
    <Calendar.Root adapter={adapter} mode="single" className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Calendar.Header className="text-sm font-medium" />
        <Calendar.Nav className="flex gap-1">
          <Calendar.PrevButton className="h-7 w-7 rounded hover:bg-accent">
            <-
          </Calendar.PrevButton>
          <Calendar.NextButton className="h-7 w-7 rounded hover:bg-accent">
            ->
          </Calendar.NextButton>
        </Calendar.Nav>
      </div>
      <Calendar.Grid className="space-y-1 [&_[role=row]]:grid [&_[role=row]]:grid-cols-7">
        {(day) => (
          <Calendar.Day day={day} className="h-8 rounded data-[outside-month]:opacity-50 data-[selected]:bg-primary" />
        )}
      </Calendar.Grid>
    </Calendar.Root>
  )
}
```

***

## Examples

### Single

```tsx title="components/calendar-single.tsx"
// import from your project: import Demo from '@/components/calendar-single'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import * as React from 'react'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()

export default function CalendarSingleExample() {
  const [picked, setPicked] = React.useState<Date | null>(null)

  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        locale={{ locale: 'en-US' }}
        mode="single"
        onSelect={(value) => setPicked(value as Date | null)}>
        <Calendar.Nav>
          <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
          <Calendar.Header />
          <Calendar.NextButton>{'>'}</Calendar.NextButton>
        </Calendar.Nav>
        <Calendar.Grid />
      </Calendar.Root>
      <p className={styles.note}>
        Picked: {picked ? picked.toDateString() : 'none'}. A second press on the day clears it.
      </p>
    </div>
  )
}
```

### Range over two months

```tsx title="components/calendar-range.tsx"
// import from your project: import Demo from '@/components/calendar-range'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import * as React from 'react'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()
type Range = { from: Date; to: Date | null } | null

export default function CalendarRangeExample() {
  const [range, setRange] = React.useState<Range>(null)

  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        locale={{ locale: 'en-US' }}
        mode="range"
        numberOfMonths={2}
        onSelect={(value) => setRange(value as Range)}
        pageBehavior="visible">
        <Calendar.Nav>
          <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
          <Calendar.Header />
          <Calendar.NextButton>{'>'}</Calendar.NextButton>
        </Calendar.Nav>
        <div className={styles.months}>
          <Calendar.Grid month={0} />
          <Calendar.Grid month={1} />
        </div>
      </Calendar.Root>
      <p className={styles.note}>
        {range
          ? `${range.from.toDateString()} to ${range.to ? range.to.toDateString() : '...'}`
          : 'Pick a start and an end.'}{' '}
        pageBehavior visible turns both months at once.
      </p>
    </div>
  )
}
```

### Several days

```tsx title="components/calendar-multi.tsx"
// import from your project: import Demo from '@/components/calendar-multi'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import * as React from 'react'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()

export default function CalendarMultiExample() {
  const [days, setDays] = React.useState<Date[]>([])

  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        locale={{ locale: 'en-US' }}
        mode="multi"
        onSelect={(value) => setDays(value as Date[])}>
        <Calendar.Nav>
          <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
          <Calendar.Header />
          <Calendar.NextButton>{'>'}</Calendar.NextButton>
        </Calendar.Nav>
        <Calendar.Grid />
      </Calendar.Root>
      <p className={styles.note}>{days.length} days picked. A second press takes one off.</p>
    </div>
  )
}
```

### Several ranges

```tsx title="components/calendar-multi-range.tsx"
// import from your project: import Demo from '@/components/calendar-multi-range'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import * as React from 'react'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()
type Ranges = { from: Date; to: Date | null }[]

export default function CalendarMultiRangeExample() {
  const [ranges, setRanges] = React.useState<Ranges>([])

  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        locale={{ locale: 'en-US' }}
        mode="multi-range"
        onSelect={(value) => setRanges(value as Ranges)}>
        <Calendar.Nav>
          <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
          <Calendar.Header />
          <Calendar.NextButton>{'>'}</Calendar.NextButton>
        </Calendar.Nav>
        <Calendar.Grid />
      </Calendar.Root>
      <p className={styles.note}>
        {ranges.length} ranges. Shift with a press inside a range of six days or more takes that day out of it.
      </p>
    </div>
  )
}
```

### Bounds, disabled and booked days

```tsx title="components/calendar-constraints.tsx"
// import from your project: import Demo from '@/components/calendar-constraints'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()
const today = new Date()
const from = new Date(today.getFullYear(), today.getMonth(), 1)
const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
const booked = [
  new Date(today.getFullYear(), today.getMonth(), 12),
  new Date(today.getFullYear(), today.getMonth(), 13),
]
const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

export default function CalendarConstraintsExample() {
  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        disabled={weekend}
        fromDate={from}
        locale={{ locale: 'en-US' }}
        mode="range"
        toDate={to}
        unavailable={booked}>
        <Calendar.Nav>
          <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
          <Calendar.Header />
          <Calendar.NextButton>{'>'}</Calendar.NextButton>
        </Calendar.Nav>
        <Calendar.Grid />
      </Calendar.Root>
      <p className={styles.note}>
        Only this month, no weekends, and the 12th and 13th booked: they keep focus, but no range spans them.
      </p>
    </div>
  )
}
```

### Month and year views

```tsx title="components/calendar-views.tsx"
// import from your project: import Demo from '@/components/calendar-views'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()

export default function CalendarViewsExample() {
  return (
    <Calendar.Root adapter={adapter} className={styles.calendar} locale={{ locale: 'en-US' }} mode="single">
      <Calendar.Nav>
        <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
        <Calendar.Header />
        <Calendar.NextButton>{'>'}</Calendar.NextButton>
      </Calendar.Nav>
      <div className={styles.row}>
        <Calendar.ViewTrigger view="days">Days</Calendar.ViewTrigger>
        <Calendar.ViewTrigger view="months">Months</Calendar.ViewTrigger>
        <Calendar.ViewTrigger view="years">Years</Calendar.ViewTrigger>
      </div>
      <Calendar.YearView />
      <Calendar.MonthView />
      <Calendar.Grid />
    </Calendar.Root>
  )
}
```

### Week numbers and a Monday start

```tsx title="components/calendar-week-numbers.tsx"
// import from your project: import Demo from '@/components/calendar-week-numbers'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()

export default function CalendarWeekNumbersExample() {
  return (
    <Calendar.Root
      adapter={adapter}
      className={styles.calendar}
      locale={{ locale: 'en-GB', weekStartDay: 1 }}
      mode="single"
      showWeekNumber>
      <Calendar.Nav>
        <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
        <Calendar.Header />
        <Calendar.NextButton>{'>'}</Calendar.NextButton>
      </Calendar.Nav>
      <Calendar.Grid />
    </Calendar.Root>
  )
}
```

### Right to left

```tsx title="components/calendar-rtl.tsx"
// import from your project: import Demo from '@/components/calendar-rtl'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()

export default function CalendarRtlExample() {
  return (
    <Calendar.Root
      adapter={adapter}
      className={styles.calendar}
      locale={{ locale: 'ar-EG', direction: 'rtl' }}
      mode="single">
      <Calendar.Nav>
        <Calendar.PrevButton>{'>'}</Calendar.PrevButton>
        <Calendar.Header />
        <Calendar.NextButton>{'<'}</Calendar.NextButton>
      </Calendar.Nav>
      <Calendar.Grid />
    </Calendar.Root>
  )
}
```

### Read-only and invalid

```tsx title="components/calendar-read-only.tsx"
// import from your project: import Demo from '@/components/calendar-read-only'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import * as React from 'react'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()
const today = new Date()
const due = new Date(today.getFullYear(), today.getMonth(), 15)

export default function CalendarReadOnlyExample() {
  const [invalid, setInvalid] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        defaultSelected={due}
        invalid={invalid}
        locale={{ locale: 'en-US' }}
        mode="single"
        readOnly>
        <Calendar.Header />
        <Calendar.Grid />
      </Calendar.Root>
      <button className={styles.button} onClick={() => setInvalid((value) => !value)} type="button">
        {invalid ? 'Mark valid' : 'Mark invalid'}
      </button>
      <p className={styles.note}>
        readOnly lets focus move but picks nothing. invalid marks the selection for the eye and aria-invalid.
      </p>
    </div>
  )
}
```

### Six fixed weeks

```tsx title="components/calendar-fixed-weeks.tsx"
// import from your project: import Demo from '@/components/calendar-fixed-weeks'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()

export default function CalendarFixedWeeksExample() {
  return (
    <Calendar.Root
      adapter={adapter}
      className={styles.calendar}
      defaultMonth={new Date(2026, 1, 1)}
      fixedWeeks
      locale={{ locale: 'en-US' }}
      mode="single"
      showOutsideDays={false}>
      <Calendar.Nav>
        <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
        <Calendar.Header />
        <Calendar.NextButton>{'>'}</Calendar.NextButton>
      </Calendar.Nav>
      <Calendar.Grid />
    </Calendar.Root>
  )
}
```

### Controlled month and selection

```tsx title="components/calendar-controlled.tsx"
// import from your project: import Demo from '@/components/calendar-controlled'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import * as React from 'react'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()

export default function CalendarControlledExample() {
  const [month, setMonth] = React.useState(() => new Date())
  const [selected, setSelected] = React.useState<Date | null>(null)
  const [escapes, setEscapes] = React.useState(0)
  const today = new Date()

  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        locale={{ locale: 'en-US' }}
        mode="single"
        month={month}
        onDismiss={() => setEscapes((count) => count + 1)}
        onMonthChange={setMonth}
        onSelect={(value) => setSelected(value as Date | null)}
        selected={selected}>
        <Calendar.Nav>
          <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
          <Calendar.Header />
          <Calendar.NextButton>{'>'}</Calendar.NextButton>
        </Calendar.Nav>
        <Calendar.Grid />
      </Calendar.Root>
      <div className={styles.row}>
        <button
          className={styles.button}
          onClick={() => {
            setMonth(today)
            setSelected(today)
          }}
          type="button">
          Today
        </button>
        <button className={styles.button} onClick={() => setSelected(null)} type="button">
          Clear
        </button>
      </div>
      <p className={styles.note}>Escape in the grid called onDismiss {escapes} times.</p>
    </div>
  )
}
```

### Your own day and title

```tsx title="components/calendar-custom-day.tsx"
// import from your project: import Demo from '@/components/calendar-custom-day'
'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()
const busy = new Set([3, 9, 17, 24])

export default function CalendarCustomDayExample() {
  return (
    <Calendar.Root adapter={adapter} className={styles.calendar} locale={{ locale: 'en-US' }} mode="single">
      <Calendar.Nav>
        <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
        <Calendar.Header
          formatMonth={(month) => month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
        />
        <Calendar.NextButton>{'>'}</Calendar.NextButton>
      </Calendar.Nav>
      <Calendar.Grid>
        {(day) => (
          <Calendar.Day day={day}>
            <span style={{ display: 'grid', justifyItems: 'center', lineHeight: 1 }}>
              {day.date.getDate()}
              {busy.has(day.date.getDate()) && !day.isOutside ? <span aria-hidden>.</span> : null}
            </span>
          </Calendar.Day>
        )}
      </Calendar.Grid>
    </Calendar.Root>
  )
}
```

***

## API

### `Calendar.Root`

The root component. Wraps `useCalendar` and provides context to all children. Renders a `div` with `role="application"`.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `adapter` | `Adapter.IDateAdapter<Date>` | **required** | Date adapter instance |
| `mode` | `Selection.SelectionMode` | **required** | `'single'`, `'range'`, `'multi'`, or `'multi-range'` |
| `locale` | `CalendarLocaleConfig` | - | Locale, week start day, and direction. The week starts on the locale's first day unless `weekStartDay` is given, and on Sunday with no locale. The direction is written on the root as `dir`, and comes from a `DirectionProvider` when the locale has none |
| `month` | `Date` | - | Controlled displayed month |
| `defaultMonth` | `Date` | - | Default month (uncontrolled) |
| `selected` | `CalendarValue<Date, M>` | - | Controlled selection |
| `defaultSelected` | `CalendarValue<Date, M>` | - | Default selection (uncontrolled) |
| `onSelect` | `(value) => void` | - | Called when selection changes |
| `onMonthChange` | `(month: Date) => void` | - | Called when displayed month changes |
| `onDismiss` | `() => void` | - | Called on <Kbd>Escape</Kbd> |
| `numberOfMonths` | `number` | `1` | Months to show side by side |
| `showOutsideDays` | `boolean` | `true` | Show days from adjacent months |
| `fixedWeeks` | `boolean` | `false` | Always show 6 weeks |
| `disabled` | `Date[] \| (date) => boolean` | - | Disabled dates |
| `fromDate` | `Date` | - | Earliest selectable date |
| `toDate` | `Date` | - | Latest selectable date |
| `unavailable` | `Date[] \| (date) => boolean` | - | Days that keep focus but cannot be picked, such as a booked day. A range cannot span one |
| `readOnly` | `boolean` | `false` | Focus still moves, but no day can be picked |
| `invalid` | `boolean` | `false` | Marks the selection invalid. It is also invalid while it holds a day that cannot be picked |
| `pageBehavior` | `'single' \| 'visible'` | `'single'` | How far the nav buttons and <Kbd>PageUp</Kbd>/<Kbd>PageDown</Kbd> move: one month, or every shown month |
| `showWeekNumber` | `boolean` | `false` | Draws each week's ISO week number at the start of its row |

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar"` |
| `data-view` | Current `ViewMode` (`"days"`, `"months"`, or `"years"`) |

***

### `Calendar.Header`

Displays the current month and year. Renders a `div` with `aria-live="polite"`.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `formatMonth` | `(month: Date, adapter: Adapter.IDateAdapter<Date>) => string` | - | Custom formatter for the title. Defaults to `"March 2026"` format |

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-header"` |

***

### `Calendar.Nav`

Navigation wrapper. Renders a `div` with `role="navigation"`. When no children are provided, it renders `PrevButton` and `NextButton` automatically.

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-nav"` |

***

### `Calendar.PrevButton`

Navigates to the previous month. Renders a `button`.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| All `button` props | - | - | Standard button HTML attributes |

Automatically applies `aria-label="Go to previous month"` and `disabled` from context.

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-nav-button"` |
| `data-direction` | `"prev"` |

***

### `Calendar.NextButton`

Navigates to the next month. Renders a `button`.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| All `button` props | - | - | Standard button HTML attributes |

Automatically applies `aria-label="Go to next month"` and `disabled` from context.

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-nav-button"` |
| `data-direction` | `"next"` |

***

### `Calendar.ViewTrigger`

Opens a view: the days, the month view or the year view. Renders a `button`. The root's `data-view` names the view that shows, so a stylesheet shows one view at a time.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `view` | `'days' \| 'months' \| 'years'` | (required) | The view a click opens |
| All `button` props | - | - | Standard button HTML attributes |

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-view-trigger"` |
| `data-state` | `"active"` while its view shows, otherwise `"inactive"` |

***

### `Calendar.Grid`

The day grid. Renders a `div` with `role="grid"`, `aria-roledescription="calendar"`, and `aria-labelledby` pointing to the Header element (set automatically by `getGridProps()`). It draws a `Calendar.Weekdays` row, then a `role="row"` per week holding a `Calendar.Day` per day, with each day's selection, range and disabled state applied.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `month` | `number` | `0` | Which of the shown months to draw, counting from 0. Render one grid per month when `numberOfMonths` is above 1 |
| `children` | `(day: Grid.ICalendarDay<Date>) => ReactNode \| ReactNode` | - | A function draws each day in place of `Calendar.Day`. Any other children replace the weekdays and weeks |

```tsx
<Calendar.Root adapter={adapter} mode="range" numberOfMonths={2}>
  <Calendar.Grid />
  <Calendar.Grid month={1} />
</Calendar.Root>
```

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-grid"` |
| `data-slot` (each week row) | `"calendar-week"` |
| `data-slot` (each week number) | `"calendar-week-number"`, a `role="rowheader"` labelled `"Week 10"`, drawn with `showWeekNumber` |
| `data-readonly` | `"true"` with `readOnly`, which also sets `aria-readonly` |
| `data-invalid` | `"true"` while the selection is invalid |

***

### `Calendar.Weekdays`

Renders the weekday header row as a `div` with `role="row"`. Each weekday renders as an `abbr` with `role="columnheader"`.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `renderWeekday` | `(weekday: string, index: number) => ReactNode` | - | Custom render function for each weekday cell |

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-weekdays"` |
| `data-slot` (each cell) | `"calendar-weekday"` |
| `data-slot` (week number column) | `"calendar-week-number-header"`, an empty `aria-hidden` cell drawn with `showWeekNumber` |

***

### `Calendar.Day`

A single day cell. Renders a `button` with full ARIA attributes and data attributes for styling.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `day` | `Grid.ICalendarDay<Date>` | **required** | Day data from the calendar grid |

Automatically applies all day props from context: `aria-label`, `aria-selected`, `aria-disabled`, `aria-invalid`, `aria-current`, `tabIndex`, `onClick`, `onKeyDown`, `onMouseEnter`, and all `data-*` styling attributes. In a range, both ends and every day between them carry `aria-selected`. A day focused some other way than the arrow keys or the pointer, by a screen reader or by code, takes the tab stop, so the next arrow key moves from it.

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-day"` |
| `data-calendar-day` | `""` - marker attribute used internally for focus queries |
| `data-selected` | `"true"` when selected |
| `data-today` | `"true"` for today |
| `data-disabled` | `"true"` when disabled |
| `data-unavailable` | `"true"` for an `unavailable` day, which stays focusable |
| `data-invalid` | `"true"` on a selected day while the selection is invalid |
| `data-outside-month` | `"true"` for adjacent month days |
| `data-hidden` | `"true"` when `showOutsideDays` is false and day is outside |
| `data-range-start` | `"true"` for range start |
| `data-range-middle` | `"true"` for range middle |
| `data-range-end` | `"true"` for range end |
| `data-focused` | `"true"` on the day holding the tab stop |
| `data-weekend` | `"true"` on the locale's weekend days, Friday and Saturday for `ar-SA` |

***

### `Calendar.MonthView`

A 12-month grid for month picking. Renders a `role="grid"` of 12 `gridcell` buttons in rows, with `aria-selected` on the shown month and `aria-current="date"` on this month. Picking a month navigates to it and switches back to the day view.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columns` | `number` | `3` | Months to a row. The arrow keys move along and between the rows |

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-month-view"` |
| `data-slot` (each cell) | `"calendar-month"` |
| `data-current` | `"true"` on the current month |
| `data-selected` | `"true"` on the shown month |
| `data-month` (each cell) | Zero-based month index (e.g. `0` for January) |

***

### `Calendar.YearView`

A decade year grid for year picking. Renders a `role="grid"` of 12 `gridcell` buttons in rows, with `aria-selected` on the shown year and `aria-current="date"` on this year. Picking a year navigates to it and switches to the month view.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columns` | `number` | `3` | Years to a row. The arrow keys move along and between the rows |

**Data attributes:**

| Attribute | Value |
| :--- | :--- |
| `data-slot` | `"calendar-year-view"` |
| `data-slot` (each cell) | `"calendar-year"` |
| `data-current` | `"true"` on the current year |
| `data-selected` | `"true"` on the shown year |
| `data-year` (each cell) | Four-digit year (e.g. `2026`) |

***

## Accessibility

* `Calendar.Root` renders `role="application"` with `aria-label="Calendar"`
* `Calendar.Grid` renders `role="grid"` with `aria-roledescription="calendar"` and `aria-labelledby` linked to the Header
* `Calendar.Weekdays` renders `role="row"` with each weekday cell as `role="columnheader"`
* `Calendar.Day` renders `role="gridcell"` with full ARIA labeling
* Exactly one day is in the tab order: the focused day while a shown month holds it, otherwise the first selected day, today, or the first day that can be picked. A day drawn from a neighbouring month never holds it
* Arrow keys moving between shown months leave the view where it is, and moving past them shifts it by one month
* `Calendar.MonthView` and `Calendar.YearView` are grids with one tab stop: the arrow keys move along and between rows, <Kbd>Home</Kbd>/<Kbd>End</Kbd> go to the start and end of a row, and <Kbd>PageUp</Kbd>/<Kbd>PageDown</Kbd> move a year or a decade
* An `unavailable` day stays in the arrow-key order with `aria-disabled`, and picking it is refused aloud; the arrow keys skip a `disabled` day
* `Calendar.Nav` renders `role="navigation"` with `aria-label="Calendar navigation"`
* Screen reader announcements are rendered automatically via `AnnouncerPortal`
* Keyboard navigation follows the WAI-ARIA grid pattern (<Kbd>ArrowLeft</Kbd>/<Kbd>ArrowRight</Kbd>, <Kbd>PageUp</Kbd>/<Kbd>PageDown</Kbd>, <Kbd>Home</Kbd>/<Kbd>End</Kbd>, <Kbd>Enter</Kbd>/<Kbd>Space</Kbd>, <Kbd>Escape</Kbd>)