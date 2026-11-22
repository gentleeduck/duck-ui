'use client'

import { useCommandItemContext } from '@gentleduck/primitives/command'
import { Command, CommandInput, CommandItem, CommandList, CommandShortcut } from '@gentleduck/registry-ui/command'
import type * as React from 'react'

function Label({ children }: { children: React.ReactNode }) {
  const { onItemTextChange, textId } = useCommandItemContext('Label', undefined)
  return (
    <span id={textId} ref={onItemTextChange}>
      {children}
    </span>
  )
}

export default function Demo() {
  return (
    <Command className="w-[320px] rounded-lg border">
      <CommandInput placeholder="Search the labels, not the keys..." />
      <CommandList>
        <CommandItem>
          <Label>Copy</Label>
          <CommandShortcut keys="mod+c" />
        </CommandItem>
        <CommandItem>
          <Label>Paste</Label>
          <CommandShortcut keys="mod+v" />
        </CommandItem>
      </CommandList>
    </Command>
  )
}
