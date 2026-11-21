'use client'

import * as AlertDialog from '@gentleduck/primitives/alert-dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AlertDialogAsyncActionExample() {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [archived, setArchived] = React.useState(0)

  async function archive(event: React.MouseEvent) {
    event.preventDefault()
    setBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setBusy(false)
    setArchived((count) => count + 1)
    setOpen(false)
  }

  return (
    <div className={styles.stack}>
      <AlertDialog.Root onOpenChange={(next) => busy || setOpen(next)} open={open}>
        <AlertDialog.Trigger className={styles.button}>Archive workspace</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
          <AlertDialog.Content className={styles.dialog}>
            <AlertDialog.Title className={styles.title}>Archive this workspace?</AlertDialog.Title>
            <AlertDialog.Description className={styles.description}>
              Members lose access until an owner restores it.
            </AlertDialog.Description>
            <div className={styles.actions}>
              <AlertDialog.Cancel className={styles.button} disabled={busy}>
                Cancel
              </AlertDialog.Cancel>
              <AlertDialog.Action className={`${styles.button} ${styles.danger}`} disabled={busy} onClick={archive}>
                {busy ? 'Archiving...' : 'Archive'}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <p className={styles.note}>
        The action prevents the close, waits for its work, then closes itself. Archived {archived} times.
      </p>
    </div>
  )
}
