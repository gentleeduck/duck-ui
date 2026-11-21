'use client'

import { Slot } from '@gentleduck/primitives/slot'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SlotMergePropsExample() {
  const [log, setLog] = React.useState<string[]>([])
  const add = (entry: string) => () => setLog((entries) => [...entries, entry].slice(-4))

  return (
    <div className={styles.stack}>
      <Slot className={styles.button} onClick={add('slot handler')} style={{ padding: '0.6rem 1rem' }}>
        <button className={styles.primary} onClick={add('child handler')} style={{ padding: '0.3rem' }} type="button">
          Click me
        </button>
      </Slot>
      <p className={styles.note}>
        Both classes apply, the child's padding wins, and both handlers run, the child's first. {log.join(', ')}
      </p>
    </div>
  )
}
