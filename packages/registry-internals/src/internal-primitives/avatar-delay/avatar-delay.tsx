'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AvatarDelayExample() {
  const [key, setKey] = React.useState(0)

  return (
    <div className={styles.stack}>
      <div className={styles.row} key={key}>
        <Avatar.Root className={styles.avatar}>
          <Avatar.Image alt="Slow" className={styles.avatarImage} src="https://example.invalid/slow.png" />
          <Avatar.Fallback delayMs={600}>600</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root className={styles.avatar}>
          <Avatar.Image alt="Slow" className={styles.avatarImage} src="https://example.invalid/slow.png" />
          <Avatar.Fallback delayMs={0}>0</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <button className={styles.button} onClick={() => setKey((value) => value + 1)} type="button">
        Mount again
      </button>
      <p className={styles.note}>
        delayMs keeps a fallback back so a fast image never flashes it. At 0 it shows on the first render.
      </p>
    </div>
  )
}
