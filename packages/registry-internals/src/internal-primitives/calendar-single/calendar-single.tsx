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
