'use client'

import { DirectionProvider, useDirection } from '@gentleduck/primitives/direction'
import styles from '../primitives.module.css'

function Breadcrumb({ dir }: { dir?: 'ltr' | 'rtl' }) {
  const direction = useDirection(dir)
  const separator = direction === 'rtl' ? '<' : '>'
  return (
    <p className={styles.note} dir={direction}>
      Home {separator} Docs {separator} Direction ({direction})
    </p>
  )
}

export default function DirectionUseDirectionExample() {
  return (
    <DirectionProvider dir="rtl">
      <div className={styles.stack}>
        <Breadcrumb />
        <Breadcrumb dir="ltr" />
      </div>
    </DirectionProvider>
  )
}
