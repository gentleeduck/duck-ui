'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [locked, setLocked] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch checked={locked} id="lock-actions" onCheckedChange={setLocked} />
        <Label htmlFor="lock-actions">Lock the actions</Label>
      </div>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild disabled={locked}>
          <Button variant="outline">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Archive</DropdownMenuItem>
          <DropdownMenuItem>Move to folder</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="max-w-64 text-center text-muted-foreground text-sm">
        The page still scrolls and takes clicks while the menu is open.
      </p>
    </div>
  )
}
