'use client'

import * as Command from '@gentleduck/primitives/command'
import styles from '../primitives.module.css'

export default function CommandDisabledItemsExample() {
  return (
    <Command.Root className={styles.command} aria-label="Exports">
      <Command.Input className={styles.commandInput} placeholder="Export as..." />
      <Command.List className={styles.commandList}>
        <Command.Item className={styles.item} value="pdf">
          PDF
        </Command.Item>
        <Command.Item className={styles.item} disabled value="docx">
          Word (needs a paid plan)
        </Command.Item>
        <Command.Item className={styles.item} value="csv">
          CSV
        </Command.Item>
      </Command.List>
    </Command.Root>
  )
}
