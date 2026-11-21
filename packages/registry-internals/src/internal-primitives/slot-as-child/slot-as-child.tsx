'use client'

import { Slot } from '@gentleduck/primitives/slot'
import type * as React from 'react'
import styles from '../primitives.module.css'

function Button({ asChild, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Component = asChild ? Slot : 'button'
  return <Component className={styles.button} {...props} />
}

export default function SlotAsChildExample() {
  return (
    <div className={styles.row}>
      <Button type="button">A button</Button>
      <Button asChild>
        <a href="#docs">A link styled as one</a>
      </Button>
    </div>
  )
}
