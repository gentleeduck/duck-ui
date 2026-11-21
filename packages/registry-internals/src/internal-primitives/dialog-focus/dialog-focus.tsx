'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogFocusExample() {
  const email = React.useRef<HTMLInputElement>(null)
  const after = React.useRef<HTMLButtonElement>(null)

  return (
    <div className={styles.row}>
      <Dialog.Root>
        <Dialog.Trigger className={styles.button}>Invite</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
          <Dialog.Content className={styles.dialog} finalFocus={after} initialFocus={email}>
            <Dialog.Title className={styles.title}>Invite a teammate</Dialog.Title>
            <Dialog.Description className={styles.description}>
              Focus starts in the email field, not on the first field, and lands on "Next step" once closed.
            </Dialog.Description>
            <input className={styles.input} placeholder="Name" />
            <input className={styles.input} placeholder="Email" ref={email} type="email" />
            <div className={styles.actions}>
              <Dialog.Close className={styles.button}>Done</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <button className={styles.button} ref={after} type="button">
        Next step
      </button>
    </div>
  )
}
