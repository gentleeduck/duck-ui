'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupSingleExample() {
  return (
    <ToggleGroup.Root aria-label="Text alignment" className={styles.group} defaultValue="left" type="single">
      {['left', 'center', 'right'].map((value) => (
        <ToggleGroup.Item aria-label={`Align ${value}`} className={styles.toggle} key={value} value={value}>
          {value}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
