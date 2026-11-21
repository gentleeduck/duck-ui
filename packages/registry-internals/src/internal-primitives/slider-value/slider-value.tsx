'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderValueExample() {
  return (
    <Slider.Root className={styles.stack} defaultValue={[18, 24]} max={30} min={10} step={0.5}>
      <Slider.Value className={styles.note}>{(values) => `${values[0]} C to ${values[1]} C`}</Slider.Value>
      <div className={styles.slider}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Lowest" className={styles.thumb} />
        <Slider.Thumb aria-label="Highest" className={styles.thumb} />
      </div>
    </Slider.Root>
  )
}
