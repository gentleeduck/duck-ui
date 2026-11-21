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
