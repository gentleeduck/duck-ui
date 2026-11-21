'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import styles from '../primitives.module.css'

export default function InputOTPPasswordExample() {
  return (
    <InputOTP.Root aria-label="PIN" className={styles.otp} pattern={InputOTP.REGEXP_ONLY_DIGITS} type="password">
      {[0, 1, 2, 3].map((slot) => (
        <InputOTP.Slot aria-label={`PIN digit ${slot + 1}`} className={styles.slot} key={slot} />
      ))}
    </InputOTP.Root>
  )
}
