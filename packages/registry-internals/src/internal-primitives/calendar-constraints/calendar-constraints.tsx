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
