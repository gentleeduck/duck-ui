'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [previews, setPreviews] = React.useState(true)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch checked={previews} id="hover-card-previews" onCheckedChange={setPreviews} />
        <Label htmlFor="hover-card-previews">Link previews</Label>
      </div>
      <HoverCard disabled={!previews}>
        <HoverCardTrigger variant="link">@gentleduck</HoverCardTrigger>
        <HoverCardContent side="bottom">
          <h4 className="font-semibold text-sm">@gentleduck</h4>
          <p className="text-sm">Accessible primitives and the components built on them.</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
