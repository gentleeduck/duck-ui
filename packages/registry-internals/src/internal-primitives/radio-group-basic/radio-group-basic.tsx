'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import styles from '../primitives.module.css'

export default function RadioGroupBasicExample() {
  return (
    <RadioGroup.Root aria-label="Density" className={styles.choices} defaultValue="comfortable">
      {['default', 'comfortable', 'compact'].map((value) => (
        <div className={styles.choice} key={value}>
          <RadioGroup.Item className={styles.radio} id={`density-${value}`} value={value}>
            <RadioGroup.Indicator className={styles.dot} />
          </RadioGroup.Item>
          <label htmlFor={`density-${value}`}>{value}</label>
        </div>
      ))}
    </RadioGroup.Root>
  )
}
