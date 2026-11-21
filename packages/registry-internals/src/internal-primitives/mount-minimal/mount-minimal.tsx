'use client'

import { MountMinimal } from '@gentleduck/primitives/mount'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MountMinimalExample() {
  const [open, setOpen] = React.useState(false)
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Collapse' : 'Expand'}
      </button>
      <div className={`${styles.box} ${styles.collapse}`} data-state={open ? 'open' : 'closed'} ref={panel}>
        <div>
          <MountMinimal open={open} ref={panel}>
            <p className={styles.note}>Unmounted once the parent's grid transition ends, however long that is.</p>
          </MountMinimal>
        </div>
      </div>
    </div>
  )
}
