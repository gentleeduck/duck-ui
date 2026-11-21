'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from '../primitives.module.css'

export default function PopoverRtlExample() {
  return (
    <Popover.Root dir="rtl">
      <Popover.Trigger className={styles.button}>تفاصيل</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={`${styles.content} ${styles.panel}`} side="right" sideOffset={8}>
          side right opens to the left here, the way right to left text reads.
          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
