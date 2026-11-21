'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPAutoFocusExample() {
  const [shown, setShown] = React.useState(false)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setShown((value) => !value)} type="button">
        {shown ? 'Hide the code' : 'Ask for the code'}
      </button>
      {shown ? (
        <InputOTP.Root aria-label="Code" autoFocus className={styles.otp} defaultValue="5">
          {[0, 1, 2, 3].map((slot) => (
            <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
          ))}
        </InputOTP.Root>
      ) : null}
      <p className={styles.note}>autoFocus puts the caret in the slot typing goes to, here the second.</p>
    </div>
  )
}
