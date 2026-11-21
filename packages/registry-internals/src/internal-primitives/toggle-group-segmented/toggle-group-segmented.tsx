'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupSegmentedExample() {
  return (
    <div className={styles.stack}>
      <ToggleGroup.Root
        aria-label="View"
        className={styles.group}
        defaultValue="list"
        deselectable={false}
        type="single">
        {['list', 'grid', 'board'].map((value) => (
          <ToggleGroup.Item className={styles.toggle} key={value} value={value}>
            {value}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className={styles.note}>deselectable off keeps one item on, as a segmented control does.</p>
    </div>
  )
}
