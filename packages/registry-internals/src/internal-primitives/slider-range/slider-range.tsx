'use client'

import * as Slider from '@gentleduck/primitives/slider'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SliderRangeExample() {
  const [range, setRange] = React.useState([200, 800])

  return (
    <div className={styles.stack}>
      <Slider.Root
        className={styles.slider}
        max={1000}
        minStepsBetweenThumbs={10}
        onValueChange={setRange}
        preserveThumbOrder
        step={10}
        value={range}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Minimum price" className={styles.thumb} />
        <Slider.Thumb aria-label="Maximum price" className={styles.thumb} />
      </Slider.Root>
      <p className={styles.note}>
        ${range[0]} to ${range[1]}. The thumbs stop 10 steps apart instead of crossing.
      </p>
    </div>
  )
}
