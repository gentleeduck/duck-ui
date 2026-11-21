'use client'

import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

export default function SliderVerticalExample() {
  return (
    <div className={styles.row} style={{ gap: '2rem' }}>
      {['Bass', 'Mid', 'Treble'].map((band) => (
        <Slider.Root className={styles.slider} defaultValue={[50]} key={band} orientation="vertical">
          <Slider.Track className={styles.track}>
            <Slider.Range className={styles.range} />
          </Slider.Track>
          <Slider.Thumb aria-label={band} className={styles.thumb} />
        </Slider.Root>
      ))}
    </div>
  )
}
