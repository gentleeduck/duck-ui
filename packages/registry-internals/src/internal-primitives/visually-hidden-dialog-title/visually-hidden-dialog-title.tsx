'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import { VisuallyHidden } from '@gentleduck/primitives/visibility-hidden'
import styles from '../primitives.module.css'

export default function VisuallyHiddenDialogTitleExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.button}>Open a photo</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content aria-describedby={undefined} className={styles.dialog}>
          <VisuallyHidden asChild>
            <Dialog.Title>Sunset over the harbour</Dialog.Title>
          </VisuallyHidden>
          <div className={styles.box} style={{ height: '10rem' }} />
          <Dialog.Close className={styles.button}>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
