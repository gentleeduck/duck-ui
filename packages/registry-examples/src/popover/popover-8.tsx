'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Popover, PopoverClose, PopoverContent, PopoverTitle, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import * as React from 'react'

export default function Demo() {
  const note = React.useRef<HTMLTextAreaElement>(null)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Add note</Button>
      </PopoverTrigger>
      <PopoverContent className="grid w-80 gap-3" initialFocus={note}>
        <div className="flex items-center justify-between">
          <PopoverTitle>Note</PopoverTitle>
          <PopoverClose asChild>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </PopoverClose>
        </div>
        <Textarea placeholder="Write a note for this layer." ref={note} />
      </PopoverContent>
    </Popover>
  )
}
