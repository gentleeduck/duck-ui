'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderInvertedExample() {
  return (
    <div className={styles.stack}>
      <Slider.Root className={styles.slider} defaultValue={[70]} inverted largeStep={25}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Remaining" className={styles.thumb} />
      </Slider.Root>
      <p className={styles.note}>
        inverted fills from the far end, and largeStep sets the PageUp and PageDown step to 25.
      </p>
    </div>
  )
}
