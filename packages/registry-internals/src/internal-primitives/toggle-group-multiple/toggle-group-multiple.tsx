'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ToggleGroupMultipleExample() {
  const [marks, setMarks] = React.useState<string[]>(['bold'])

  return (
    <div className={styles.stack}>
      <ToggleGroup.Root
        aria-label="Formatting"
        className={styles.group}
        onValueChange={setMarks}
        type="multiple"
        value={marks}>
        {['bold', 'italic', 'underline'].map((value) => (
          <ToggleGroup.Item className={styles.toggle} key={value} value={value}>
            {value}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className={styles.note}>On: {marks.join(', ') || 'none'}</p>
    </div>
  )
}
