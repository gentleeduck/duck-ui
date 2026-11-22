'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@gentleduck/registry-ui/sheet'
import * as React from 'react'

export default function Demo() {
  const [shown, setShown] = React.useState(false)

  return (
    <>
      <Button onClick={() => setShown(true)} variant="outline">
        Show the filters
      </Button>
      {shown && (
        <Sheet defaultOpen onOpenChange={(open) => !open && setShown(false)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>defaultOpen opens the sheet as it mounts, with no trigger of its own.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
