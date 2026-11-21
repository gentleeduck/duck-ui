'use client'

import * as InputOTP from '@gentleduck/primitives/input-otp'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function InputOTPFormExample() {
  const [submitted, setSubmitted] = React.useState('')

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(String(new FormData(event.currentTarget).get('code')))
      }}>
      <InputOTP.Root aria-label="Code" autoSubmit className={styles.otp} defaultValue="12" name="code">
        {[0, 1, 2, 3].map((slot) => (
          <InputOTP.Slot aria-label={`Digit ${slot + 1}`} className={styles.slot} key={slot} />
        ))}
        <InputOTP.HiddenInput />
      </InputOTP.Root>
      <div className={styles.row}>
        <button className={styles.button} type="reset">
          Reset to 12
        </button>
      </div>
      <p className={styles.note}>
        {submitted
          ? `Submitted code=${submitted}`
          : 'autoSubmit sends the form once the last slot fills, under the name "code".'}
      </p>
    </form>
  )
}
