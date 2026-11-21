'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'
import * as React from 'react'

export default function Demo() {
  const [saved, setSaved] = React.useState('50, 50')

  return (
    <div className="flex flex-col items-center gap-3">
      <ResizablePanelGroup
        className="max-w-md rounded-lg border md:min-w-[450px]"
        onLayoutChanged={(layout) =>
          setSaved(
            Object.values(layout)
              .map((size) => Math.round(size))
              .join(', '),
          )
        }
        orientation="horizontal">
        <ResizablePanel defaultSize="50%">
          <div className="flex h-[120px] items-center justify-center">Editor</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%">
          <div className="flex h-[120px] items-center justify-center">Preview</div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <p className="text-muted-foreground text-sm">Saved once the drag settles: {saved}</p>
    </div>
  )
}
