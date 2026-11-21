'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <div className="flex flex-wrap gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline">{side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>From the {side}</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
