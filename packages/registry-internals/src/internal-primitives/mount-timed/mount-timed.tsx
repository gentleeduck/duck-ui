'use client'

import { Mount } from '@gentleduck/primitives/mount'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MountTimedExample() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <Mount animationDuration={300} open={open}>
        <div className={`${styles.content} ${styles.panel} ${styles.fade}`} data-state={open ? 'open' : 'closed'}>
          Unmounted 300ms after it closes, long enough for its fade.
        </div>
      </Mount>
    </div>
  )
}
