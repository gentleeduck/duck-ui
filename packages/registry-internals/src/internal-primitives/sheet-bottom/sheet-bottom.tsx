'use client'

import * as Sheet from '@gentleduck/primitives/sheet'
import styles from '../primitives.module.css'

export default function SheetBottomExample() {
  return (
    <Sheet.Root>
      <Sheet.Trigger className={styles.button}>Share</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Sheet.Content
          aria-describedby={undefined}
          className={styles.sheet}
          style={{
            borderInlineStart: 0,
            borderTop: '1px solid var(--border)',
            insetBlock: 'auto 0',
            insetInline: 0,
            width: 'auto',
          }}>
          <Sheet.Title className={styles.title}>Share to</Sheet.Title>
          <div className={styles.row}>
            {['Mail', 'Messages', 'Copy link'].map((target) => (
              <Sheet.Close className={styles.button} key={target}>
                {target}
              </Sheet.Close>
            ))}
          </div>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
