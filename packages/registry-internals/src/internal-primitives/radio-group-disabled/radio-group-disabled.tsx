'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import styles from '../primitives.module.css'

const OPTIONS = [
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank transfer (unavailable)', disabled: true },
  { value: 'paypal', label: 'PayPal' },
]

export default function RadioGroupDisabledExample() {
  return (
    <div className={styles.row} style={{ alignItems: 'start', gap: '2rem' }}>
      <RadioGroup.Root aria-label="Payment" className={styles.choices} defaultValue="card">
        {OPTIONS.map((option) => (
          <div className={styles.choice} key={option.value}>
            <RadioGroup.Item
              className={styles.radio}
              disabled={option.disabled}
              id={`pay-${option.value}`}
              value={option.value}>
              <RadioGroup.Indicator className={styles.dot} />
            </RadioGroup.Item>
            <label htmlFor={`pay-${option.value}`}>{option.label}</label>
          </div>
        ))}
      </RadioGroup.Root>
      <RadioGroup.Root aria-label="Locked payment" className={styles.choices} defaultValue="paypal" readOnly>
        {OPTIONS.map((option) => (
          <div className={styles.choice} key={option.value}>
            <RadioGroup.Item className={styles.radio} id={`locked-${option.value}`} value={option.value}>
              <RadioGroup.Indicator className={styles.dot} />
            </RadioGroup.Item>
            <label htmlFor={`locked-${option.value}`}>{option.label} (read only)</label>
          </div>
        ))}
      </RadioGroup.Root>
    </div>
  )
}
