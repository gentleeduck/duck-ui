'use client'

import { Portal } from '@gentleduck/primitives/portal'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PortalContainerExample() {
  const target = React.useRef<HTMLDivElement>(null)

  return (
    <div className={styles.row}>
      <div className={styles.box}>
        Source
        <Portal asChild container={target}>
          <span className={styles.note}>Rendered over there</span>
        </Portal>
      </div>
      <div className={styles.box} ref={target}>
        Target:{' '}
      </div>
    </div>
  )
}
