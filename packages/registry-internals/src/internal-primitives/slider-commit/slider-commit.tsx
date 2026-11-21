'use client'

import * as Slider from '@gentleduck/primitives/slider'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SliderCommitExample() {
  const [live, setLive] = React.useState([30])
  const [saved, setSaved] = React.useState([30])

  return (
    <div className={styles.stack}>
      <Slider.Root className={styles.slider} onValueChange={setLive} onValueCommit={setSaved} value={live}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Brightness" className={styles.thumb} />
      </Slider.Root>
      <p className={styles.note}>
        While dragging: {live[0]}. Saved once the drag ends: {saved[0]}.
      </p>
    </div>
  )
}
