'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderDisabledExample() {
  return (
    <Slider.Root className={styles.slider} defaultValue={[60]} disabled>
      <Slider.Track className={styles.track}>
        <Slider.Range className={styles.range} />
      </Slider.Track>
      <Slider.Thumb aria-label="Locked level" className={styles.thumb} />
    </Slider.Root>
  )
}
