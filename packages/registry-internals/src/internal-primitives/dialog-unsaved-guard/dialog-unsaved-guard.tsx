'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogUnsavedGuardExample() {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState('')
  const [warned, setWarned] = React.useState(false)
  const guard = (event: Event) => {
    if (!text) return
    event.preventDefault()
    setWarned(true)
  }

  return (
    <Dialog.Root
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setText('')
          setWarned(false)
        }
      }}
      open={open}>
      <Dialog.Trigger className={styles.button}>Write a reply</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content
          aria-describedby={undefined}
          className={styles.dialog}
          onEscapeKeyDown={guard}
          onPointerDownOutside={guard}>
          <Dialog.Title className={styles.title}>Reply</Dialog.Title>
          <textarea className={styles.input} onChange={(event) => setText(event.target.value)} rows={4} value={text} />
          {warned ? <p className={styles.note}>You have unsaved text. Use Discard to close.</p> : null}
          <div className={styles.actions}>
            <Dialog.Close className={styles.button}>Discard</Dialog.Close>
            <Dialog.Close className={`${styles.button} ${styles.primary}`}>Send</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
