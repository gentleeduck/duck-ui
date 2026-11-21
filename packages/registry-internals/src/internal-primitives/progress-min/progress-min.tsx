'use client'

import * as Progress from '@gentleduck/primitives/progress'
import styles from '../primitives.module.css'

export default function ProgressMinExample() {
  const year = 2026
  return (
    <Progress.Root className={styles.stack} max={2030} min={2020} value={year}>
      <Progress.Label className={styles.label}>Plan from 2020 to 2030</Progress.Label>
      <div className={styles.progress}>
        <Progress.Indicator
          className={styles.progressIndicator}
          style={{ transform: `translateX(-${100 - (year - 2020) * 10}%)` }}
        />
      </div>
      <Progress.Value className={styles.note} />
    </Progress.Root>
  )
}
