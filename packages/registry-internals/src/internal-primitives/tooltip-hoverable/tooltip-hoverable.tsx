'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from '../primitives.module.css'

function Tip({ label, disableHoverableContent }: { label: string; disableHoverableContent?: boolean }) {
  return (
    <Tooltip.Root disableHoverableContent={disableHoverableContent}>
      <Tooltip.Trigger className={styles.button}>{label}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={`${styles.content} ${styles.panel}`} sideOffset={6} style={{ minWidth: 0 }}>
          {disableHoverableContent ? 'Closes as the pointer leaves the trigger.' : 'Move onto me and I stay.'}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default function TooltipHoverableExample() {
  return (
    <Tooltip.Provider closeDelay={150} delayDuration={200}>
      <div className={styles.row}>
        <Tip label="Hoverable" />
        <Tip disableHoverableContent label="Not hoverable" />
      </div>
    </Tooltip.Provider>
  )
}
