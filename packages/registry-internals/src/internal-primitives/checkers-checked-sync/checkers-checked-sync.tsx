'use client'

import { useCheckedSync } from '@gentleduck/primitives/checkers'
import * as React from 'react'
import styles from '../primitives.module.css'

function Checkbox({
  checked,
  id,
  onCheckedChange,
}: {
  checked: boolean
  id: string
  onCheckedChange: (checked: boolean) => void
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const sync = useCheckedSync(ref, { checked, onChange: (event) => onCheckedChange(event.target.checked) })
  return (
    <input checked={checked} className={styles.nativeCheck} id={id} name="terms" ref={ref} type="checkbox" {...sync} />
  )
}

export default function CheckersCheckedSyncExample() {
  const [checked, setChecked] = React.useState(false)
  const [heard, setHeard] = React.useState(0)

  return (
    <form
      className={styles.stack}
      onChange={() => setHeard((count) => count + 1)}
      onSubmit={(event) => event.preventDefault()}>
      <div className={styles.choice}>
        <Checkbox checked={checked} id="terms" onCheckedChange={setChecked} />
        <label htmlFor="terms">I accept the terms</label>
      </div>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setChecked((value) => !value)} type="button">
          Toggle from outside
        </button>
        <button className={styles.button} type="reset">
          Reset the form
        </button>
      </div>
      <p className={styles.note}>
        The form heard {heard} changes. A value set from outside reaches it too, and a reset puts the box back on its
        value.
      </p>
    </form>
  )
}
