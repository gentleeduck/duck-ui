'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'
import { Pencil } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('Quarterly report')
  const [draft, setDraft] = React.useState(name)

  return (
    <Popover
      modal
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setDraft(name)
      }}
      open={open}>
      <PopoverAnchor className="flex w-72 items-center justify-between gap-2 rounded-md border px-3 py-1.5">
        <span className="truncate text-sm">{name}</span>
        <PopoverTrigger asChild>
          <Button aria-label="Rename" size="icon-sm" variant="ghost">
            <Pencil />
          </Button>
        </PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent align="start" className="grid w-72 gap-3">
        <div className="grid gap-1.5">
          <PopoverTitle>Rename</PopoverTitle>
          <PopoverDescription>The new name shows wherever the file is listed.</PopoverDescription>
        </div>
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setName(draft.trim() || name)
            setOpen(false)
          }}>
          <Label htmlFor={id}>Name</Label>
          <Input id={id} onChange={(event) => setDraft(event.target.value)} value={draft} />
          <Button type="submit">Save</Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
