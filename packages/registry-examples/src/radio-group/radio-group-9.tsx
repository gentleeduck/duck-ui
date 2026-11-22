'use client'

import { MotionRadioGroupItem, RadioGroup } from '@gentleduck/registry-ui/radio-group'

const plans = [
  { label: 'Starter', value: 'starter' },
  { label: 'Team', value: 'team' },
  { label: 'Pro', value: 'pro' },
]

export default function Demo() {
  return (
    <RadioGroup className="flex flex-col gap-2" defaultValue="pro">
      {plans.map((plan, place) => (
        <MotionRadioGroupItem index={plans.length - 1 - place} key={plan.value} value={plan.value}>
          {plan.label}
        </MotionRadioGroupItem>
      ))}
    </RadioGroup>
  )
}
