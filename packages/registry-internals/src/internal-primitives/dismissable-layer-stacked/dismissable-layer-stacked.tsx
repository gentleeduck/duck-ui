'use client'

import { DismissableLayer } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DismissableLayerStackedExample() {
  const [outer, setOuter] = React.useState(false)
  const [inner, setInner] = React.useState(false)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOuter(true)} type="button">
        Open the first layer
      </button>
      {outer ? (
        <DismissableLayer
          className={`${styles.content} ${styles.panel} ${styles.stack}`}
          onDismiss={() => setOuter(false)}>
          First layer
          <button className={styles.button} onClick={() => setInner(true)} type="button">
            Open a second layer
          </button>
          {inner ? (
            <DismissableLayer className={`${styles.content} ${styles.panel}`} onDismiss={() => setInner(false)}>
              Second layer: Escape closes this one first.
            </DismissableLayer>
          ) : null}
        </DismissableLayer>
      ) : null}
    </div>
  )
}
