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
