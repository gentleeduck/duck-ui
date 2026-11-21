'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderBasicExample() {
  return (
    <div className={styles.stack}>
      <Slider.Root className={styles.slider} defaultValue={[40]} max={100} step={5}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Volume" className={styles.thumb} />
      </Slider.Root>
      <p className={styles.note}>step 5; Shift with an arrow, or PageUp and PageDown, take larger steps.</p>
    </div>
  )
}
