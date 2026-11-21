'use client'

import * as Popover from '@gentleduck/primitives/popover'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PopoverFocusExample() {
  const comment = React.useRef<HTMLTextAreaElement>(null)

  return (
    <Popover.Root>
      <Popover.Trigger className={styles.button}>Comment</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={`${styles.content} ${styles.panel} ${styles.stack}`}
          initialFocus={comment}
          sideOffset={8}>
          <button className={styles.button} type="button">
            Attach
          </button>
          <textarea className={styles.input} placeholder="Focus starts here" ref={comment} rows={3} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
