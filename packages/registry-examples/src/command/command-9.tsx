'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStatus,
  useCommandSearch,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

const ROW = 32
const DRAWN = 14
const STATIONS = Array.from({ length: 5000 }, (_, index) => `Station ${String(index + 1).padStart(4, '0')}`)

function Stations() {
  const search = useCommandSearch().trim().toLowerCase()
  const rows = React.useMemo(() => STATIONS.filter((station) => station.toLowerCase().includes(search)), [search])
  const [view, setView] = React.useState<HTMLDivElement | null>(null)
  const [top, setTop] = React.useState(0)

  React.useEffect(() => {
    if (!view) return
    const follow = () => setTop(view.scrollTop)
    view.addEventListener('scroll', follow, { passive: true })
    return () => view.removeEventListener('scroll', follow)
  }, [view])

  const virtual = React.useMemo(
    () => ({
      count: rows.length,
      scrollToIndex: (index: number) => {
        if (!view) return
        const start = index * ROW
        if (start < view.scrollTop) view.scrollTop = start
        else if (start + ROW > view.scrollTop + view.clientHeight) view.scrollTop = start + ROW - view.clientHeight
        setTop(view.scrollTop)
      },
    }),
    [rows.length, view],
  )

  const first = Math.max(0, Math.floor(top / ROW) - 2)
  const drawn = rows.slice(first, first + DRAWN)

  return (
    <>
      <CommandList scrollRef={setView} style={{ height: rows.length * ROW, position: 'relative' }} virtual={virtual}>
        <CommandEmpty>No station found.</CommandEmpty>
        {drawn.map((station, offset) => (
          <CommandItem
            className="absolute inset-x-0"
            index={first + offset}
            key={station}
            style={{ height: ROW, top: (first + offset) * ROW }}
            value={station}>
            {station}
          </CommandItem>
        ))}
      </CommandList>
      <CommandStatus className="not-sr-only border-t px-3 py-2 text-muted-foreground text-xs">
        {(count) => `${count.toLocaleString()} stations, ${drawn.length} drawn`}
      </CommandStatus>
    </>
  )
}

export default function Demo() {
  return (
    <Command className="h-fit w-80 border pt-0" shouldFilter={false}>
      <CommandInput placeholder="Search 5,000 stations..." />
      <Stations />
    </Command>
  )
}
