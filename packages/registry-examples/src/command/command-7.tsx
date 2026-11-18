'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStatus,
  fuzzyFilter,
} from '@gentleduck/registry-ui/command'

const DISHES = [
  'Apple pie',
  'Applesauce',
  'Banana bread',
  'Café au lait',
  'Carrot cake',
  'Crème brûlée',
  'Green apple sorbet',
  'Pineapple upside-down cake',
  'Tarte Tatin',
]

export default function Demo() {
  return (
    <Command className="h-fit w-80 border pt-0" filter={fuzzyFilter} limit={4}>
      <CommandInput placeholder="Try apl, creme or cafe..." />
      <CommandList>
        <CommandEmpty>No dish found.</CommandEmpty>
        {DISHES.map((dish) => (
          <CommandItem key={dish} value={dish}>
            {dish}
          </CommandItem>
        ))}
      </CommandList>
      <CommandStatus className="not-sr-only border-t px-3 py-2 text-muted-foreground text-xs">
        {(count) => `${count} shown, the best four at most`}
      </CommandStatus>
    </Command>
  )
}
