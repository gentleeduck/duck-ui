'use client'

import * as Slider from '@gentleduck/primitives/slider'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SliderFormExample() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(new FormData(event.currentTarget).getAll('budget').join(' to '))
      }}>
      <Slider.Root className={styles.slider} defaultValue={[20, 60]} name="budget">
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="From" className={styles.thumb} />
        <Slider.Thumb aria-label="To" className={styles.thumb} />
      </Slider.Root>
      <div className={styles.row}>
        <button className={`${styles.button} ${styles.primary}`} type="submit">
          Search
        </button>
        <button className={styles.button} type="reset">
          Reset
        </button>
      </div>
      <p className={styles.note}>
        {sent ? `Submitted budget=${sent}` : 'Each thumb submits a value under the name budget.'}
      </p>
    </form>
  )
}
