'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import * as React from 'react'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()

export default function CalendarControlledExample() {
  const [month, setMonth] = React.useState(() => new Date())
  const [selected, setSelected] = React.useState<Date | null>(null)
  const [escapes, setEscapes] = React.useState(0)
  const today = new Date()

  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        locale={{ locale: 'en-US' }}
        mode="single"
        month={month}
        onDismiss={() => setEscapes((count) => count + 1)}
        onMonthChange={setMonth}
        onSelect={(value) => setSelected(value as Date | null)}
        selected={selected}>
        <Calendar.Nav>
          <Calendar.PrevButton>{'<'}</Calendar.PrevButton>
          <Calendar.Header />
          <Calendar.NextButton>{'>'}</Calendar.NextButton>
        </Calendar.Nav>
        <Calendar.Grid />
      </Calendar.Root>
      <div className={styles.row}>
        <button
          className={styles.button}
          onClick={() => {
            setMonth(today)
            setSelected(today)
          }}
          type="button">
          Today
        </button>
        <button className={styles.button} onClick={() => setSelected(null)} type="button">
          Clear
        </button>
      </div>
      <p className={styles.note}>Escape in the grid called onDismiss {escapes} times.</p>
    </div>
  )
}
