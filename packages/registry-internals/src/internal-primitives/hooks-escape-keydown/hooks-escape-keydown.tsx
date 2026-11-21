'use client'

import { useEscapeKeydown } from '@gentleduck/primitives/hooks/use-escape-keydown'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function HooksEscapeKeydownExample() {
  const [count, setCount] = React.useState(0)
  useEscapeKeydown(() => setCount((value) => value + 1))

  return (
    <div className={styles.stack}>
      <input className={styles.input} placeholder="Type in Japanese, then Escape" />
      <p className={styles.note}>
        Escape pressed {count} times. One that ends an input method's composition is not counted.
      </p>
    </div>
  )
}
