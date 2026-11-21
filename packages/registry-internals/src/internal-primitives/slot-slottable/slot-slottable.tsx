'use client'

import { Slot, Slottable } from '@gentleduck/primitives/slot'
import type * as React from 'react'
import styles from '../primitives.module.css'

function IconButton({ asChild, children, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Component = asChild ? Slot : 'button'
  return (
    <Component className={styles.button} {...props}>
      <span aria-hidden>+</span>
      <Slottable>{children}</Slottable>
    </Component>
  )
}

export default function SlotSlottableExample() {
  return (
    <div className={styles.row}>
      <IconButton type="button">New file</IconButton>
      <IconButton asChild>
        <a href="#new">New file as a link</a>
      </IconButton>
    </div>
  )
}
