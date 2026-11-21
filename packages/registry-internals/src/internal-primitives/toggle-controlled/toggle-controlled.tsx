'use client'

import * as Toggle from '@gentleduck/primitives/toggle'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ToggleControlledExample() {
  const [muted, setMuted] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Toggle.Root className={styles.toggle} onPressedChange={setMuted} pressed={muted}>
        {(pressed) => (pressed ? 'Unmute' : 'Mute')}
      </Toggle.Root>
      <p className={styles.note}>Muted: {String(muted)}. A function child reads the pressed state.</p>
    </div>
  )
}
