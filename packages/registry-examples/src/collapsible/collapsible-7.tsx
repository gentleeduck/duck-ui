'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  useCollapsible,
} from '@gentleduck/registry-ui/collapsible'

function Status() {
  const { open, contentId, onOpenChange } = useCollapsible()
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span>
        {open ? 'Open' : 'Closed'}, controlling #{contentId}
      </span>
      <button className="underline" onClick={() => onOpenChange(!open)} type="button">
        Toggle from inside
      </button>
    </div>
  )
}

export default function Demo() {
  return (
    <Collapsible className="flex w-[350px] flex-col gap-2 rounded-md border p-3">
      <Status />
      <CollapsibleTrigger className="text-start font-medium">Release notes</CollapsibleTrigger>
      <CollapsibleContent className="text-muted-foreground text-sm">
        Fixed the date picker in Safari.
      </CollapsibleContent>
    </Collapsible>
  )
}
