'use client'

import * as Popover from '@gentleduck/primitives/popover'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PopoverControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [color, setColor] = React.useState('blue')

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger className={styles.button}>Color: {color}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={`${styles.content} ${styles.panel} ${styles.row}`} sideOffset={8}>
          {['blue', 'green', 'orange'].map((value) => (
            <button
              className={styles.button}
              key={value}
              onClick={() => {
                setColor(value)
                setOpen(false)
              }}
              type="button">
              {value}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
