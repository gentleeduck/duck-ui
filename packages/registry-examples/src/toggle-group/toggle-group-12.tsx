'use client'

import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import * as React from 'react'

const days = [
  ['mon', 'M', 'Monday'],
  ['tue', 'T', 'Tuesday'],
  ['wed', 'W', 'Wednesday'],
  ['thu', 'T', 'Thursday'],
  ['fri', 'F', 'Friday'],
  ['sat', 'S', 'Saturday'],
  ['sun', 'S', 'Sunday'],
] as const

const list = new Intl.ListFormat('en', { type: 'conjunction' })

export default function Demo() {
  const [picked, setPicked] = React.useState<string[]>(['mon', 'wed', 'fri'])
  const names = days.filter(([value]) => picked.includes(value)).map(([, , name]) => name)

  return (
    <div className="grid gap-3">
      <ToggleGroup
        aria-label="Repeat on"
        className="justify-start"
        onValueChange={setPicked}
        size="sm"
        type="multiple"
        value={picked}
        variant="outline">
        {days.map(([value, letter, name]) => (
          <ToggleGroupItem aria-label={name} className="w-9" key={value} value={value}>
            {letter}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {names.length > 0 ? `Repeats every ${list.format(names)}.` : 'Does not repeat.'}
      </p>
    </div>
  )
}
