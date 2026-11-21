'use client'

import { FocusScope } from '@gentleduck/primitives/focus-scope'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function FocusScopeTrappedExample() {
  const [trapped, setTrapped] = React.useState(false)
  const [loop, setLoop] = React.useState(true)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setTrapped((value) => !value)} type="button">
          {trapped ? 'Release focus' : 'Trap focus'}
        </button>
        <button className={styles.button} onClick={() => setLoop((value) => !value)} type="button">
          loop {loop ? 'on' : 'off'}
        </button>
      </div>
      <FocusScope className={`${styles.box} ${styles.stack}`} loop={loop} trapped={trapped}>
        <input className={styles.input} placeholder="First" />
        <input className={styles.input} placeholder="Second" />
        <button className={styles.button} onClick={() => setTrapped(false)} type="button">
          Done
        </button>
      </FocusScope>
      <p className={styles.note}>Trapped, Tab cannot leave the box. loop takes it from Done back to First.</p>
    </div>
  )
}
