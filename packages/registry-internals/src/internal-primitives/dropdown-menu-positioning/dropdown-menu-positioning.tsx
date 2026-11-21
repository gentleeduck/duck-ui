'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

const SIDES = ['top', 'right', 'bottom', 'left'] as const
const ALIGNS = ['start', 'center', 'end'] as const

export default function DropdownMenuPositioningExample() {
  const [side, setSide] = React.useState<(typeof SIDES)[number]>('bottom')
  const [align, setAlign] = React.useState<(typeof ALIGNS)[number]>('center')

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {SIDES.map((value) => (
          <button className={styles.button} key={value} onClick={() => setSide(value)} type="button">
            {value === side ? `[${value}]` : value}
          </button>
        ))}
      </div>
      <div className={styles.row}>
        {ALIGNS.map((value) => (
          <button className={styles.button} key={value} onClick={() => setAlign(value)} type="button">
            {value === align ? `[${value}]` : value}
          </button>
        ))}
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.button}>
          Open {side} {align}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={align}
            className={styles.content}
            collisionPadding={8}
            side={side}
            sideOffset={8}>
            <DropdownMenu.Item className={styles.item}>One</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>Two</DropdownMenu.Item>
            <DropdownMenu.Arrow className={styles.arrow} />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
