'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

export default function SelectRtlExample() {
  return (
    <Select.Root defaultValue="cairo" dir="rtl">
      <Select.Trigger aria-label="المدينة" className={styles.trigger}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport>
            {[
              { value: 'cairo', label: 'القاهرة' },
              { value: 'riyadh', label: 'الرياض' },
              { value: 'amman', label: 'عمّان' },
            ].map((city) => (
              <Select.Item className={styles.item} key={city.value} value={city.value}>
                <Select.ItemText>{city.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
