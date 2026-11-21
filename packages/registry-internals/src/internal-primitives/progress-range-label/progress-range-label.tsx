'use client'

import * as Progress from '@gentleduck/primitives/progress'
import styles from '../primitives.module.css'

export default function ProgressRangeLabelExample() {
  const used = 7.5
  const total = 15

  return (
    <Progress.Root
      className={styles.stack}
      getValueLabel={(value, max) => `${value} of ${max} GB`}
      max={total}
      value={used}>
      <Progress.Label className={styles.label}>Storage</Progress.Label>
      <div className={styles.progress}>
        <Progress.Indicator
          className={styles.progressIndicator}
          style={{ transform: `translateX(-${100 - (used / total) * 100}%)` }}
        />
      </div>
      <Progress.Value className={styles.note}>{(label) => `${label} used`}</Progress.Value>
    </Progress.Root>
  )
}
