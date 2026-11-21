'use client'

import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import styles from '../primitives.module.css'

export default function ToggleGroupRtlExample() {
  return (
    <ToggleGroup.Root aria-label="المحاذاة" className={styles.group} defaultValue="right" dir="rtl" type="single">
      {[
        { value: 'right', label: 'يمين' },
        { value: 'center', label: 'وسط' },
        { value: 'left', label: 'يسار' },
      ].map((item) => (
        <ToggleGroup.Item className={styles.toggle} key={item.value} value={item.value}>
          {item.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
