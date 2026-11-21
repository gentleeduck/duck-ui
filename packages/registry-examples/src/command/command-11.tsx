'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  useCommandSearch,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

const CITIES = ['Amsterdam', 'Athens', 'Berlin', 'Bogota', 'Cairo', 'Dublin']

function Results({ onProgress }: { onProgress: (progress: number | null) => void }) {
  const search = useCommandSearch()
  const [hits, setHits] = React.useState<string[]>(CITIES)

  React.useEffect(() => {
    let progress = 0
    onProgress(0)
    const timer = setInterval(() => {
      progress += 25
      onProgress(progress)
      if (progress >= 100) {
        clearInterval(timer)
        setHits(CITIES.filter((city) => city.toLowerCase().includes(search.toLowerCase())))
        onProgress(null)
      }
    }, 150)
    return () => clearInterval(timer)
  }, [search, onProgress])

  return hits.map((city) => <CommandItem key={city}>{city}</CommandItem>)
}

export default function Demo() {
  const [progress, setProgress] = React.useState<number | null>(null)
  const [typed, setTyped] = React.useState(0)

  return (
    <Command className="w-[320px] rounded-lg border" shouldFilter={false}>
      <CommandInput
        autoFocus
        onChange={() => setTyped((count) => count + 1)}
        placeholder="Search cities..."
        wrapperClassName="px-3"
      />
      <CommandList>
        {progress === null ? null : <CommandLoading progress={progress}>Searching... {progress}%</CommandLoading>}
        <CommandEmpty>No city found.</CommandEmpty>
        <Results onProgress={setProgress} />
      </CommandList>
      <p className="px-3 pb-2 text-muted-foreground text-xs">{typed} keystrokes heard by onChange.</p>
    </Command>
  )
}
