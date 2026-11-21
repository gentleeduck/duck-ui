'use client'

import * as HoverCard from '@gentleduck/primitives/hover-card'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function HoverCardControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <HoverCard.Root disabled={disabled} onOpenChange={setOpen} open={open}>
          <HoverCard.Trigger className={styles.button} href="#">
            Hover or focus me
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content className={`${styles.content} ${styles.panel}`} side="right" sideOffset={8}>
              The page holds this card's state.
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
        <button className={styles.button} onClick={() => setDisabled((value) => !value)} type="button">
          {disabled ? 'Enable' : 'Disable'}
        </button>
      </div>
      <p className={styles.note}>{open ? 'Open' : 'Closed'}. Disabled, it stays closed, and closes if it was open.</p>
    </div>
  )
}
