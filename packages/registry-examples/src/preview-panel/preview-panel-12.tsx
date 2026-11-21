'use client'

import { MotionZoomControls } from '@gentleduck/registry-ui/preview-panel'
import * as React from 'react'

export default function Demo() {
  const [zoom, setZoom] = React.useState(1)

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-muted-foreground text-sm">{Math.round(zoom * 100)}%</span>
      <MotionZoomControls
        onReset={() => setZoom(1)}
        onZoomIn={() => setZoom((value) => Math.min(3, value + 0.25))}
        onZoomOut={() => setZoom((value) => Math.max(0.25, value - 0.25))}
        resetText="Back to 100%"
        zoom={zoom}
        zoomInText="Bigger"
        zoomOutText="Smaller"
      />
    </div>
  )
}
