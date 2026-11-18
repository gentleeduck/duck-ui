'use client'

import { Combobox, ComboboxGroup, ComboboxItem } from '@gentleduck/registry-ui/combobox'
import { PlusCircle } from 'lucide-react'

const statuses = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Todo', value: 'todo' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Done', value: 'done' },
  { label: 'Canceled', value: 'canceled' },
]

export default function Demo() {
  return (
    <Combobox
      commandInput={{ placeholder: 'Status' }}
      commandTriggerPlaceholder=""
      defaultValue={['todo', 'in-progress']}
      items={statuses}
      popoverContent={{ className: 'w-50' }}
      popoverTrigger={{
        children: (
          <>
            <PlusCircle aria-hidden="true" />
            Status
          </>
        ),
        size: 'sm',
      }}
      type="multiple">
      {(items) => (
        <ComboboxGroup heading="Status">
          {items.map((item) => (
            <ComboboxItem item={item} key={item.value} />
          ))}
        </ComboboxGroup>
      )}
    </Combobox>
  )
}
