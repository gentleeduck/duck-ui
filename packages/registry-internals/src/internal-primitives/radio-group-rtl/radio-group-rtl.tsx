'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import styles from '../primitives.module.css'

export default function RadioGroupRtlExample() {
  return (
    <RadioGroup.Root aria-label="اللغة" className={styles.choices} defaultValue="ar" dir="rtl" orientation="horizontal">
      {[
        { value: 'ar', label: 'العربية' },
        { value: 'en', label: 'الإنجليزية' },
      ].map((option) => (
        <div className={styles.choice} key={option.value}>
          <RadioGroup.Item className={styles.radio} id={`lang-${option.value}`} value={option.value}>
            <RadioGroup.Indicator className={styles.dot} />
          </RadioGroup.Item>
          <label htmlFor={`lang-${option.value}`}>{option.label}</label>
        </div>
      ))}
    </RadioGroup.Root>
  )
}
