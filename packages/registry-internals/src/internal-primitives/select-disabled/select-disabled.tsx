'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

export default function SelectDisabledExample() {
  return (
    <Select.Root defaultValue="monthly" disabled>
      <Select.Trigger aria-label="Billing" className={styles.trigger}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport>
            <Select.Item className={styles.item} value="monthly">
              <Select.ItemText>Monthly</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
