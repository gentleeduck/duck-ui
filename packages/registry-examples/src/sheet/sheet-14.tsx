'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'
import * as React from 'react'

export default function Demo() {
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open in the dark panel</Button>
        </SheetTrigger>
        <SheetContent container={panel}>
          <SheetHeader>
            <SheetTitle>Rendered in the panel</SheetTitle>
            <SheetDescription>The sheet portals into the panel below and takes its dark theme.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <div className="dark rounded-md border bg-background p-4 text-foreground text-sm" ref={panel}>
        The sheet renders inside this element.
      </div>
    </div>
  )
}
