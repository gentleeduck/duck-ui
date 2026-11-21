'use client'

import * as RovingFocus from '@gentleduck/primitives/roving-focus'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function RovingFocusControlledExample() {
  const [stop, setStop] = React.useState<string | null>('cut')

  return (
    <div className={styles.stack}>
      <RovingFocus.Root
        className={styles.group}
        currentTabStopId={stop}
        onCurrentTabStopIdChange={setStop}
        orientation="vertical">
        {['cut', 'copy', 'paste'].map((id) => (
          <RovingFocus.Item asChild key={id} tabStopId={id}>
            <button className={styles.button} type="button">
              {id}
            </button>
          </RovingFocus.Item>
        ))}
      </RovingFocus.Root>
      <p className={styles.note}>The tab stop is {stop ?? 'none'}. Tab back in and focus lands on it.</p>
    </div>
  )
}
