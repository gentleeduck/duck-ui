'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupNoRovingExample() {
  return (
    <div className={styles.stack}>
      <ToggleGroup.Root aria-label="Filters" className={styles.group} rovingFocus={false} type="multiple">
        {['open', 'closed', 'draft'].map((value) => (
          <ToggleGroup.Item className={styles.toggle} key={value} value={value}>
            {value}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className={styles.note}>rovingFocus off makes every item its own Tab stop.</p>
    </div>
  )
}
