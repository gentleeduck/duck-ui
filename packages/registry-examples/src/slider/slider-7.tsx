'use client'

import { Slider } from '@gentleduck/registry-ui/slider'
import * as React from 'react'

export default function Demo() {
  const id = React.useId()
  const [zoom, setZoom] = React.useState([100])
  const [saved, setSaved] = React.useState([100])

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium" id={id}>
          Zoom
        </span>
        <span className="text-muted-foreground tabular-nums">{zoom[0]}%</span>
      </div>
      <Slider
        aria-labelledby={id}
        largeStep={50}
        max={200}
        min={50}
        onValueChange={setZoom}
        onValueCommit={setSaved}
        step={10}
        value={zoom}
      />
      <p className="text-muted-foreground text-xs">
        Saved at {saved[0]}%. Page Up and Page Down move 50, Home and End go to the ends.
      </p>
    </div>
  )
}
