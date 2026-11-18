'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [custom, setCustom] = React.useState(true)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch checked={custom} id="custom-menu-switch" onCheckedChange={setCustom} />
        <Label htmlFor="custom-menu-switch">Custom menu: {custom ? 'on' : 'off, the browser menu shows'}</Label>
      </div>
      <ContextMenu modal={false}>
        <ContextMenuTrigger
          className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm data-[disabled]:opacity-60"
          disabled={!custom}>
          Right click here, then scroll the page
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem>Open link</ContextMenuItem>
          <ContextMenuItem>Copy link</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
