'use client'

import * as Progress from '@gentleduck/primitives/progress'
import styles from '../primitives.module.css'

export default function ProgressIndeterminateExample() {
  return (
    <Progress.Root aria-label="Connecting" className={styles.progress} value={null}>
      <Progress.Indicator className={styles.progressIndicator} />
    </Progress.Root>
  )
}
