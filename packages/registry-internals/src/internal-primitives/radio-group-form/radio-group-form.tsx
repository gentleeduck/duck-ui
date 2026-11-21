'use client'

import * as RadioGroup from '@gentleduck/primitives/radio-group'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function RadioGroupFormExample() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('plan')))
      }}>
      <RadioGroup.Root aria-label="Plan" className={styles.choices} name="plan" required>
        {['free', 'pro', 'team'].map((value) => (
          <div className={styles.choice} key={value}>
            <RadioGroup.Item className={styles.radio} id={`plan-${value}`} value={value}>
              <RadioGroup.Indicator className={styles.dot} />
            </RadioGroup.Item>
            <label htmlFor={`plan-${value}`}>{value}</label>
          </div>
        ))}
      </RadioGroup.Root>
      <div className={styles.row}>
        <button className={`${styles.button} ${styles.primary}`} type="submit">
          Continue
        </button>
        <button className={styles.button} type="reset">
          Reset
        </button>
      </div>
      <p className={styles.note}>
        {sent ? `Submitted plan=${sent}` : 'required refuses to submit with nothing picked.'}
      </p>
    </form>
  )
}
