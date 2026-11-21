'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Search</Button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined} className="data-[state=closed]:hidden" forceMount>
        <SheetHeader>
          <SheetTitle>Search</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <Input placeholder="The query survives closing" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
