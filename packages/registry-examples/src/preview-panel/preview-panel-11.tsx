'use client'

import { ZoomControls } from '@gentleduck/registry-ui/preview-panel'
import * as React from 'react'

export default function Demo() {
  const [zoom, setZoom] = React.useState(1)
  const [locked, setLocked] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-40 w-72 items-center justify-center overflow-hidden rounded-md border">
        <div className="size-16 rounded-md bg-primary transition-transform" style={{ transform: `scale(${zoom})` }} />
      </div>
      <ZoomControls
        locked={locked}
        onReset={() => setZoom(1)}
        onToggleLock={() => setLocked((value) => !value)}
        onZoomIn={() => locked || setZoom((value) => Math.min(3, value + 0.25))}
        onZoomOut={() => locked || setZoom((value) => Math.max(0.25, value - 0.25))}
        zoom={zoom}
      />
    </div>
  )
}
