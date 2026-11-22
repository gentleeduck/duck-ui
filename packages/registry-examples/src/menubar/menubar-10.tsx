'use client'

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div
      className="dark flex flex-col items-center gap-4 rounded-md border bg-background p-4 text-foreground"
      ref={panel}>
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent container={panel}>
            <MenubarItem>New tab</MenubarItem>
            <MenubarItem>New window</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="text-muted-foreground text-sm">The menu portals into this dark panel.</p>
    </div>
  )
}
