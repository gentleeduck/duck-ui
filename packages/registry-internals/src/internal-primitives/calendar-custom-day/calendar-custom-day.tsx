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
