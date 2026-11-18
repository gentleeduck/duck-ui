'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'
import * as React from 'react'

export default function Demo() {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <ResizablePanelGroup className="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]">
      <ResizablePanel
        collapsedSize="8%"
        collapsible
        defaultSize="30%"
        maxSize="45%"
        minSize="20%"
        onResize={({ asPercentage }) => setCollapsed(asPercentage < 20)}>
        <div className="flex h-full items-center justify-center p-2">
          <span className="font-semibold">{collapsed ? 'N' : 'Navigation'}</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="70%">
        <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground text-sm">
          Drag the sidebar below 20% and it snaps shut to a rail
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
