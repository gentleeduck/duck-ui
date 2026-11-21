'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'

export default function Demo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent className="data-[state=closed]:hidden" forceMount>
        <ContextMenuItem>Kept in the page while closed</ContextMenuItem>
        <ContextMenuItem>for an animation of your own</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
