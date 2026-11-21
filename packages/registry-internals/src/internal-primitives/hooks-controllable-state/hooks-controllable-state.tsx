'use client'

import { useControllableState } from '@gentleduck/primitives/hooks/use-controllable-state'
import * as React from 'react'
import styles from '../primitives.module.css'

function Stepper({
  value,
  defaultValue = 0,
  onValueChange,
}: {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}) {
  const [count, setCount] = useControllableState({
    caller: 'Stepper',
    defaultProp: defaultValue,
    onChange: onValueChange,
    prop: value,
  })
  return (
    <div className={styles.row}>
      <button className={styles.button} onClick={() => setCount(count - 1)} type="button">
        -
      </button>
      <span className={styles.note}>{count}</span>
      <button className={styles.button} onClick={() => setCount(count + 1)} type="button">
        +
      </button>
    </div>
  )
}

export default function HooksControllableStateExample() {
  const [value, setValue] = React.useState(10)

  return (
    <div className={styles.stack}>
      <span className={styles.label}>Uncontrolled, starting at 3</span>
      <Stepper defaultValue={3} />
      <span className={styles.label}>Controlled by the page ({value})</span>
      <Stepper onValueChange={setValue} value={value} />
    </div>
  )
}
