'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPBasicExample() {
  const [done, setDone] = React.useState('')

  return (
    <div className={styles.stack}>
      <InputOTP.Root aria-label="Verification code" className={styles.otp} onComplete={setDone}>
        <InputOTP.Group className={styles.otp}>
          {[0, 1, 2].map((slot) => (
            <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
          ))}
        </InputOTP.Group>
        <InputOTP.Separator>-</InputOTP.Separator>
        <InputOTP.Group className={styles.otp}>
          {[3, 4, 5].map((slot) => (
            <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
          ))}
        </InputOTP.Group>
      </InputOTP.Root>
      <p className={styles.note}>
        {done ? `Complete: ${done}` : 'Type or paste a code. Backspace, Delete and the arrows move as in one field.'}
      </p>
    </div>
  )
}
