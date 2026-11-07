'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Set dimensions</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
          }}>
          <div className="space-y-2">
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Configure the dimensions for the layer.</PopoverDescription>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p3-width">Width</Label>
              <Input className="col-span-2 h-8" defaultValue="100%" id="p3-width" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="p3-height">Height</Label>
              <Input className="col-span-2 h-8" defaultValue="25px" id="p3-height" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </PopoverClose>
            <Button size="sm" type="submit">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
