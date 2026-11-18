'use client'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [snap, setSnap] = React.useState(true)
  const [last, setLast] = React.useState('nothing yet')

  return (
    <div className="flex flex-col items-center gap-3">
      <ContextMenu onOpenChange={setOpen} open={open}>
        <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          Right click the canvas
        </ContextMenuTrigger>
        <ContextMenuContent className="w-60">
          <ContextMenuItem onSelect={() => setLast('duplicate')}>
            Duplicate
            <ContextMenuShortcut keys="mod+shift+d" onKeysPressed={() => setLast('duplicate, from its keys')} />
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast('group')}>
            Group
            <ContextMenuShortcut keys="mod+shift+g" onKeysPressed={() => setLast('group, from its keys')} />
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={snap} closeOnSelect={false} onCheckedChange={setSnap}>
            Snap to grid
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
      <p className="text-muted-foreground text-sm">
        Menu {open ? 'open' : 'closed'}, snap {snap ? 'on' : 'off'}, last: {last}
      </p>
    </div>
  )
}
