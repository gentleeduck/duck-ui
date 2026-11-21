'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

const COUNTRIES = [
  { value: 'de', label: 'Germany' },
  { value: 'eg', label: 'Egypt' },
  { value: 'jp', label: 'Japan' },
  { value: 'kp', label: 'North Korea', disabled: true },
]

export default function SelectItemsExample() {
  return (
    <Select.Root defaultValue="eg" items={COUNTRIES}>
      <Select.Trigger aria-label="Country" className={styles.trigger}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport>
            {COUNTRIES.map((country) => (
              <Select.Item
                className={styles.item}
                disabled={country.disabled}
                key={country.value}
                value={country.value}>
                <Select.ItemText>{country.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
