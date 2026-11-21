'use client'

import * as HoverCard from '@gentleduck/primitives/hover-card'
import styles from '../primitives.module.css'

function Card({ label, openDelay, closeDelay }: { label: string; openDelay: number; closeDelay: number }) {
  return (
    <HoverCard.Root closeDelay={closeDelay} openDelay={openDelay}>
      <HoverCard.Trigger className={styles.button} href="#">
        {label}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content className={`${styles.content} ${styles.panel}`} sideOffset={8}>
          Opens after {openDelay}ms, closes {closeDelay}ms after the pointer leaves.
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}

export default function HoverCardDelaysExample() {
  return (
    <div className={styles.row}>
      <Card closeDelay={100} label="Quick" openDelay={150} />
      <Card closeDelay={300} label="Default" openDelay={700} />
      <Card closeDelay={1000} label="Lingering" openDelay={400} />
    </div>
  )
}
