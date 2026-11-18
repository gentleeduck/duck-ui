'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  useCommandSearch,
} from '@gentleduck/registry-ui/command'
import { FileText, Plus } from 'lucide-react'
import * as React from 'react'

const PAGES = ['Billing', 'Branding', 'Integrations', 'Notifications', 'Profile', 'Security', 'Team members']

function score(text: string, search: string) {
  const word = text.toLowerCase()
  const query = search.toLowerCase()
  if (word.startsWith(query)) return 1
  return word.includes(query) ? 0.5 : 0
}

function CreatePage({ onCreate }: { onCreate: (title: string) => void }) {
  const search = useCommandSearch()
  if (search === '') return null
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Create">
        <CommandItem forceMount value="create" textValue="New page" onSelect={() => onCreate(search)}>
          <Plus />
          <span>Create "{search}"</span>
        </CommandItem>
      </CommandGroup>
    </>
  )
}

export default function Demo() {
  const [pages, setPages] = React.useState(PAGES)
  const [value, setValue] = React.useState('Profile')

  return (
    <div className="flex flex-col gap-2">
      <Command className="h-fit w-80 border pt-0" filter={score} value={value} onValueChange={setValue}>
        <CommandInput placeholder="Find or create a page..." />
        <CommandList>
          <CommandEmpty>No page matches.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem key={page} value={page}>
                <FileText />
                <span>{page}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CreatePage
            onCreate={(title) => setPages((current) => (current.includes(title) ? current : [...current, title]))}
          />
        </CommandList>
      </Command>
      <p className="text-muted-foreground text-sm">Highlighted: {value || 'nothing'}</p>
    </div>
  )
}
