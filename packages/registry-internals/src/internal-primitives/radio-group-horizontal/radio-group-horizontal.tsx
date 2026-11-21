'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import styles from '../primitives.module.css'

export default function RadioGroupHorizontalExample() {
  return (
    <RadioGroup.Root
      aria-label="Size"
      className={styles.choices}
      defaultValue="m"
      loop={false}
      orientation="horizontal">
      {['s', 'm', 'l', 'xl'].map((value) => (
        <div className={styles.choice} key={value}>
          <RadioGroup.Item className={styles.radio} id={`size-${value}`} value={value}>
            <RadioGroup.Indicator className={styles.dot} />
          </RadioGroup.Item>
          <label htmlFor={`size-${value}`}>{value.toUpperCase()}</label>
        </div>
      ))}
    </RadioGroup.Root>
  )
}
