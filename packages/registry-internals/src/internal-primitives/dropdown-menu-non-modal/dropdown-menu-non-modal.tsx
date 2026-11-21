'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuNonModalExample() {
  const [text, setText] = React.useState('')

  return (
    <div className={styles.stack}>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger className={styles.button}>Formatting</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
            <DropdownMenu.Item className={styles.item}>Bold</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>Italic</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <input
        className={styles.input}
        onChange={(event) => setText(event.target.value)}
        placeholder="Still clickable with the menu open"
        value={text}
      />
      <p className={styles.note}>
        modal off leaves the page scrollable and the field clickable while the menu is open.
      </p>
    </div>
  )
}
