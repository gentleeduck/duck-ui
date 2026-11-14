import { NativeAdapter, PersianAdapter } from '@gentleduck/calendar'
import * as React from 'react'
import * as Calendar from '..'
import styles from './calendar.stories.module.css'

export default {
  title: 'Components/Calendar',
}

const adapter = new NativeAdapter()
const persian = new PersianAdapter()
const march2026 = new Date(2026, 2, 1)
const closed = [new Date(2026, 2, 17)]
const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

type Value = Parameters<NonNullable<Calendar.ICalendar.IRootProps['onSelect']>>[0]

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

function show(value: Value): string {
  if (value === null) return 'none'
  if (value instanceof Date) return iso(value)
  if (Array.isArray(value)) return value.length ? value.map((entry) => show(entry)).join(', ') : 'none'
  return `${iso(value.from)} to ${value.to ? iso(value.to) : '...'}`
}

function Nav() {
  return (
    <Calendar.Nav>
      <Calendar.PrevButton>Prev</Calendar.PrevButton>
      <Calendar.Header />
      <Calendar.NextButton>Next</Calendar.NextButton>
    </Calendar.Nav>
  )
}

function Picked({ value }: { value: string }) {
  return <output aria-label="Picked">{value}</output>
}

export const Single = () => {
  const [picked, setPicked] = React.useState('none')
  return (
    <>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        defaultMonth={march2026}
        locale={{ locale: 'en-US' }}
        mode="single"
        onSelect={(value) => setPicked(show(value))}>
        <Nav />
        <Calendar.Grid />
      </Calendar.Root>
      <Picked value={picked} />
    </>
  )
}

export const Range = () => {
  const [picked, setPicked] = React.useState('none')
  return (
    <>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        defaultMonth={march2026}
        locale={{ locale: 'en-US' }}
        mode="range"
        numberOfMonths={2}
        onSelect={(value) => setPicked(show(value))}
        pageBehavior="visible">
        <Nav />
        <div className={styles.months}>
          <Calendar.Grid month={0} />
          <Calendar.Grid month={1} />
        </div>
      </Calendar.Root>
      <Picked value={picked} />
    </>
  )
}

export const Multiple = () => {
  const [picked, setPicked] = React.useState('none')
  return (
    <>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        defaultMonth={march2026}
        locale={{ locale: 'en-US' }}
        mode="multi"
        onSelect={(value) => setPicked(show(value))}>
        <Nav />
        <Calendar.Grid />
      </Calendar.Root>
      <Picked value={picked} />
    </>
  )
}

export const Bounds = () => (
  <Calendar.Root
    adapter={adapter}
    className={styles.calendar}
    defaultMonth={march2026}
    disabled={closed}
    fromDate={new Date(2026, 2, 10)}
    locale={{ locale: 'en-US' }}
    mode="single"
    toDate={new Date(2026, 3, 20)}
    unavailable={weekend}>
    <Nav />
    <Calendar.Grid />
  </Calendar.Root>
)

export const ReadOnly = () => (
  <Calendar.Root
    adapter={adapter}
    className={styles.calendar}
    defaultMonth={march2026}
    defaultSelected={new Date(2026, 2, 12)}
    locale={{ locale: 'en-US' }}
    mode="single"
    readOnly>
    <Nav />
    <Calendar.Grid />
  </Calendar.Root>
)

export const WeekNumbers = () => (
  <Calendar.Root
    adapter={adapter}
    className={styles.calendar}
    defaultMonth={march2026}
    locale={{ locale: 'en-GB', weekStartDay: 1 }}
    mode="single"
    showWeekNumber>
    <Nav />
    <Calendar.Grid />
  </Calendar.Root>
)

export const Views = () => (
  <Calendar.Root
    adapter={adapter}
    className={styles.calendar}
    data-testid="calendar"
    defaultMonth={march2026}
    locale={{ locale: 'en-US' }}
    mode="single">
    <Calendar.Header />
    <Calendar.ViewTrigger view="years">Pick a year</Calendar.ViewTrigger>
    <Calendar.ViewTrigger view="months">Pick a month</Calendar.ViewTrigger>
    <div className={styles.months}>
      <Calendar.YearView />
      <Calendar.MonthView />
    </div>
  </Calendar.Root>
)

export const RightToLeft = () => (
  <Calendar.Root
    adapter={adapter}
    className={styles.calendar}
    data-testid="calendar"
    defaultMonth={march2026}
    locale={{ locale: 'ar-EG', direction: 'rtl' }}
    mode="single">
    <Nav />
    <Calendar.Grid />
  </Calendar.Root>
)

export const Persian = () => {
  const [picked, setPicked] = React.useState('none')
  return (
    <>
      <Calendar.Root
        adapter={persian}
        className={styles.calendar}
        defaultMonth={march2026}
        locale={{ locale: 'fa-IR', direction: 'rtl' }}
        mode="single"
        onSelect={(value) => setPicked(show(value))}>
        <Nav />
        <Calendar.Grid />
      </Calendar.Root>
      <Picked value={picked} />
    </>
  )
}

export const MultiRange = () => {
  const [picked, setPicked] = React.useState('none')
  return (
    <>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        defaultMonth={march2026}
        locale={{ locale: 'en-US' }}
        mode="multi-range"
        onSelect={(value) => setPicked(show(value))}>
        <Nav />
        <Calendar.Grid />
      </Calendar.Root>
      <Picked value={picked} />
    </>
  )
}

export const Controlled = () => {
  const [month, setMonth] = React.useState(march2026)
  const [selected, setSelected] = React.useState<Date | null>(new Date(2026, 2, 12))
  const [dismissed, setDismissed] = React.useState(0)
  return (
    <>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        locale={{ locale: 'en-US' }}
        mode="single"
        month={month}
        onDismiss={() => setDismissed((count) => count + 1)}
        onMonthChange={setMonth}
        onSelect={(value) => setSelected(value as Date | null)}
        selected={selected}>
        <Nav />
        <Calendar.Grid />
      </Calendar.Root>
      <button type="button" onClick={() => setMonth(new Date(2026, 5, 1))}>
        June
      </button>
      <button type="button" onClick={() => setSelected(null)}>
        Clear
      </button>
      <Picked value={`${iso(month)} ${selected ? iso(selected) : 'none'} dismissed ${dismissed}`} />
    </>
  )
}

export const FixedWeeks = () => (
  <Calendar.Root
    adapter={adapter}
    className={styles.calendar}
    defaultMonth={new Date(2026, 1, 1)}
    fixedWeeks
    locale={{ locale: 'en-US' }}
    mode="single"
    showOutsideDays={false}>
    <Nav />
    <Calendar.Grid />
  </Calendar.Root>
)

export const Invalid = () => (
  <Calendar.Root
    adapter={adapter}
    className={styles.calendar}
    defaultMonth={march2026}
    defaultSelected={{ from: new Date(2026, 2, 10), to: new Date(2026, 2, 12) }}
    invalid
    locale={{ locale: 'en-US' }}
    mode="range">
    <Nav />
    <Calendar.Grid />
  </Calendar.Root>
)
