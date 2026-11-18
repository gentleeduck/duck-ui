'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import * as React from 'react'

const PLANS: Record<string, string> = { hobby: 'Hobby', pro: 'Pro', team: 'Team' }

export default function Demo() {
  const [plan, setPlan] = React.useState('pro')
  const [editing, setEditing] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        aria-label="Plan"
        onValueChange={(next) => next !== null && setPlan(next)}
        readOnly={!editing}
        value={plan}>
        {Object.entries(PLANS).map(([value, name]) => (
          <RadioGroupItem key={value} value={value}>
            {name}
          </RadioGroupItem>
        ))}
      </RadioGroup>
      <div className="flex items-center gap-3">
        <Button onClick={() => setEditing(!editing)} size="sm" variant="outline">
          {editing ? 'Done' : 'Change plan'}
        </Button>
        <span className="text-muted-foreground text-sm">Billed on the {PLANS[plan]} plan</span>
      </div>
    </div>
  )
}
