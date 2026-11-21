'use client'

import { DismissableLayer } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DismissableLayerBlockOutsideExample() {
  const [open, setOpen] = React.useState(false)
  const [clicks, setClicks] = React.useState(0)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setOpen(true)} type="button">
          Open a blocking layer
        </button>
        <button className={styles.button} onClick={() => setClicks((count) => count + 1)} type="button">
          Counter {clicks}
        </button>
      </div>
      {open ? (
        <DismissableLayer
          className={`${styles.content} ${styles.panel}`}
          disableOutsidePointerEvents
          onDismiss={() => setOpen(false)}>
          While this is open the counter cannot be pressed: the first press outside only closes it.
        </DismissableLayer>
      ) : null}
    </div>
  )
}
