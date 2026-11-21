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
