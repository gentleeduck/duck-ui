'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from '../primitives.module.css'

export default function TooltipSidesExample() {
  return (
    <Tooltip.Provider delayDuration={100}>
      <div className={styles.row}>
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip.Root key={side}>
            <Tooltip.Trigger className={styles.button}>{side}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className={`${styles.content} ${styles.panel}`}
                side={side}
                sideOffset={6}
                style={{ minWidth: 0 }}>
                On the {side}
                <Tooltip.Arrow className={styles.arrow} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  )
}
