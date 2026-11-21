'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPControlledExample() {
  const [value, setValue] = React.useState('')

  return (
    <div className={styles.stack}>
      <InputOTP.Root aria-label="Code" className={styles.otp} onValueChange={setValue} value={value}>
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
      </InputOTP.Root>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setValue('424242')} type="button">
          Fill from SMS
        </button>
        <button className={styles.button} onClick={() => setValue('')} type="button">
          Clear
        </button>
      </div>
      <p className={styles.note}>Value: {value || 'empty'}</p>
    </div>
  )
}
