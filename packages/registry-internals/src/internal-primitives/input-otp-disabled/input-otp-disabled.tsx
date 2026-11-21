'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import styles from '../primitives.module.css'

export default function InputOTPDisabledExample() {
  return (
    <div className={styles.stack}>
      <span className={styles.label}>Read only: focus moves, typing changes nothing</span>
      <InputOTP.Root aria-label="Read-only code" className={styles.otp} defaultValue="8261" readOnly>
        {[0, 1, 2, 3].map((slot) => (
          <InputOTP.Slot aria-label={`Read-only digit ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
      </InputOTP.Root>
      <span className={styles.label}>Disabled: no focus at all</span>
      <InputOTP.Root aria-label="Disabled code" className={styles.otp} defaultValue="8261" disabled>
        {[0, 1, 2, 3].map((slot) => (
          <InputOTP.Slot aria-label={`Disabled digit ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
      </InputOTP.Root>
    </div>
  )
}
