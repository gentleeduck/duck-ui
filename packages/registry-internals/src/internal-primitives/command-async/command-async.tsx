'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

const PACKAGES = ['react', 'react-dom', 'react-router', 'redux', 'remix', 'rollup', 'rxjs', 'vite', 'vitest', 'vue']

function Results({ onLoading }: { onLoading: (loading: boolean) => void }) {
  const search = Command.useCommandSearch()
  const [hits, setHits] = React.useState<string[]>([])

  React.useEffect(() => {
    onLoading(true)
    const timer = setTimeout(() => {
      setHits(search ? PACKAGES.filter((name) => name.includes(search.toLowerCase())) : [])
      onLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [search, onLoading])

  return hits.map((name) => (
    <Command.Item className={styles.item} key={name} value={name}>
      {name}
    </Command.Item>
  ))
}

export default function CommandAsyncExample() {
  const [loading, setLoading] = React.useState(false)

  return (
    <Command.Root className={styles.command} aria-label="Packages" shouldFilter={false}>
      <Command.Input className={styles.commandInput} placeholder="Search packages..." />
      <Command.Status className={styles.note} style={{ padding: '0.3rem 0.75rem' }}>
        {(count) => (loading ? 'Searching...' : `${count} results`)}
      </Command.Status>
      <Command.List className={styles.commandList}>
        {loading ? <Command.Loading className={styles.commandEmpty}>Fetching packages...</Command.Loading> : null}
        {loading ? null : <Command.Empty className={styles.commandEmpty}>Type to search.</Command.Empty>}
        <Results onLoading={setLoading} />
      </Command.List>
    </Command.Root>
  )
}
