'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
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
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('Pedro Duarte')

  return (
    <div className="flex items-center gap-3">
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger asChild>
          <Button variant="outline">Rename</Button>
        </SheetTrigger>
        <SheetContent hideClose>
          <form
            className="flex flex-1 flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setName(String(new FormData(event.currentTarget).get('name')))
              setOpen(false)
            }}>
            <SheetHeader>
              <SheetTitle>Rename the account</SheetTitle>
              <SheetDescription>Saving closes the sheet. Cancel leaves the name as it was.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-2">
              <Label htmlFor="sheet-7-name">Name</Label>
              <Input defaultValue={name} id="sheet-7-name" name="name" required />
            </div>
            <SheetFooter className="mt-auto">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <span className="text-muted-foreground text-sm">{name}</span>
    </div>
  )
}
