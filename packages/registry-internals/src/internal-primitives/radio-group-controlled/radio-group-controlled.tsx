'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function RadioGroupControlledExample() {
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <div className={styles.stack}>
      <RadioGroup.Root aria-label="Shipping" className={styles.choices} onValueChange={setValue} value={value}>
        {['standard', 'express'].map((option) => (
          <div className={styles.choice} key={option}>
            <RadioGroup.Item className={styles.radio} id={`ship-${option}`} value={option}>
              <RadioGroup.Indicator className={styles.dot} />
            </RadioGroup.Item>
            <label htmlFor={`ship-${option}`}>{option}</label>
          </div>
        ))}
      </RadioGroup.Root>
      <button className={styles.button} onClick={() => setValue(null)} type="button">
        Clear the choice
      </button>
      <p className={styles.note}>Picked: {value ?? 'nothing'}. null selects nothing.</p>
    </div>
  )
}
