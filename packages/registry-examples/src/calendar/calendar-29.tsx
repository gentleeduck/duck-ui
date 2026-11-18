'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import * as React from 'react'

export default function Demo() {
  const [date, setDate] = React.useState(new Date())
  const [editing, setEditing] = React.useState(false)

  return (
    <div className="flex flex-col items-start gap-3">
      <Button aria-expanded={editing} onClick={() => setEditing((open) => !open)} variant="outline">
        Due {date.toLocaleDateString()}
      </Button>
      {editing && (
        <Calendar
          className="rounded-md border shadow-sm"
          mode="single"
          defaultMonth={date}
          selected={date}
          onSelect={(picked) => {
            if (picked) setDate(picked)
            setEditing(false)
          }}
          onDismiss={() => setEditing(false)}
          showDropdowns={false}
        />
      )}
    </div>
  )
}
