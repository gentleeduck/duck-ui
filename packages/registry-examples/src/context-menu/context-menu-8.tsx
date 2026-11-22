'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'
import * as React from 'react'

export default function Demo() {
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div
      className="dark flex flex-col items-center gap-4 rounded-md border bg-background p-4 text-foreground"
      ref={panel}>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[120px] w-[260px] items-center justify-center rounded-md border border-dashed text-sm">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48" container={panel}>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <p className="text-muted-foreground text-sm">The menu portals into this dark panel.</p>
    </div>
  )
}
