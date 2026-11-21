'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ContextMenuDisabledExample() {
  const [disabled, setDisabled] = React.useState(true)

  return (
    <div className={styles.stack}>
      <ContextMenu.Root>
        <ContextMenu.Trigger className={styles.contextArea} disabled={disabled}>
          {disabled ? 'The browser menu shows here' : 'The custom menu shows here'}
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Item className={styles.item}>Rename</ContextMenu.Item>
            <ContextMenu.Item className={styles.item}>Duplicate</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <button className={styles.button} onClick={() => setDisabled((value) => !value)} type="button">
        {disabled ? 'Use the custom menu' : 'Use the browser menu'}
      </button>
    </div>
  )
}
