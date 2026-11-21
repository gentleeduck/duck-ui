'use client'

import * as Popper from '@gentleduck/primitives/popper'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PopperVirtualExample() {
  const point = React.useRef({ getBoundingClientRect: () => new DOMRect(0, 0, 0, 0) })
  const [, rerender] = React.useState(0)

  return (
    <Popper.Root>
      <Popper.Anchor virtualRef={point} />
      <div
        className={styles.contextArea}
        onPointerMove={(event) => {
          point.current = { getBoundingClientRect: () => new DOMRect(event.clientX, event.clientY, 0, 0) }
          rerender((count) => count + 1)
        }}>
        Move the pointer here
      </div>
      <Popper.Content
        className={`${styles.content} ${styles.panel}`}
        side="right"
        sideOffset={12}
        style={{ minWidth: 0 }}>
        Following a virtual anchor
      </Popper.Content>
    </Popper.Root>
  )
}
