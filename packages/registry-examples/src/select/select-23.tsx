'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import * as React from 'react'

export default function Demo() {
  const [editing, setEditing] = React.useState(false)
  const [fruit, setFruit] = React.useState('apple')

  if (!editing) {
    return (
      <Button onClick={() => setEditing(true)} variant="outline">
        Change the fruit ({fruit})
      </Button>
    )
  }

  return (
    <Select defaultOpen onOpenChange={(open) => !open && setEditing(false)} onValueChange={setFruit} value={fruit}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="A fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  )
}
