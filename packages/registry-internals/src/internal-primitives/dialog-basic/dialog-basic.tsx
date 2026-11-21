'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogBasicExample() {
  const [name, setName] = React.useState('Ada Lovelace')

  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.button}>Edit profile</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content className={`${styles.dialog} ${styles.fade}`}>
          <Dialog.Title className={styles.title}>Edit profile</Dialog.Title>
          <Dialog.Description className={styles.description}>Changes show on your public page.</Dialog.Description>
          <label className={styles.stack}>
            <span className={styles.label}>Name</span>
            <input className={styles.input} onChange={(event) => setName(event.target.value)} value={name} />
          </label>
          <div className={styles.actions}>
            <Dialog.Close className={styles.button}>Cancel</Dialog.Close>
            <Dialog.Close className={`${styles.button} ${styles.primary}`}>Save</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
