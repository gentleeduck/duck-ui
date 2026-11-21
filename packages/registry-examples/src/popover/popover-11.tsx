'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Draft a note</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 data-[state=closed]:hidden" forceMount>
        <Input placeholder="Type, close and open again" />
        <p className="mt-2 text-muted-foreground text-xs">
          forceMount keeps the field, and what you typed, while closed.
        </p>
      </PopoverContent>
    </Popover>
  )
}
