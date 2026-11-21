'use client'

import * as AlertDialog from '@gentleduck/primitives/alert-dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AlertDialogInitialFocusExample() {
  const confirm = React.useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className={styles.button}>Discard draft</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <AlertDialog.Content className={styles.dialog} initialFocus={confirm}>
          <AlertDialog.Title className={styles.title}>Discard this draft?</AlertDialog.Title>
          <AlertDialog.Description className={styles.description}>
            Focus starts on Discard here, where it would start on Cancel.
          </AlertDialog.Description>
          <div className={styles.actions}>
            <AlertDialog.Cancel className={styles.button}>Keep editing</AlertDialog.Cancel>
            <AlertDialog.Action className={`${styles.button} ${styles.primary}`} ref={confirm}>
              Discard
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
