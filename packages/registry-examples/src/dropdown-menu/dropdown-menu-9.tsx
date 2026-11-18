'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  const [last, setLast] = React.useState('nothing yet')

  return (
    <div className="flex flex-col items-center gap-3">
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">File</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onSelect={() => setLast('rename')}>
            Rename
            <DropdownMenuShortcut keys="mod+shift+r" onKeysPressed={() => setLast('rename, from its keys')} />
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLast('export')}>
            Export
            <DropdownMenuShortcut keys="mod+shift+e" onKeysPressed={() => setLast('export, from its keys')} />
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked={pinned} closeOnSelect={false} onCheckedChange={setPinned}>
            Pin to sidebar
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setLast('delete')} variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-muted-foreground text-sm">
        Menu {open ? 'open' : 'closed'}, {pinned ? 'pinned' : 'not pinned'}, last: {last}
      </p>
    </div>
  )
}
