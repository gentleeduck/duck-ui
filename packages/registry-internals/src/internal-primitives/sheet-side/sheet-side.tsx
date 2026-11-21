'use client'

import * as Sheet from '@gentleduck/primitives/sheet'
import styles from '../primitives.module.css'

export default function SheetSideExample() {
  return (
    <Sheet.Root>
      <Sheet.Trigger className={styles.button}>Open filters</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Sheet.Content className={styles.sheet}>
          <Sheet.Title className={styles.title}>Filters</Sheet.Title>
          <Sheet.Description className={styles.description}>Narrow the results.</Sheet.Description>
          <label className={styles.choice}>
            <input type="checkbox" /> In stock only
          </label>
          <Sheet.Close className={styles.button}>Apply</Sheet.Close>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
