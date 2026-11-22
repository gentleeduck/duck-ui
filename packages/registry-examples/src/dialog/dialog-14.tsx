'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@gentleduck/registry-ui/dialog'
import * as React from 'react'

export default function Demo() {
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open in the dark panel</Button>
        </DialogTrigger>
        <DialogContent container={panel}>
          <DialogHeader>
            <DialogTitle>Rendered in the panel</DialogTitle>
            <DialogDescription>
              The dialog portals into the panel below, so it takes the dark theme the panel carries.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="dark rounded-md border bg-background p-4 text-foreground text-sm" ref={panel}>
        The dialog renders inside this element.
      </div>
    </div>
  )
}
