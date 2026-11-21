'use client'

import { DismissableLayer, DismissableLayerBranch } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DismissableLayerBranchExample() {
  const [open, setOpen] = React.useState(true)
  const [saved, setSaved] = React.useState(0)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen(true)} type="button">
        Open editor
      </button>
      {open ? (
        <DismissableLayer className={`${styles.content} ${styles.panel}`} onDismiss={() => setOpen(false)}>
          An open editor
        </DismissableLayer>
      ) : null}
      <DismissableLayerBranch className={styles.box}>
        <button className={styles.button} onClick={() => setSaved((count) => count + 1)} type="button">
          Save from the toolbar ({saved})
        </button>
        <p className={styles.note}>A press in this branch leaves the editor open; one anywhere else closes it.</p>
      </DismissableLayerBranch>
    </div>
  )
}
