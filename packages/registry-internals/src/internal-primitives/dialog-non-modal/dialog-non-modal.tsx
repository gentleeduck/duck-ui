'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogNonModalExample() {
  const [notes, setNotes] = React.useState('')

  return (
    <div className={styles.stack}>
      <Dialog.Root modal={false}>
        <Dialog.Trigger className={styles.button}>Open notes</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content
            aria-describedby={undefined}
            className={styles.dialog}
            onInteractOutside={(event) => event.preventDefault()}
            style={{ top: 'auto', bottom: '1rem', left: 'auto', right: '1rem', transform: 'none' }}>
            <Dialog.Title className={styles.title}>Notes</Dialog.Title>
            <textarea
              className={styles.input}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              value={notes}
            />
            <Dialog.Close className={styles.button}>Close</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <p className={styles.note}>
        modal off traps no focus and locks nothing, so the page stays usable beside it, and a press outside is kept from
        closing it here.
      </p>
    </div>
  )
}
