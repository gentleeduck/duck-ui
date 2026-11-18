'use client'

import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { LayoutGrid, List } from 'lucide-react'
import * as React from 'react'

const files = ['invoice.pdf', 'logo.svg', 'notes.md', 'photo.jpg']

export default function Demo() {
  const [view, setView] = React.useState('list')

  return (
    <div className="grid w-full max-w-sm gap-3">
      <ToggleGroup
        aria-label="View"
        className="justify-self-end"
        deselectable={false}
        onValueChange={setView}
        type="single"
        value={view}
        variant="outline">
        <ToggleGroupItem aria-label="List" value="list">
          <List />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Grid" value="grid">
          <LayoutGrid />
        </ToggleGroupItem>
      </ToggleGroup>
      <ul className={view === 'grid' ? 'grid grid-cols-2 gap-2' : 'grid gap-1'}>
        {files.map((file) => (
          <li className="rounded-md border px-3 py-2 text-sm" key={file}>
            {file}
          </li>
        ))}
      </ul>
    </div>
  )
}
