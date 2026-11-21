'use client'

import { Portal } from '@gentleduck/primitives/portal'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PortalBodyExample() {
  const [shown, setShown] = React.useState(false)

  return (
    <div className={styles.box} style={{ overflow: 'hidden', position: 'relative' }}>
      <button className={styles.button} onClick={() => setShown((value) => !value)} type="button">
        {shown ? 'Remove the toast' : 'Show a toast'}
      </button>
      {shown ? (
        <Portal>
          <div
            className={`${styles.content} ${styles.panel}`}
            style={{ bottom: '1rem', insetInlineEnd: '1rem', position: 'fixed' }}>
            Rendered into the body, so this box's overflow does not clip it.
          </div>
        </Portal>
      ) : null}
    </div>
  )
}
