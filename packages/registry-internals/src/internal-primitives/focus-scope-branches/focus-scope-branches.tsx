'use client'

import { FocusScope } from '@gentleduck/primitives/focus-scope'
import { Portal } from '@gentleduck/primitives/portal'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function FocusScopeBranchesExample() {
  const [branch, setBranch] = React.useState<HTMLDivElement | null>(null)

  return (
    <div className={styles.stack}>
      <FocusScope branches={branch ? [branch] : []} className={`${styles.box} ${styles.stack}`} loop trapped>
        <input className={styles.input} placeholder="Inside the scope" />
        <Portal>
          <div
            className={`${styles.content} ${styles.panel}`}
            ref={setBranch}
            style={{ position: 'fixed', bottom: '1rem', insetInlineEnd: '1rem' }}>
            <button className={styles.button} type="button">
              Portalled, still reachable
            </button>
          </div>
        </Portal>
      </FocusScope>
      <p className={styles.note}>The trapped scope lets focus into the portalled panel, its branch, and back.</p>
    </div>
  )
}
