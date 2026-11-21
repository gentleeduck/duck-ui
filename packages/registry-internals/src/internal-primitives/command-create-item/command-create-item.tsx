'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

function CreateItem({ onCreate }: { onCreate: (label: string) => void }) {
  const search = Command.useCommandSearch()
  if (!search) return null
  return (
    <Command.Item className={styles.item} forceMount onSelect={() => onCreate(search)} value={`create ${search}`}>
      Create label "{search}"
    </Command.Item>
  )
}

export default function CommandCreateItemExample() {
  const [labels, setLabels] = React.useState(['bug', 'feature', 'docs'])

  return (
    <Command.Root className={styles.command} aria-label="Labels">
      <Command.Input className={styles.commandInput} placeholder="Find or create a label..." />
      <Command.List className={styles.commandList}>
        <Command.Empty className={styles.commandEmpty}>No label matches.</Command.Empty>
        {labels.map((label) => (
          <Command.Item className={styles.item} key={label} value={label}>
            {label}
          </Command.Item>
        ))}
        <CreateItem onCreate={(label) => setLabels((current) => [...current, label])} />
      </Command.List>
    </Command.Root>
  )
}
