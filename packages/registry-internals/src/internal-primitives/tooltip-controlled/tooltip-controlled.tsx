'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function TooltipControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <Tooltip.Provider>
      <div className={styles.stack}>
        <div className={styles.row}>
          <Tooltip.Root disabled={disabled} onOpenChange={setOpen} open={open}>
            <Tooltip.Trigger className={styles.button}>Save</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className={`${styles.content} ${styles.panel}`} sideOffset={6} style={{ minWidth: 0 }}>
                Ctrl S
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
            {open ? 'Hide the tip' : 'Show the tip'}
          </button>
          <button className={styles.button} onClick={() => setDisabled((value) => !value)} type="button">
            {disabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      </div>
    </Tooltip.Provider>
  )
}
