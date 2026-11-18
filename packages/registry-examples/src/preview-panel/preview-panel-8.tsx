'use client'

import { PreviewPanel, type PreviewPanelState } from '@gentleduck/registry-ui/preview-panel'
import * as React from 'react'

const PHOTO = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'

export default function Demo() {
  const [view, setView] = React.useState<PreviewPanelState>({ x: 0, y: 0, zoom: 1 })

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {(['Before', 'After'] as const).map((side) => (
        <figure className="flex flex-col gap-2" key={side}>
          <PreviewPanel
            className="rounded-lg border bg-card"
            maxHeight="280px"
            onStateChange={setView}
            syncState={view}>
            {/* biome-ignore lint/performance/noImgElement: example component demonstrating PreviewPanel with a plain img */}
            <img
              alt={`Landscape, ${side.toLowerCase()} the edit`}
              className={side === 'Before' ? 'max-w-[320px] rounded-md grayscale' : 'max-w-[320px] rounded-md'}
              draggable={false}
              src={PHOTO}
            />
          </PreviewPanel>
          <figcaption className="text-muted-foreground text-sm">
            {side}, at {Math.round(view.zoom * 100)}%
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
