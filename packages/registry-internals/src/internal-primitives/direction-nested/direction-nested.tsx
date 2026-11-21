'use client'

import { DirectionProvider } from '@gentleduck/primitives/direction'
import * as Slider from '@gentleduck/primitives/slider'
import styles from '../primitives.module.css'

function Volume({ label }: { label: string }) {
  return (
    <div className={styles.stack}>
      <span className={styles.label}>{label}</span>
      <Slider.Root className={styles.slider} defaultValue={[25]}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label={label} className={styles.thumb} />
      </Slider.Root>
    </div>
  )
}

export default function DirectionNestedExample() {
  return (
    <DirectionProvider dir="rtl">
      <div className={styles.stack}>
        <Volume label="مستوى الصوت" />
        <DirectionProvider dir="ltr">
          <Volume label="Left to right inside" />
        </DirectionProvider>
      </div>
    </DirectionProvider>
  )
}
