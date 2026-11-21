'use client'

import * as Arrow from '@gentleduck/primitives/arrow'
import styles from '../primitives.module.css'

const SIZES = [
  { width: 10, height: 5 },
  { width: 16, height: 8 },
  { width: 24, height: 6 },
]

export default function ArrowSizesExample() {
  return (
    <div className={styles.row}>
      {SIZES.map(({ width, height }) => (
        <div className={styles.stack} key={width} style={{ justifyItems: 'center' }}>
          <div className={`${styles.content} ${styles.panel}`} style={{ minWidth: 0 }}>
            {width} x {height}
          </div>
          <Arrow.Root
            aria-hidden
            className={styles.arrow}
            height={height}
            style={{ marginTop: '-0.8rem' }}
            width={width}
          />
        </div>
      ))}
    </div>
  )
}
