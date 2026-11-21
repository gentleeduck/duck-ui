'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import styles from '../primitives.module.css'

function Code({ label, pattern }: { label: string; pattern: RegExp }) {
  return (
    <div className={styles.stack}>
      <span className={styles.label}>{label}</span>
      <InputOTP.Root aria-label={label} className={styles.otp} pattern={pattern}>
        {[0, 1, 2, 3].map((slot) => (
          <InputOTP.Slot aria-label={`${label} ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
      </InputOTP.Root>
    </div>
  )
}

export default function InputOTPPatternExample() {
  return (
    <div className={styles.row}>
      <Code label="Digits only" pattern={InputOTP.REGEXP_ONLY_DIGITS} />
      <Code label="Letters only" pattern={InputOTP.REGEXP_ONLY_CHARS} />
      <Code label="Hex" pattern={/^[0-9a-fA-F]$/} />
    </div>
  )
}
