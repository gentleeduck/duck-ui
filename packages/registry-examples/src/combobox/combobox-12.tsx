'use client'

import { Combobox, ComboboxItem } from '@gentleduck/registry-ui/combobox'

const toppings = [
  { label: 'Cheese', value: 'cheese' },
  { label: 'Mushroom', value: 'mushroom' },
  { label: 'Olive', value: 'olive' },
]

export default function Demo() {
  return (
    <Combobox commandTriggerPlaceholder="Toppings" defaultValue={['mushroom']} items={toppings} type="multiple">
      {(items) =>
        items.map((item) => (
          <ComboboxItem checked={item.value === 'cheese' ? true : undefined} item={item} key={item.value} />
        ))
      }
    </Combobox>
  )
}
