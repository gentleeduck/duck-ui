import * as React from 'react'
import { type IStoryEntry, stories } from './stories'
import styles from './story-index.module.css'

export function StoryIndex() {
  const [query, setQuery] = React.useState('')
  const needle = query.trim().toLowerCase()
  const groups = new Map<string, [string, IStoryEntry][]>()
  for (const [id, entry] of stories) {
    if (needle && !`${entry.title} ${entry.name}`.toLowerCase().includes(needle)) continue
    groups.set(entry.title, [...(groups.get(entry.title) ?? []), [id, entry]])
  }

  return (
    <main className={styles.index}>
      <header className={styles.header}>
        <h1>duck primitives stories</h1>
        <input
          aria-label="Filter stories"
          className={styles.filter}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Filter ${stories.size} stories`}
          type="search"
          value={query}
        />
      </header>
      {[...groups]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([title, entries]) => (
          <section className={styles.group} key={title}>
            <h2>{title}</h2>
            <ul>
              {entries.map(([id, entry]) => (
                <li key={id}>
                  <a href={`?id=${id}`}>{entry.name}</a>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </main>
  )
}
