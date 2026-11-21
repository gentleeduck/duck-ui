'use client'

import { Combobox, ComboboxItem } from '@gentleduck/registry-ui/combobox'
import * as React from 'react'

const sizes = [
  { label: 'Small', value: 's' },
  { label: 'Medium', value: 'm' },
  { label: 'Large', value: 'l' },
]

export default function Demo() {
  const [value, setValue] = React.useState('m')
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-3">
      <Combobox
        command={{ loop: true }}
        commandTriggerPlaceholder="Pick a size"
        items={sizes}
        onValueChange={setValue}
        popover={{ onOpenChange: setOpen, open }}
        showSelected={false}
        value={value}
        withSearch={false}>
        {(items) => items.map((item) => <ComboboxItem item={item} key={item.value} />)}
      </Combobox>
      <p className="text-muted-foreground text-sm">
        No search box for three items, the trigger keeps its placeholder, and the popover is {open ? 'open' : 'closed'}.
        Picked: {value || 'nothing'}.
      </p>
    </div>
  )
}
