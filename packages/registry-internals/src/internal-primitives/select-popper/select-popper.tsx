'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

export default function SelectPopperExample() {
  return (
    <Select.Root defaultValue="utc">
      <Select.Trigger aria-label="Time zone" className={styles.trigger}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={styles.content}
          position="popper"
          sideOffset={6}
          style={{ minWidth: 'var(--gentleduck-select-trigger-width)' }}>
          <Select.Viewport>
            {['utc', 'cet', 'est', 'pst'].map((zone) => (
              <Select.Item className={styles.item} key={zone} value={zone}>
                <Select.ItemText>{zone.toUpperCase()}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.Arrow className={styles.arrow} />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
