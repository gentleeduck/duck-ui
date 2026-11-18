'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { PreviewPanel, type PreviewPanelState } from '@gentleduck/registry-ui/preview-panel'
import * as React from 'react'

const ZOOMS = [0.5, 1, 2]

export default function Demo() {
  const [view, setView] = React.useState<PreviewPanelState>({ x: 0, y: 0, zoom: 1 })

  return (
    <div className="flex w-full flex-col gap-3">
      <ButtonGroup aria-label="Zoom">
        {ZOOMS.map((zoom) => (
          <Button
            aria-pressed={view.zoom === zoom}
            key={zoom}
            onClick={() => setView({ x: 0, y: 0, zoom })}
            size="sm"
            variant={view.zoom === zoom ? 'secondary' : 'outline'}>
            {zoom * 100}%
          </Button>
        ))}
      </ButtonGroup>
      <PreviewPanel className="rounded-lg border bg-card" maxHeight="320px" showControls={false} syncState={view}>
        <div className="flex flex-col items-center gap-3 p-8">
          <div className="size-20 rounded-full bg-primary/20" />
          <p className="text-muted-foreground text-sm">Only the buttons above move this view.</p>
        </div>
      </PreviewPanel>
    </div>
  )
}
