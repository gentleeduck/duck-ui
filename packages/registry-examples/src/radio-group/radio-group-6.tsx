'use client'

import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'
import { Check, X } from 'lucide-react'

export default function Demo() {
  return (
    <RadioGroup aria-label="Attending" defaultValue="yes">
      <RadioGroupItem checkedIndicator={<Check />} indicator={<X />} value="yes">
        Yes, I will be there
      </RadioGroupItem>
      <RadioGroupItem checkedIndicator={<Check />} indicator={<X />} value="no">
        No, I cannot make it
      </RadioGroupItem>
    </RadioGroup>
  )
}
