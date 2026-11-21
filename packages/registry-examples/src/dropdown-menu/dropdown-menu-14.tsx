'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'

export default function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Placed with offsets</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" alignOffset={12} avoidCollisions collisionPadding={24} sideOffset={12}>
        <DropdownMenuItem>Twelve pixels below</DropdownMenuItem>
        <DropdownMenuItem>And twelve along</DropdownMenuItem>
        <DropdownMenuItem>Kept 24px off the viewport edge</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
