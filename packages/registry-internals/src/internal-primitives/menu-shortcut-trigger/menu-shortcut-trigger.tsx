'use client'

import * as Menu from '@gentleduck/primitives/menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenuShortcutTriggerExample() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '.' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Menu.Root onOpenChange={setOpen} open={open}>
      <Menu.Anchor className={styles.box}>Press Ctrl . to open the quick actions here</Menu.Anchor>
      <Menu.Portal>
        <Menu.Content className={styles.content} sideOffset={6}>
          <Menu.Item className={styles.item}>Quick fix</Menu.Item>
          <Menu.Item className={styles.item}>Rename symbol</Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
