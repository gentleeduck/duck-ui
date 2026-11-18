'use client'

import { Slider } from '@gentleduck/registry-ui/slider'
import * as React from 'react'

export default function Demo() {
  const [depth, setDepth] = React.useState([30])

  return (
    <div className="mx-auto flex items-center gap-4">
      <Slider
        aria-label="Depth"
        className="h-40"
        inverted
        onValueChange={setDepth}
        orientation="vertical"
        value={depth}
      />
      <span className="text-muted-foreground text-sm tabular-nums">{depth[0]} m down</span>
    </div>
  )
}
