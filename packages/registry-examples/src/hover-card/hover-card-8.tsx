'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import { Skeleton } from '@gentleduck/registry-ui/skeleton'
import * as React from 'react'

function Profile() {
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600)
    return () => clearTimeout(timer)
  }, [])

  if (!loaded) {
    return (
      <div className="flex gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage alt="gentleduck" src="https://github.com/gentleeduck.png" />
        <AvatarFallback>GD</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start gap-2">
        <h4 className="font-semibold text-sm">@gentleduck</h4>
        <p className="text-sm">Builds accessible React components.</p>
        <Button size="sm">Follow</Button>
      </div>
    </div>
  )
}

export default function Demo() {
  return (
    <HoverCard>
      <HoverCardTrigger href="#" variant="link">
        @gentleduck
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <Profile />
      </HoverCardContent>
    </HoverCard>
  )
}
