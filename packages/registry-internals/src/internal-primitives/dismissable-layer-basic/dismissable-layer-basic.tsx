'use client'

import { DismissableLayer } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DismissableLayerBasicExample() {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState('none yet')

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen(true)} type="button">
        Show panel
      </button>
      {open ? (
        <DismissableLayer
          className={`${styles.content} ${styles.panel}`}
          onDismiss={() => setOpen(false)}
          onEscapeKeyDown={() => setReason('Escape')}
          onFocusOutside={() => setReason('focus moved out')}
          onPointerDownOutside={() => setReason('press outside')}>
          Press Escape, click outside, or Tab away.
          <button className={styles.button} type="button">
            A button inside
          </button>
        </DismissableLayer>
      ) : null}
      <p className={styles.note}>Last dismissed by: {reason}.</p>
    </div>
  )
}
