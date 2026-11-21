'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import styles from '../primitives.module.css'

export default function AvatarFallbackExample() {
  return (
    <div className={styles.row}>
      <Avatar.Root className={styles.avatar}>
        <Avatar.Image
          alt="gentleduck"
          className={styles.avatarImage}
          src="https://avatars.githubusercontent.com/u/108896341?v=4"
        />
        <Avatar.Fallback>GD</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root className={styles.avatar}>
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar.Root>
    </div>
  )
}
