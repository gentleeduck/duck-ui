'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandStatus,
  useCommandSearch,
} from '@gentleduck/registry-ui/command'
import { User } from 'lucide-react'
import * as React from 'react'

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Barbara Liskov', 'Edsger Dijkstra', 'Grace Hopper', 'Linus Torvalds']

function usePeople(search: string) {
  const query = search.trim().toLowerCase()
  const [found, setFound] = React.useState({ query: '', people: [] as string[] })
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFound({ query, people: query ? PEOPLE.filter((person) => person.toLowerCase().includes(query)) : [] })
    }, 300)
    return () => clearTimeout(timer)
  }, [query])
  return { people: found.people, loading: found.query !== query }
}

function Results() {
  const search = useCommandSearch()
  const { people, loading } = usePeople(search)
  return (
    <>
      {loading && <CommandLoading>Searching...</CommandLoading>}
      <CommandStatus>{(count) => `${count} found`}</CommandStatus>
      <CommandList>
        {!loading && <CommandEmpty>{search.trim() ? 'No one found.' : 'Type a name to search.'}</CommandEmpty>}
        <CommandGroup heading="People">
          {people.map((person) => (
            <CommandItem key={person} value={person}>
              <User />
              <span>{person}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </>
  )
}

export default function Demo() {
  return (
    <Command className="h-fit w-80 border pt-0" shouldFilter={false}>
      <CommandInput placeholder="Search people..." />
      <Results />
    </Command>
  )
}
