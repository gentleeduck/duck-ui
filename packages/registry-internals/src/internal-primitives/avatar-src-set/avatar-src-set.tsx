'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import styles from '../primitives.module.css'

export default function AvatarSrcSetExample() {
  return (
    <div className={styles.stack}>
      <Avatar.Root className={styles.avatar} style={{ width: '3.5rem', height: '3.5rem' }}>
        <Avatar.Image
          alt="gentleduck"
          className={styles.avatarImage}
          sizes="56px"
          srcSet="https://avatars.githubusercontent.com/u/108896341?v=4&s=56 1x, https://avatars.githubusercontent.com/u/108896341?v=4&s=112 2x"
        />
        <Avatar.Fallback>GD</Avatar.Fallback>
      </Avatar.Root>
      <p className={styles.note}>A srcSet alone is enough: the browser picks the candidate for the screen.</p>
    </div>
  )
}
