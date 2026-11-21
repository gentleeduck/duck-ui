'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { Copy, Scissors } from 'lucide-react'

export default function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel inset>Clipboard</DropdownMenuLabel>
        <DropdownMenuItem textValue="Cut">
          <Scissors aria-hidden="true" /> Cut
        </DropdownMenuItem>
        <DropdownMenuItem textValue="Copy">
          <Copy aria-hidden="true" /> Copy
        </DropdownMenuItem>
        <DropdownMenuItem inset>Paste</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub defaultOpen>
          <DropdownMenuSubTrigger inset>Paste special</DropdownMenuSubTrigger>
          <DropdownMenuSubContent alignOffset={-4} sideOffset={6}>
            <DropdownMenuItem>Values only</DropdownMenuItem>
            <DropdownMenuItem>Formatting only</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
