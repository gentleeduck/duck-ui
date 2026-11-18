'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'
import * as React from 'react'

const DEFAULT_LAYOUT = { editor: 70, files: 30 }

export default function Demo() {
  const [layout, setLayout] = React.useState<Record<string, number>>(DEFAULT_LAYOUT)

  return (
    <div className="flex max-w-md flex-col gap-2 md:min-w-[450px]">
      <ResizablePanelGroup
        className="min-h-[160px] rounded-lg border"
        defaultLayout={DEFAULT_LAYOUT}
        onLayoutChange={setLayout}>
        <ResizablePanel id="files" minSize="20%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Files</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="editor" minSize="30%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Editor</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <p className="text-muted-foreground text-sm">
        {Object.entries(layout)
          .map(([panel, size]) => `${panel} ${Math.round(size)}%`)
          .join(', ')}
      </p>
    </div>
  )
}
