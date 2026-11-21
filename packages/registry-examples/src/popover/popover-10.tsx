'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import * as React from 'react'

export default function Demo() {
  const next = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-center gap-2">
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="outline">Tip</Button>
        </PopoverTrigger>
        <PopoverContent alignOffset={8} className="w-60 text-sm" finalFocus={next} sideOffset={12}>
          Open from the start, 12px from its trigger, with a wide arrow. On close, focus moves to Next.
          <PopoverArrow height={10} width={20} />
        </PopoverContent>
      </Popover>
      <Button ref={next} variant="outline">
        Next
      </Button>
    </div>
  )
}
