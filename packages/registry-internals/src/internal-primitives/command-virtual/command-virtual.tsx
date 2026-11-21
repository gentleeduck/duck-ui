'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

const ROWS = Array.from({ length: 5000 }, (_, index) => `Row ${index + 1}`)
const ROW = 32
const VIEW = 256

export default function CommandVirtualExample() {
  const view = React.useRef<HTMLDivElement>(null)
  const [top, setTop] = React.useState(0)
  const first = Math.max(0, Math.floor(top / ROW) - 3)
  const last = Math.min(ROWS.length, Math.ceil((top + VIEW) / ROW) + 3)
  const scrollToIndex = React.useCallback((index: number) => {
    const box = view.current
    if (!box) return
    if (index * ROW < box.scrollTop) box.scrollTop = index * ROW
    else if ((index + 1) * ROW > box.scrollTop + VIEW) box.scrollTop = (index + 1) * ROW - VIEW
  }, [])

  return (
    <Command.Root className={styles.command} aria-label="Rows" shouldFilter={false}>
      <Command.Input className={styles.commandInput} placeholder="Arrow through 5,000 rows..." />
      <div
        onScroll={(event) => setTop(event.currentTarget.scrollTop)}
        ref={view}
        style={{ height: VIEW, overflow: 'auto' }}>
        <Command.List
          style={{ height: ROWS.length * ROW, position: 'relative' }}
          virtual={{ count: ROWS.length, scrollToIndex }}>
          {ROWS.slice(first, last).map((row, offset) => (
            <Command.Item
              className={styles.item}
              index={first + offset}
              key={row}
              style={{ height: ROW, insetInline: 0, position: 'absolute', top: (first + offset) * ROW }}
              value={row}>
              {row}
            </Command.Item>
          ))}
        </Command.List>
      </div>
    </Command.Root>
  )
}
