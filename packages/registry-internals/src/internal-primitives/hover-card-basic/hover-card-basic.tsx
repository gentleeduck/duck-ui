'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import * as HoverCard from '@gentleduck/primitives/hover-card'
import styles from '../primitives.module.css'

export default function HoverCardBasicExample() {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger
        className={styles.button}
        href="https://github.com/gentleeduck"
        rel="noreferrer"
        target="_blank">
        @gentleduck
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content className={`${styles.content} ${styles.panel}`} sideOffset={8}>
          <div className={styles.row}>
            <Avatar.Root className={styles.avatar}>
              <Avatar.Image
                alt=""
                className={styles.avatarImage}
                src="https://avatars.githubusercontent.com/u/108896341?v=4"
              />
              <Avatar.Fallback>GD</Avatar.Fallback>
            </Avatar.Root>
            <div className={styles.stack} style={{ gap: '0.15rem' }}>
              <strong>gentleduck</strong>
              <span className={styles.note}>Accessible primitives for React.</span>
            </div>
          </div>
          <HoverCard.Arrow className={styles.arrow} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
