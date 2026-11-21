'use client'

import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SelectControlledOpenExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={styles.row}>
      <Select.Root onOpenChange={setOpen} open={open}>
        <Select.Trigger aria-label="Priority" className={styles.trigger}>
          <Select.Value placeholder="Priority" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={styles.content} position="popper" sideOffset={6}>
            <Select.Viewport>
              {['low', 'medium', 'high'].map((level) => (
                <Select.Item className={styles.item} key={level} value={level}>
                  <Select.ItemText>{level}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <button className={styles.button} onClick={() => setOpen(true)} type="button">
        Open from here
      </button>
    </div>
  )
}
