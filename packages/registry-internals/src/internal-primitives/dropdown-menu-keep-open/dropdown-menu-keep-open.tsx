'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuKeepOpenExample() {
  const [zoom, setZoom] = React.useState(100)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.button}>Zoom {zoom}%</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
          <DropdownMenu.Item
            className={styles.item}
            closeOnSelect={false}
            onSelect={() => setZoom((value) => value + 10)}>
            Zoom in <span className={styles.shortcut}>{zoom + 10}%</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={styles.item}
            closeOnSelect={false}
            onSelect={() => setZoom((value) => Math.max(10, value - 10))}>
            Zoom out <span className={styles.shortcut}>{Math.max(10, zoom - 10)}%</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={styles.separator} />
          <DropdownMenu.Item className={styles.item} onSelect={() => setZoom(100)}>
            Reset and close
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
