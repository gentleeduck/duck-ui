'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from '../primitives.module.css'

export default function TooltipBasicExample() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger className={styles.button}>Hover or focus</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={`${styles.content} ${styles.panel}`} sideOffset={6} style={{ minWidth: 0 }}>
            Add to library
            <Tooltip.Arrow className={styles.arrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
