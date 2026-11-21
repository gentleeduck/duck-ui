'use client'

import * as Arrow from '@gentleduck/primitives/arrow'
import styles from '../primitives.module.css'

export default function ArrowCustomShapeExample() {
  return (
    <div className={styles.row}>
      <div className={styles.stack} style={{ justifyItems: 'center' }}>
        <div className={`${styles.content} ${styles.panel}`} style={{ minWidth: 0 }}>
          Sharp
        </div>
        <Arrow.Root aria-hidden asChild className={styles.arrow} height={8} style={{ marginTop: '-0.8rem' }} width={16}>
          <polygon points="0,0 30,0 15,10" />
        </Arrow.Root>
      </div>
      <div className={styles.stack} style={{ justifyItems: 'center' }}>
        <div className={`${styles.content} ${styles.panel}`} style={{ minWidth: 0 }}>
          Notched
        </div>
        <Arrow.Root aria-hidden asChild className={styles.arrow} height={8} style={{ marginTop: '-0.8rem' }} width={16}>
          <path d="M0 0h30L20 10h-10z" />
        </Arrow.Root>
      </div>
    </div>
  )
}
