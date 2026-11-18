'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider, type IDirection, toDirection } from '@gentleduck/registry-ui/direction'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { Slider } from '@gentleduck/registry-ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import * as React from 'react'

export default function Demo() {
  const [dir, setDir] = React.useState<IDirection.Kind>('rtl')

  return (
    <div className="grid w-full max-w-sm gap-4">
      <ToggleGroup
        aria-label="Direction"
        onValueChange={(value) => setDir((current) => toDirection(value) ?? current)}
        type="single"
        value={dir}
        variant="outline">
        <ToggleGroupItem value="ltr">Left to right</ToggleGroupItem>
        <ToggleGroupItem value="rtl">Right to left</ToggleGroupItem>
      </ToggleGroup>
      <DirectionProvider dir={dir}>
        <div className="grid gap-4 rounded-lg border p-4">
          <Slider aria-label="Volume" defaultValue={[60]} max={100} step={1} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="justify-self-start" variant="outline">
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Send to</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DirectionProvider>
    </div>
  )
}
