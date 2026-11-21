'use client'

import * as RovingFocus from '@gentleduck/primitives/roving-focus'
import styles from '../primitives.module.css'

export default function RovingFocusItemStateExample() {
  return (
    <RovingFocus.Root className={styles.group} orientation="horizontal">
      {['One', 'Two', 'Three'].map((name) => (
        <RovingFocus.Item className={styles.button} key={name}>
          {({ isCurrentTabStop }) => `${name}${isCurrentTabStop ? ' (tab stop)' : ''}`}
        </RovingFocus.Item>
      ))}
    </RovingFocus.Root>
  )
}
