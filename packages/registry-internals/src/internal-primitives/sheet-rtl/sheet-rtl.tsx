'use client'

import * as Sheet from '@gentleduck/primitives/sheet'
import styles from '../primitives.module.css'

export default function SheetRtlExample() {
  return (
    <Sheet.Root dir="rtl">
      <Sheet.Trigger className={styles.button}>القائمة</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Sheet.Content aria-describedby={undefined} className={styles.sheet}>
          <Sheet.Title className={styles.title}>القائمة</Sheet.Title>
          <Sheet.Close className={styles.button}>إغلاق</Sheet.Close>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
