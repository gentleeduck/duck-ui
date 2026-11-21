'use client'

import { NativeAdapter } from '@gentleduck/calendar'
import * as Calendar from '@gentleduck/primitives/calendar'
import * as React from 'react'
import styles from '../primitives.module.css'

const adapter = new NativeAdapter()
const today = new Date()
const due = new Date(today.getFullYear(), today.getMonth(), 15)

export default function CalendarReadOnlyExample() {
  const [invalid, setInvalid] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Calendar.Root
        adapter={adapter}
        className={styles.calendar}
        defaultSelected={due}
        invalid={invalid}
        locale={{ locale: 'en-US' }}
        mode="single"
        readOnly>
        <Calendar.Header />
        <Calendar.Grid />
      </Calendar.Root>
      <button className={styles.button} onClick={() => setInvalid((value) => !value)} type="button">
        {invalid ? 'Mark valid' : 'Mark invalid'}
      </button>
      <p className={styles.note}>
        readOnly lets focus move but picks nothing. invalid marks the selection for the eye and aria-invalid.
      </p>
    </div>
  )
}
