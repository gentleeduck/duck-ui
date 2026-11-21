'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Label } from '@gentleduck/registry-ui/label'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import * as React from 'react'

const PLANS = [
  { label: 'Hobby, free', text: 'Hobby', value: 'hobby' },
  { label: 'Pro, 20 a month', text: 'Pro', value: 'pro' },
  { label: 'Team, 50 a month', text: 'Team', value: 'team' },
]

export default function Demo() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('plan')))
      }}>
      <RadioGroup loop={false} name="plan" required>
        {PLANS.map((plan) => (
          <div className="flex items-center gap-2" key={plan.value}>
            <RadioGroupItem id={`radio-8-${plan.value}`} textValue={plan.text} value={plan.value} />
            <Label htmlFor={`radio-8-${plan.value}`}>{plan.label}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button className="self-start" type="submit">
        Continue
      </Button>
      <p className="text-muted-foreground text-sm">
        {sent
          ? `Submitted plan=${sent}`
          : 'required refuses an empty pick. Typing P jumps to Pro through its textValue.'}
      </p>
    </form>
  )
}
