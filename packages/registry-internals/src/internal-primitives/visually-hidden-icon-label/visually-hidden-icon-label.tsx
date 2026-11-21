'use client'

import { VisuallyHidden } from '@gentleduck/primitives/visibility-hidden'
import styles from '../primitives.module.css'

export default function VisuallyHiddenIconLabelExample() {
  return (
    <button className={styles.button} type="button">
      <span aria-hidden>x</span>
      <VisuallyHidden>Close notifications</VisuallyHidden>
    </button>
  )
}
