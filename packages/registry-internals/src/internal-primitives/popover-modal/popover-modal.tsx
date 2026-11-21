'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from '../primitives.module.css'

export default function PopoverModalExample() {
  return (
    <Popover.Root modal>
      <Popover.Trigger className={styles.button}>Share</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={`${styles.content} ${styles.panel} ${styles.stack}`} sideOffset={8}>
          <Popover.Title className={styles.title}>Share link</Popover.Title>
          <input className={styles.input} readOnly value="https://gentleduck.org/s/x7f" />
          <Popover.Close className={styles.button}>Close</Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
