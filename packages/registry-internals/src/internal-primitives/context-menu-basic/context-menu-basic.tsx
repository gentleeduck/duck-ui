'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ContextMenuBasicExample() {
  const [last, setLast] = React.useState('nothing')

  return (
    <div className={styles.stack}>
      <ContextMenu.Root>
        <ContextMenu.Trigger className={styles.contextArea}>Right-click or long-press here</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Label className={styles.groupLabel}>Edit</ContextMenu.Label>
            <ContextMenu.Item className={styles.item} onSelect={() => setLast('Back')}>
              Back <span className={styles.shortcut}>Alt Left</span>
            </ContextMenu.Item>
            <ContextMenu.Item className={styles.item} disabled>
              Forward <span className={styles.shortcut}>Alt Right</span>
            </ContextMenu.Item>
            <ContextMenu.Item className={styles.item} onSelect={() => setLast('Reload')}>
              Reload <span className={styles.shortcut}>Ctrl R</span>
            </ContextMenu.Item>
            <ContextMenu.Separator className={styles.separator} />
            <ContextMenu.Item className={styles.item} onSelect={() => setLast('Inspect')}>
              Inspect
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <p className={styles.note}>Last chosen: {last}.</p>
    </div>
  )
}
