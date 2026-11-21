'use client'

import * as RovingFocus from '@gentleduck/primitives/roving-focus'
import styles from '../primitives.module.css'

export default function RovingFocusToolbarExample() {
  return (
    <div className={styles.stack}>
      <RovingFocus.Root aria-label="Formatting" className={styles.group} loop orientation="horizontal" role="toolbar">
        {['Bold', 'Italic', 'Underline', 'Strike'].map((name) => (
          <RovingFocus.Item asChild key={name}>
            <button className={styles.button} type="button">
              {name}
            </button>
          </RovingFocus.Item>
        ))}
      </RovingFocus.Root>
      <p className={styles.note}>One Tab stop for the whole toolbar; the arrow keys, Home and End move inside it.</p>
    </div>
  )
}
