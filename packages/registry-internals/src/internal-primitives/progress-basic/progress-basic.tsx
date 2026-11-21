'use client'

import * as Progress from '@gentleduck/primitives/progress'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ProgressBasicExample() {
  const [value, setValue] = React.useState(20)

  React.useEffect(() => {
    const timer = setInterval(() => setValue((current) => (current >= 100 ? 0 : current + 10)), 600)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.stack}>
      <Progress.Root className={styles.stack} value={value}>
        <div className={styles.row} style={{ justifyContent: 'space-between', width: '14rem' }}>
          <Progress.Label className={styles.label}>Uploading</Progress.Label>
          <Progress.Value className={styles.note} />
        </div>
        <div className={styles.progress}>
          <Progress.Indicator
            className={styles.progressIndicator}
            style={{ transform: `translateX(-${100 - value}%)` }}
          />
        </div>
      </Progress.Root>
    </div>
  )
}
