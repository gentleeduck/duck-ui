'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupVerticalExample() {
  return (
    <ToggleGroup.Root
      aria-label="Tool"
      className={styles.group}
      defaultValue="pen"
      loop={false}
      orientation="vertical"
      type="single">
      {['select', 'pen', 'eraser'].map((value) => (
        <ToggleGroup.Item className={styles.toggle} disabled={value === 'eraser'} key={value} value={value}>
          {value}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
