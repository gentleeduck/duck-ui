'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from '../primitives.module.css'

export default function PopoverAnchorExample() {
  return (
    <Popover.Root>
      <Popover.Anchor className={`${styles.box} ${styles.row}`}>
        <input className={styles.input} placeholder="Search..." />
        <Popover.Trigger className={styles.button}>Filters</Popover.Trigger>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content align="start" className={`${styles.content} ${styles.panel}`} sideOffset={6}>
          Placed against the whole bar, not the Filters button.
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
