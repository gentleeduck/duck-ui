'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  MotionCommandDialog,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Open the animated palette
      </Button>
      <MotionCommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {['New file', 'New folder', 'Open recent'].map((action) => (
            <CommandItem key={action} onSelect={() => setOpen(false)}>
              {action}
            </CommandItem>
          ))}
        </CommandList>
      </MotionCommandDialog>
    </>
  )
}
