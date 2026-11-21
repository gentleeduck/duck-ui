'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import * as React from 'react'

function Counter() {
  const [count, setCount] = React.useState(0)
  return (
    <button className="underline" onClick={() => setCount((value) => value + 1)} type="button">
      Liked {count} times
    </button>
  )
}

export default function Demo() {
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger variant="outline">Hover me</HoverCardTrigger>
      <HoverCardContent className="w-56 text-sm data-[state=closed]:hidden" forceMount>
        <Counter />
        <p className="text-muted-foreground text-xs">The count survives closing, since forceMount keeps it mounted.</p>
      </HoverCardContent>
    </HoverCard>
  )
}
