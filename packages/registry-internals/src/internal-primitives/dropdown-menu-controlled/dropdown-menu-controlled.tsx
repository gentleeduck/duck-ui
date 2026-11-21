'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [opens, setOpens] = React.useState(0)

  return (
    <div className={styles.stack}>
      <DropdownMenu.Root
        onOpenChange={(next) => {
          setOpen(next)
          if (next) setOpens((count) => count + 1)
        }}
        open={open}>
        <DropdownMenu.Trigger className={styles.button}>Options</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
            <DropdownMenu.Item className={styles.item}>Duplicate</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>Archive</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <p className={styles.note}>
        {open ? 'Open' : 'Closed'}, opened {opens} times. onOpenChange hears every way it opens and closes.
      </p>
    </div>
  )
}
