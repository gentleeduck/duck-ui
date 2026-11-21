'use client'

import * as Command from '@gentleduck/primitives/command'
import styles from '../primitives.module.css'

const COUNTRIES = [
  'Austria',
  'Australia',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'China',
  'Denmark',
  'Egypt',
  'Estonia',
]

// A start of the name ranks first, a match elsewhere in it second.
function prefixFirst(text: string, search: string) {
  const name = text.toLowerCase()
  const query = search.toLowerCase()
  if (name.startsWith(query)) return 1
  return name.includes(query) ? 0.5 : 0
}

export default function CommandFilterExample() {
  return (
    <Command.Root className={styles.command} filter={prefixFirst} aria-label="Countries" limit={4}>
      <Command.Input className={styles.commandInput} placeholder="Search countries..." />
      <Command.List className={styles.commandList}>
        <Command.Empty className={styles.commandEmpty}>No country matches.</Command.Empty>
        {COUNTRIES.map((country) => (
          <Command.Item className={styles.item} key={country} value={country}>
            {country}
          </Command.Item>
        ))}
      </Command.List>
    </Command.Root>
  )
}
