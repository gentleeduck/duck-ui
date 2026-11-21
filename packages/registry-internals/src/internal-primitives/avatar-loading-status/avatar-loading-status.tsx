'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AvatarLoadingStatusExample() {
  const [good, setGood] = React.useState('idle')
  const [broken, setBroken] = React.useState('idle')

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Avatar.Root className={styles.avatar}>
          <Avatar.Image
            alt="gentleduck"
            className={styles.avatarImage}
            onLoadingStatusChange={setGood}
            src="https://avatars.githubusercontent.com/u/108896341?v=4"
          />
          <Avatar.Fallback>GD</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root className={styles.avatar}>
          <Avatar.Image
            alt="Missing"
            className={styles.avatarImage}
            onLoadingStatusChange={setBroken}
            src="https://example.invalid/missing.png"
          />
          <Avatar.Fallback>?</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <p className={styles.note}>
        First image: {good}. Broken image: {broken}, so its fallback stays.
      </p>
    </div>
  )
}
