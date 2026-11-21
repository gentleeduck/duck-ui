'use client'

import { Presence } from '@gentleduck/primitives/presence'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PresenceRenderFunctionExample() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <Presence present={open}>
        {({ present }) => (
          <div className={`${styles.content} ${styles.panel} ${styles.fade}`} data-state={present ? 'open' : 'closed'}>
            The child reads present itself while it animates out.
          </div>
        )}
      </Presence>
    </div>
  )
}
