'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'
import * as React from 'react'

export default function Demo() {
  const [locked, setLocked] = React.useState(true)

  return (
    <div className="flex max-w-md flex-col gap-3 md:min-w-[450px]">
      <ResizablePanelGroup className="min-h-[160px] rounded-lg border">
        <ResizablePanel defaultSize="40%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Preview</span>
          </div>
        </ResizablePanel>
        <ResizableHandle disabled={locked} />
        <ResizablePanel defaultSize="60%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Code</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Button className="self-start" onClick={() => setLocked(!locked)} size="sm" variant="outline">
        {locked ? 'Unlock the layout' : 'Lock the layout'}
      </Button>
    </div>
  )
}
