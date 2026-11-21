'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'

export default function Demo() {
  return (
    <HoverCard defaultOpen>
      <HoverCardTrigger border="primary" variant="ghost">
        Open from the start
      </HoverCardTrigger>
      <HoverCardContent align="start" alignOffset={8} className="w-64" sideOffset={10}>
        defaultOpen shows the card on load. It is aligned to the trigger's start and pushed 10px away.
      </HoverCardContent>
    </HoverCard>
  )
}
