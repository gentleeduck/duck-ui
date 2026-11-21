'use client'

import { DirectionProvider } from '@gentleduck/primitives/direction'
import * as Slider from '@gentleduck/primitives/slider'
import * as ToggleGroup from '@gentleduck/primitives/toggle-group'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DirectionProviderExample() {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('rtl')

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setDir(dir === 'rtl' ? 'ltr' : 'rtl')} type="button">
        Direction: {dir}
      </button>
      <DirectionProvider dir={dir}>
        <div className={styles.stack}>
          <Slider.Root className={styles.slider} defaultValue={[30]}>
            <Slider.Track className={styles.track}>
              <Slider.Range className={styles.range} />
            </Slider.Track>
            <Slider.Thumb aria-label="Volume" className={styles.thumb} />
          </Slider.Root>
          <ToggleGroup.Root aria-label="Alignment" className={styles.group} defaultValue="start" type="single">
            {['start', 'center', 'end'].map((value) => (
              <ToggleGroup.Item className={styles.toggle} key={value} value={value}>
                {value}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      </DirectionProvider>
      <p className={styles.note}>
        Every primitive inside reads the provider: the slider fills from the right and the arrow keys flip.
      </p>
    </div>
  )
}
