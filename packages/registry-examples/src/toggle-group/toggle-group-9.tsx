'use client'

import { MotionToggleGroup, MotionToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <MotionToggleGroup aria-label="Text style" type="single">
      <MotionToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </MotionToggleGroupItem>
      <MotionToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </MotionToggleGroupItem>
      <MotionToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </MotionToggleGroupItem>
    </MotionToggleGroup>
  )
}
