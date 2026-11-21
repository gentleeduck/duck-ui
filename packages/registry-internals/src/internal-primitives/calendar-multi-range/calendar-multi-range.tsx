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
