'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuOpenDialogExample() {
  const trigger = React.useRef<HTMLButtonElement>(null)
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.button} ref={trigger}>
          Actions
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
            <DropdownMenu.Item className={styles.item}>Rename</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item} onSelect={() => setOpen(true)}>
              Delete...
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Dialog.Root onOpenChange={setOpen} open={open}>
        <Dialog.Portal>
          <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
          <Dialog.Content className={styles.dialog} finalFocus={trigger}>
            <Dialog.Title className={styles.title}>Delete the file?</Dialog.Title>
            <Dialog.Description className={styles.description}>
              On close, focus goes back to the Actions button.
            </Dialog.Description>
            <div className={styles.actions}>
              <Dialog.Close className={styles.button}>Cancel</Dialog.Close>
              <Dialog.Close className={`${styles.button} ${styles.danger}`}>Delete</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
