'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import styles from '../primitives.module.css'

export default function InputOTPRtlExample() {
  return (
    <InputOTP.Root aria-label="رمز التحقق" className={styles.otp} dir="rtl">
      {[0, 1, 2, 3].map((slot) => (
        <InputOTP.Slot aria-label={`رقم ${slot + 1}`} className={styles.slot} key={slot} />
      ))}
    </InputOTP.Root>
  )
}
