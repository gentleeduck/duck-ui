'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  useCollapsible,
} from '@gentleduck/registry-ui/collapsible'

function Actions() {
  const { contentRef, onOpenChange, triggerRef, wrapperRef } = useCollapsible()

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => {
          onOpenChange(true)
          requestAnimationFrame(() => contentRef.current?.scrollIntoView({ block: 'nearest' }))
        }}
        size="sm"
        variant="outline">
        Show the notes
      </Button>
      <Button onClick={() => triggerRef.current?.focus()} size="sm" variant="outline">
        Focus the toggle
      </Button>
      <Button onClick={() => wrapperRef.current?.scrollIntoView({ block: 'nearest' })} size="sm" variant="outline">
        Scroll to the section
      </Button>
    </div>
  )
}

export default function Demo() {
  return (
    <Collapsible className="flex w-[350px] flex-col gap-3 rounded-md border p-3">
      <Actions />
      <CollapsibleTrigger className="text-start font-medium">Release notes</CollapsibleTrigger>
      <CollapsibleContent className="text-muted-foreground text-sm">
        Fixed the date picker in Safari, and the calendar keeps its tab stop.
      </CollapsibleContent>
    </Collapsible>
  )
}
