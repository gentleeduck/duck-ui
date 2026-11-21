'use client'

import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const [log, setLog] = React.useState<string[]>([])
  const record = (menu: string) => (open: boolean) =>
    setLog((entries) => [`${menu} ${open ? 'opened' : 'closed'}`, ...entries].slice(0, 3))

  return (
    <div className="flex flex-col items-center gap-3">
      <Menubar defaultValue="" loop={false}>
        <MenubarMenu onOpenChange={record('File')} value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarLabel>Recent</MenubarLabel>
              <MenubarItem>notes.md</MenubarItem>
              <MenubarItem>todo.md</MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarItem>Close window</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu onOpenChange={record('Help')} value="help">
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Documentation</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="text-muted-foreground text-sm">
        {log.join(', ') || 'loop off stops the arrow keys at either end of the bar.'}
      </p>
    </div>
  )
}
