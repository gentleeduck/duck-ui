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
