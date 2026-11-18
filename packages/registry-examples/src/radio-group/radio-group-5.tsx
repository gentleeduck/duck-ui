'use client'

import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'

export default function Demo() {
  return (
    <RadioGroup aria-label="Delivery" className="flex-row gap-6" defaultValue="standard" orientation="horizontal">
      <RadioGroupItem value="standard">Standard</RadioGroupItem>
      <RadioGroupItem value="express">Express</RadioGroupItem>
      <RadioGroupItem disabled value="same-day">
        Same day
      </RadioGroupItem>
    </RadioGroup>
  )
}
