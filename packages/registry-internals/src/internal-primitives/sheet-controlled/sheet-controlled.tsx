'use client'

import * as Sheet from '@gentleduck/primitives/sheet'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SheetControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState(2)

  return (
    <Sheet.Root onOpenChange={setOpen} open={open}>
      <button className={styles.button} onClick={() => setItems((count) => count + 1)} type="button">
        Add to cart ({items})
      </button>
      <Sheet.Trigger className={styles.button}>View cart</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Sheet.Content aria-describedby={undefined} className={styles.sheet}>
          <Sheet.Title className={styles.title}>Cart, {items} items</Sheet.Title>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => {
              setItems(0)
              setOpen(false)
            }}
            type="button">
            Check out
          </button>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
