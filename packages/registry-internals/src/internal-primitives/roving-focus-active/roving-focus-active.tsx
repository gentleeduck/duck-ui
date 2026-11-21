'use client'

import * as RovingFocus from '@gentleduck/primitives/roving-focus'
import styles from '../primitives.module.css'

export default function RovingFocusActiveExample() {
  return (
    <div className={styles.stack}>
      <RovingFocus.Root className={styles.group} orientation="horizontal">
        {['Day', 'Week', 'Month'].map((view) => (
          <RovingFocus.Item active={view === 'Week'} asChild key={view}>
            <button aria-pressed={view === 'Week'} className={styles.button} type="button">
              {view}
            </button>
          </RovingFocus.Item>
        ))}
        <RovingFocus.Item asChild focusable={false}>
          <button className={styles.button} disabled type="button">
            Year (soon)
          </button>
        </RovingFocus.Item>
      </RovingFocus.Root>
      <p className={styles.note}>
        Tabbing in lands on the active Week, and the arrows pass over the item that is not focusable.
      </p>
    </div>
  )
}
