'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  MotionPopover,
  MotionPopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <MotionPopover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <MotionPopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p6-width">Width</Label>
              <Input className="col-span-2 h-8" defaultValue="100%" id="p6-width" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p6-maxWidth">Max. width</Label>
              <Input className="col-span-2 h-8" defaultValue="300px" id="p6-maxWidth" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p6-height">Height</Label>
              <Input className="col-span-2 h-8" defaultValue="25px" id="p6-height" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p6-maxHeight">Max. height</Label>
              <Input className="col-span-2 h-8" defaultValue="none" id="p6-maxHeight" />
            </div>
          </div>
        </div>
      </MotionPopoverContent>
    </MotionPopover>
  )
}
