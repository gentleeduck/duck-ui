'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import styles from '../primitives.module.css'

export default function DialogNestedExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.button}>Open settings</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content
          aria-describedby={undefined}
          className={styles.dialog}
          style={{
            scale: 'calc(1 - 0.05 * var(--gentleduck-dialog-nested-dialogs, 0))',
            transition: 'scale 200ms ease',
          }}>
          <Dialog.Title className={styles.title}>Settings</Dialog.Title>
          <Dialog.Root>
            <Dialog.Trigger className={styles.button}>Change password</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Content aria-describedby={undefined} className={styles.dialog}>
                <Dialog.Title className={styles.title}>Change password</Dialog.Title>
                <input className={styles.input} placeholder="New password" type="password" />
                <Dialog.Close className={styles.button}>Back</Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Dialog.Close className={styles.button}>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
