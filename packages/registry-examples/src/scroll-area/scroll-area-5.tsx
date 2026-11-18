'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'
import * as React from 'react'

const lines = Array.from({ length: 40 }, (_, i) => `[12:${String(i).padStart(2, '0')}] build step ${i + 1} finished`)

export default function Demo() {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const scrollTo = (top: number) => viewportRef.current?.scrollTo({ behavior: 'smooth', top })

  return (
    <div className="flex w-80 flex-col gap-2">
      <ScrollArea aria-label="Build log" className="h-56 rounded-md border" role="region" viewportRef={viewportRef}>
        <pre className="p-4 font-mono text-xs leading-6">{lines.join('\n')}</pre>
      </ScrollArea>
      <div className="flex gap-2">
        <Button onClick={() => scrollTo(0)} size="sm" variant="outline">
          Back to top
        </Button>
        <Button onClick={() => scrollTo(viewportRef.current?.scrollHeight ?? 0)} size="sm" variant="outline">
          Jump to latest
        </Button>
      </div>
    </div>
  )
}
