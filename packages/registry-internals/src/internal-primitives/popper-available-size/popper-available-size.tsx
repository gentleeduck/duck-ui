'use client'

import * as Popper from '@gentleduck/primitives/popper'
import styles from '../primitives.module.css'

const OPTIONS = Array.from({ length: 40 }, (_, index) => `Option ${index + 1}`)

export default function PopperAvailableSizeExample() {
  return (
    <Popper.Root>
      <Popper.Anchor className={styles.button}>A long list below</Popper.Anchor>
      <Popper.Content
        className={styles.content}
        collisionPadding={16}
        sideOffset={6}
        style={{
          maxHeight: 'var(--gentleduck-popper-available-height)',
          minWidth: 'var(--gentleduck-popper-anchor-width)',
          overflowY: 'auto',
        }}>
        {OPTIONS.map((option) => (
          <div className={styles.item} key={option}>
            {option}
          </div>
        ))}
      </Popper.Content>
    </Popper.Root>
  )
}
