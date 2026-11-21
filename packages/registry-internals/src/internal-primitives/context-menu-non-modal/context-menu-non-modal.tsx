'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ContextMenuNonModalExample() {
  const [clicks, setClicks] = React.useState(0)

  return (
    <div className={styles.stack}>
      <ContextMenu.Root modal={false}>
        <ContextMenu.Trigger className={styles.contextArea}>Right-click, then use the button</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Item className={styles.item}>Copy</ContextMenu.Item>
            <ContextMenu.Item className={styles.item}>Paste</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <button className={styles.button} onClick={() => setClicks((count) => count + 1)} type="button">
        Clicked {clicks} times
      </button>
      <p className={styles.note}>modal off leaves the page scrollable and clickable while the menu is open.</p>
    </div>
  )
}
