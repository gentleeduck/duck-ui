'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from '../primitives.module.css'

export default function TooltipAriaLabelExample() {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger aria-label="Shortcuts" className={styles.button}>
          ?
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            aria-label="Keyboard shortcuts: Control K opens search"
            className={`${styles.content} ${styles.panel}`}
            sideOffset={6}
            style={{ minWidth: 0 }}>
            <kbd>Ctrl</kbd> + <kbd>K</kbd>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
