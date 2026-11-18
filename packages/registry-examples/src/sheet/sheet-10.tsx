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
  const [count, setCount] = React.useState(0)

  return (
    <div className="flex items-center gap-2">
      <Sheet modal={false}>
        <SheetTrigger asChild>
          <Button variant="outline">Help</Button>
        </SheetTrigger>
        <SheetContent onInteractOutside={(event) => event.preventDefault()}>
          <SheetHeader>
            <SheetTitle>Help</SheetTitle>
            <SheetDescription>
              The page behind stays usable, and the sheet stays open until it is closed.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Button onClick={() => setCount((value) => value + 1)} variant="secondary">
        Clicked {count} times
      </Button>
    </div>
  )
}
