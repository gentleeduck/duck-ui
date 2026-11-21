'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'
import * as React from 'react'

export default function Demo() {
  const search = React.useRef<HTMLInputElement>(null)
  const after = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Search from the top</Button>
        </SheetTrigger>
        <SheetContent finalFocus={after} initialFocus={search} side="top">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
            <SheetDescription>Focus starts in the field and lands on Results once closed.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Input placeholder="Search the docs" ref={search} />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button>Search</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Button ref={after} variant="outline">
        Results
      </Button>
    </div>
  )
}
