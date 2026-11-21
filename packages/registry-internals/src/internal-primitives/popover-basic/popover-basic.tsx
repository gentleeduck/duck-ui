'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from '../primitives.module.css'

export default function PopoverBasicExample() {
  return (
    <Popover.Root>
      <Popover.Trigger className={styles.button}>Dimensions</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={`${styles.content} ${styles.panel} ${styles.stack}`} sideOffset={8}>
          <Popover.Title className={styles.title}>Dimensions</Popover.Title>
          <Popover.Description className={styles.description}>Set the layer's size.</Popover.Description>
          <label className={styles.row}>
            <span className={styles.label}>Width</span>
            <input className={styles.input} defaultValue="100%" />
          </label>
          <Popover.Close className={styles.button}>Done</Popover.Close>
          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
