'use client'

import { useId } from '@gentleduck/primitives/hooks/use-id'
import styles from '../primitives.module.css'

function Field({ label, id }: { label: string; id?: string }) {
  const inputId = useId(id)
  return (
    <div className={styles.stack}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input className={styles.input} id={inputId} />
      <span className={styles.note}>id: {inputId}</span>
    </div>
  )
}

export default function HooksIdExample() {
  return (
    <div className={styles.row}>
      <Field label="Generated" />
      <Field id="billing-email" label="Given" />
    </div>
  )
}
