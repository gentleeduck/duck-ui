'use client'

import { useSize } from '@gentleduck/primitives/hooks/use-size'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function HooksSizeExample() {
  const [element, setElement] = React.useState<HTMLTextAreaElement | null>(null)
  const size = useSize(element)

  return (
    <div className={styles.stack}>
      <textarea
        className={styles.input}
        defaultValue="Drag my corner."
        ref={setElement}
        rows={3}
        style={{ resize: 'both' }}
      />
      <p className={styles.note}>{size ? `${Math.round(size.width)} x ${Math.round(size.height)}` : 'Measuring...'}</p>
    </div>
  )
}
