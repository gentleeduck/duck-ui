'use client'

import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

export default function Demo() {
  const [presses, setPresses] = React.useState(0)

  return (
    <div className="flex w-[280px] flex-col gap-2">
      <Label htmlFor="label-6-email" onMouseDown={() => setPresses((count) => count + 1)}>
        Double-click this label
      </Label>
      <Input id="label-6-email" placeholder="you@example.com" />
      <p className="text-muted-foreground text-sm">
        onMouseDown ran {presses} times, and a double click still selects none of the label's text.
      </p>
    </div>
  )
}
