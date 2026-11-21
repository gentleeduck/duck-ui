'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [events, setEvents] = React.useState(0)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Switch id="switch-7" name="beta" onChange={() => setEvents((count) => count + 1)} />
        <Label htmlFor="switch-7">Join the beta</Label>
      </div>
      <p className="text-muted-foreground text-sm">The native change event fired {events} times.</p>
    </div>
  )
}
