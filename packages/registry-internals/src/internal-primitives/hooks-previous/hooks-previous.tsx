'use client'

import { usePrevious } from '@gentleduck/primitives/hooks/use-previous'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function HooksPreviousExample() {
  const [price, setPrice] = React.useState(42)
  const [, rerender] = React.useState(0)
  const previous = usePrevious(price)
  const trend = price > previous ? 'up' : price < previous ? 'down' : 'flat'

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setPrice((value) => value + 1)} type="button">
          Raise
        </button>
        <button className={styles.button} onClick={() => setPrice((value) => value - 1)} type="button">
          Lower
        </button>
        <button className={styles.button} onClick={() => rerender((count) => count + 1)} type="button">
          Render again
        </button>
      </div>
      <p className={styles.note}>
        {price}, was {previous}, {trend}. A render that changes nothing keeps the previous value.
      </p>
    </div>
  )
}
