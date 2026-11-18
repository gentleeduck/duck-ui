'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import * as React from 'react'

const LIMIT = 3

const toppings = [
  { value: 'mushroom', label: 'Mushroom' },
  { value: 'olive', label: 'Olive' },
  { value: 'onion', label: 'Onion' },
  { value: 'pepper', label: 'Pepper' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'sweetcorn', label: 'Sweetcorn' },
]

export default function Demo() {
  const [picked, setPicked] = React.useState<string[]>([])
  const full = picked.length >= LIMIT

  return (
    <div className="flex flex-col gap-2">
      <Select multiple onValueChange={setPicked} value={picked}>
        <SelectTrigger aria-label="Toppings" className="w-[280px]">
          <SelectValue placeholder={`Pick up to ${LIMIT} toppings`} />
        </SelectTrigger>
        <SelectContent>
          {toppings.map((topping) => (
            <SelectItem disabled={full && !picked.includes(topping.value)} key={topping.value} value={topping.value}>
              {topping.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">
        {picked.length} of {LIMIT} picked
      </p>
    </div>
  )
}
