'use client'

import * as Popper from '@gentleduck/primitives/popper'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PopperCollisionsExample() {
  const [box, setBox] = React.useState<HTMLDivElement | null>(null)

  return (
    <div
      className={styles.box}
      ref={setBox}
      style={{ height: '12rem', overflow: 'auto', position: 'relative', width: '20rem' }}>
      <div style={{ height: '30rem', paddingTop: '9rem', paddingInlineStart: '1rem' }}>
        <Popper.Root>
          <Popper.Anchor className={styles.button}>Scroll the box</Popper.Anchor>
          <Popper.Content
            className={`${styles.content} ${styles.panel}`}
            collisionBoundary={box}
            collisionPadding={8}
            hideWhenDetached
            side="bottom"
            sticky="always"
            style={{ minWidth: 0 }}>
            Flips to stay in the box, and hides once its anchor scrolls out.
          </Popper.Content>
        </Popper.Root>
      </div>
    </div>
  )
}
