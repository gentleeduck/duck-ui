'use client'

import * as Popper from '@gentleduck/primitives/popper'
import * as React from 'react'
import styles from '../primitives.module.css'

const SIDES = ['top', 'right', 'bottom', 'left'] as const

export default function PopperBasicExample() {
  const [side, setSide] = React.useState<(typeof SIDES)[number]>('top')

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {SIDES.map((value) => (
          <button className={styles.button} key={value} onClick={() => setSide(value)} type="button">
            {value === side ? `[${value}]` : value}
          </button>
        ))}
      </div>
      <div style={{ padding: '3rem 6rem' }}>
        <Popper.Root>
          <Popper.Anchor className={styles.box}>Anchor</Popper.Anchor>
          <Popper.Content
            className={`${styles.content} ${styles.panel}`}
            side={side}
            sideOffset={6}
            style={{ minWidth: 0 }}>
            {side}
            <Popper.Arrow className={styles.arrow} />
          </Popper.Content>
        </Popper.Root>
      </div>
    </div>
  )
}
