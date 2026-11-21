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
