'use client'

import { Presence } from '@gentleduck/primitives/presence'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PresenceExitAnimationExample() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <Presence present={open}>
        <div className={`${styles.content} ${styles.panel} ${styles.fade}`} data-state={open ? 'open' : 'closed'}>
          Stays in the page until its fade out ends.
        </div>
      </Presence>
    </div>
  )
}
