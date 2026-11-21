'use client'

import * as Command from '@gentleduck/primitives/command'
import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function CommandDialogExample() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger className={styles.button}>Open with Ctrl K</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content aria-describedby={undefined} className={styles.dialog} style={{ padding: 0 }}>
          <Dialog.Title className={styles.title} style={{ padding: '0.75rem 0.75rem 0' }}>
            Jump to
          </Dialog.Title>
          <Command.Root className={styles.command} aria-label="Jump to" style={{ border: 0, width: '100%' }}>
            <Command.Input className={styles.commandInput} placeholder="Search pages..." />
            <Command.List className={styles.commandList}>
              <Command.Empty className={styles.commandEmpty}>No page found.</Command.Empty>
              {['Dashboard', 'Projects', 'Team', 'Settings'].map((page) => (
                <Command.Item className={styles.item} key={page} onSelect={() => setOpen(false)} value={page}>
                  {page}
                </Command.Item>
              ))}
            </Command.List>
          </Command.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
