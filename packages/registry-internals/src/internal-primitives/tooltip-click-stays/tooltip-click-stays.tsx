'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function TooltipClickStaysExample() {
  const [count, setCount] = React.useState(0)

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger className={styles.button} disableCloseOnClick onClick={() => setCount((value) => value + 1)}>
          Like ({count})
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={`${styles.content} ${styles.panel}`} sideOffset={6} style={{ minWidth: 0 }}>
            disableCloseOnClick keeps this open while you click.
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
