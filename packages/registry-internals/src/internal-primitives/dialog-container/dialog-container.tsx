'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogContainerExample() {
  const [box, setBox] = React.useState<HTMLDivElement | null>(null)

  return (
    <div className={styles.stack}>
      <Dialog.Root modal={false}>
        <Dialog.Trigger className={styles.button}>Open in the box</Dialog.Trigger>
        <Dialog.Portal container={box}>
          <Dialog.Content aria-describedby={undefined} className={`${styles.content} ${styles.panel}`}>
            <Dialog.Title className={styles.title}>Rendered in the box below</Dialog.Title>
            <Dialog.Close className={styles.button}>Close</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className={styles.box} ref={setBox} style={{ minHeight: '5rem', minWidth: '16rem' }} />
    </div>
  )
}
