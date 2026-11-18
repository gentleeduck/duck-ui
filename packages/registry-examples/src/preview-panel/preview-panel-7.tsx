'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import { PreviewPanel } from '@gentleduck/registry-ui/preview-panel'
import { Grid3x3 } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [grid, setGrid] = React.useState(true)

  return (
    <PreviewPanel
      actions={
        <Button
          aria-label="Show the grid"
          aria-pressed={grid}
          className="rounded-md border bg-background/80 backdrop-blur-sm"
          icon={<Grid3x3 aria-hidden="true" />}
          onClick={() => setGrid((shown) => !shown)}
          size="icon-sm"
          variant={grid ? 'secondary' : 'ghost'}
        />
      }
      className="rounded-lg border bg-card"
      defaultLocked={false}
      maxHeight="400px"
      maxZoom={2}
      minZoom={0.5}>
      <div
        className={cn(
          'flex size-72 flex-col items-center justify-center gap-2 rounded-md border border-dashed',
          grid &&
            '[background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]',
        )}>
        <span className="font-semibold text-lg">Canvas</span>
        <span className="text-muted-foreground text-sm">Drag, scroll or pinch, from 50% to 200%</span>
      </div>
    </PreviewPanel>
  )
}
