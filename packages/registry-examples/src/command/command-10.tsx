'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Open the small palette
      </Button>
      <CommandDialog
        contentClassName="h-80 lg:w-110"
        description="Jump to a page"
        onOpenChange={setOpen}
        open={open}
        title="Quick jump">
        <CommandInput placeholder="Where to?" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => setOpen(false)}>
              Inbox <CommandShortcut keys="g+i" />
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              Drafts <CommandShortcut keys="g+d" variant="secondary" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
