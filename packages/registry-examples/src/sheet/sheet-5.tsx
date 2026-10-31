'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  MotionSheet,
  MotionSheetContent,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

const SHEET_SIDES = ['right'] as const

export default function Demo() {
  return (
    <div className="grid grid-cols-1 gap-2">
      {SHEET_SIDES.map((side) => (
        <MotionSheet key={side}>
          <SheetTrigger asChild>
            <Button variant={'outline'}>{side}</Button>
          </SheetTrigger>
          <MotionSheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="s5-name">Name</Label>
                <Input className="col-span-3" id="s5-name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="s5-username">Username</Label>
                <Input className="col-span-3" id="s5-username" defaultValue="@peduarte" />
              </div>
            </div>
            <SheetFooter className="mt-2">
              <SheetClose asChild>
                <Button>Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </MotionSheetContent>
        </MotionSheet>
      ))}
    </div>
  )
}
