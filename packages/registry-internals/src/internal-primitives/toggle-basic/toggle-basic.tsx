'use client'

import * as Toggle from '@gentleduck/primitives/toggle'
import styles from '../primitives.module.css'

export default function ToggleBasicExample() {
  return (
    <div className={styles.row}>
      <Toggle.Root aria-label="Bold" className={styles.toggle}>
        B
      </Toggle.Root>
      <Toggle.Root aria-label="Italic" className={styles.toggle} defaultPressed>
        I
      </Toggle.Root>
      <Toggle.Root aria-label="Underline" className={styles.toggle} disabled>
        U
      </Toggle.Root>
    </div>
  )
}
