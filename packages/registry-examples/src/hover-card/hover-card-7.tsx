'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import * as React from 'react'

const USERS = [
  { handle: '@quick', note: 'Opens at once and closes as soon as you leave.', openDelay: 0, closeDelay: 0 },
  { handle: '@patient', note: 'Waits a second to open and lingers a second after.', openDelay: 1000, closeDelay: 1000 },
] as const

export default function Demo() {
  const [open, setOpen] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6">
        {USERS.map((user) => (
          <HoverCard
            closeDelay={user.closeDelay}
            key={user.handle}
            onOpenChange={(next) =>
              setOpen((current) => (next ? user.handle : current === user.handle ? null : current))
            }
            openDelay={user.openDelay}>
            <HoverCardTrigger href="#" variant="link">
              {user.handle}
            </HoverCardTrigger>
            <HoverCardContent className="w-64 text-sm">{user.note}</HoverCardContent>
          </HoverCard>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">Open: {open ?? 'none'}</p>
    </div>
  )
}
