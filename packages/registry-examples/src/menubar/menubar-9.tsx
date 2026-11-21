'use client'

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@gentleduck/registry-ui/menubar'

export default function Demo() {
  return (
    <Menubar>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent className="data-[state=closed]:hidden" forceMount>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
