'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

export default function Demo() {
  const [ran, setRan] = React.useState('nothing yet')

  return (
    <div className="flex w-80 flex-col gap-2">
      <Command className="h-fit border pt-0" defaultValue="paste" disablePointerSelection loop vimBindings={false}>
        <CommandInput placeholder="Try history or clipboard..." />
        <CommandList>
          <CommandEmpty>No action found.</CommandEmpty>
          <CommandGroup forceMount heading="Pinned">
            <CommandItem keywords={['history', 'back']} onSelect={setRan} value="undo">
              Undo
              <CommandShortcut keys="mod+shift+u" onKeysPressed={() => setRan('undo, from its shortcut')}>
                ⇧⌘U
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Edit">
            <CommandItem keywords={['clipboard']} onSelect={setRan} value="copy">
              Copy
            </CommandItem>
            <CommandItem keywords={['clipboard']} onSelect={setRan} value="paste">
              Paste
            </CommandItem>
            <CommandItem keywords={['clipboard']} onSelect={setRan} value="cut">
              Cut
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <p className="text-muted-foreground text-sm">Ran: {ran}</p>
    </div>
  )
}
