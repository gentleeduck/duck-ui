'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import * as React from 'react'

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'grapes', label: 'Grapes' },
  { value: 'pineapple', label: 'Pineapple' },
]

export default function Demo() {
  const [picked, setPicked] = React.useState<string[]>(['apple', 'grapes'])

  return (
    <div className="flex items-center gap-2">
      <Select multiple onValueChange={setPicked} value={picked}>
        <SelectTrigger aria-label="Fruits" className="w-[180px]">
          <SelectValue placeholder="No fruit picked">
            {picked.length === 1 ? '1 fruit' : `${picked.length} fruits`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {fruits.map((fruit) => (
            <SelectItem key={fruit.value} value={fruit.value}>
              {fruit.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        disabled={picked.length === fruits.length}
        onClick={() => setPicked(fruits.map((fruit) => fruit.value))}
        size="sm"
        variant="outline">
        All
      </Button>
      <Button disabled={picked.length === 0} onClick={() => setPicked([])} size="sm" variant="outline">
        Clear
      </Button>
    </div>
  )
}
