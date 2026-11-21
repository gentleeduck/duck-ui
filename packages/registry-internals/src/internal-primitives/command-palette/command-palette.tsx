'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function CommandPaletteExample() {
  const [last, setLast] = React.useState('nothing yet')

  return (
    <div className={styles.stack}>
      <Command.Root className={styles.command} aria-label="Command palette">
        <Command.Input className={styles.commandInput} placeholder="Type a command or search..." />
        <Command.List className={styles.commandList}>
          <Command.Empty className={styles.commandEmpty}>No results.</Command.Empty>
          <Command.Group heading="Suggestions">
            <Command.Item className={styles.item} keywords={['agenda', 'schedule']} onSelect={setLast} value="calendar">
              Calendar
            </Command.Item>
            <Command.Item className={styles.item} keywords={['emoji']} onSelect={setLast} value="smileys">
              Search emoji
            </Command.Item>
          </Command.Group>
          <Command.Separator className={styles.separator} />
          <Command.Group heading="Settings">
            <Command.Item className={styles.item} onSelect={setLast} value="profile">
              Profile <span className={styles.shortcut}>Ctrl P</span>
            </Command.Item>
            <Command.Item className={styles.item} onSelect={setLast} value="billing">
              Billing <span className={styles.shortcut}>Ctrl B</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Root>
      <p className={styles.note}>Selected: {last}. "agenda" finds Calendar through its keywords.</p>
    </div>
  )
}
