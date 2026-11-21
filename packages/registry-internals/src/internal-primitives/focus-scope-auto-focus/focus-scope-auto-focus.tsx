'use client'

import { FocusScope } from '@gentleduck/primitives/focus-scope'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function FocusScopeAutoFocusExample() {
  const [shown, setShown] = React.useState(false)
  const [skipMount, setSkipMount] = React.useState(false)
  const toggle = React.useRef<HTMLButtonElement>(null)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setShown((value) => !value)} ref={toggle} type="button">
          {shown ? 'Hide the form' : 'Show the form'}
        </button>
        <label className={styles.choice}>
          <input checked={skipMount} onChange={(event) => setSkipMount(event.target.checked)} type="checkbox" />
          Keep focus where it was
        </label>
      </div>
      {shown ? (
        <FocusScope
          className={`${styles.box} ${styles.stack}`}
          onMountAutoFocus={(event) => skipMount && event.preventDefault()}
          onUnmountAutoFocus={(event) => {
            event.preventDefault()
            toggle.current?.focus()
          }}
          trapped>
          <input className={styles.input} placeholder="Focused on mount" />
          <input className={styles.input} placeholder="Second field" />
        </FocusScope>
      ) : null}
    </div>
  )
}
