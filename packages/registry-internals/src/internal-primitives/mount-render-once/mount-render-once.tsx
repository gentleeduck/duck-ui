'use client'

import { MountMinimal } from '@gentleduck/primitives/mount'
import * as React from 'react'
import styles from '../primitives.module.css'

function Expensive() {
  const [mountedAt] = React.useState(() => new Date().toLocaleTimeString())
  return <p className={styles.note}>Mounted at {mountedAt}. It keeps its state while hidden.</p>
}

export default function MountRenderOnceExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <div hidden={!open}>
        <MountMinimal open={open} renderOnce>
          <Expensive />
        </MountMinimal>
      </div>
    </div>
  )
}
