'use client'

import * as Menu from '@gentleduck/primitives/menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenuAnchorExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <Menu.Root modal={false} onOpenChange={setOpen} open={open}>
      <Menu.Anchor asChild>
        <button
          aria-expanded={open}
          aria-haspopup="menu"
          className={styles.button}
          onKeyDown={(event) => {
            if (!['Enter', ' ', 'ArrowDown'].includes(event.key)) return
            event.preventDefault()
            setOpen(true)
          }}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.ctrlKey) return
            setOpen(!open)
            if (!open) event.preventDefault()
          }}
          type="button">
          A trigger of your own
        </button>
      </Menu.Anchor>
      <Menu.Portal>
        <Menu.Content align="start" className={styles.content} sideOffset={6}>
          <Menu.Item className={styles.item}>New tab</Menu.Item>
          <Menu.Item className={styles.item}>New window</Menu.Item>
          <Menu.Separator className={styles.separator} />
          <Menu.Item className={styles.item}>Close</Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
