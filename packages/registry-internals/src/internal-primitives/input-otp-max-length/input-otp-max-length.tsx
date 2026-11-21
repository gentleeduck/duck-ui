'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPMaxLengthExample() {
  const [length, setLength] = React.useState(4)
  const [done, setDone] = React.useState('')

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {[4, 6].map((value) => (
          <button className={styles.button} key={value} onClick={() => setLength(value)} type="button">
            {value === length ? `[${value} digits]` : `${value} digits`}
          </button>
        ))}
      </div>
      <InputOTP.Root aria-label="Code" className={styles.otp} maxLength={length} onComplete={setDone}>
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} hidden={slot >= length} key={slot} />
        ))}
      </InputOTP.Root>
      <p className={styles.note}>
        {done ? `Complete at ${done.length}: ${done}` : 'maxLength counts only the first slots as the code.'}
      </p>
    </div>
  )
}
