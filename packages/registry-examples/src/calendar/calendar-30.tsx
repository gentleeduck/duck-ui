'use client'

import type { Selection } from '@gentleduck/calendar'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const today = new Date()
  const [stay, setStay] = React.useState<Selection.DateRange<Date> | null>({
    from: new Date(today.getFullYear(), today.getMonth(), 8),
    to: new Date(today.getFullYear(), today.getMonth(), 12),
  })
  const [locked, setLocked] = React.useState(true)

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        <Switch id="stay-locked" checked={locked} onCheckedChange={setLocked} />
        <Label htmlFor="stay-locked">Booking confirmed</Label>
      </div>
      <Calendar
        className="rounded-md border shadow-sm"
        mode="range"
        selected={stay}
        onSelect={setStay}
        readOnly={locked}
        showDropdowns={false}
      />
    </div>
  )
}
