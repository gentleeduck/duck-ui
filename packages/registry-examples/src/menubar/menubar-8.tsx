'use client'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'

export default function Demo() {
  return (
    <Menubar>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent align="center" alignOffset={0} side="bottom" sideOffset={12}>
          <MenubarItem>Centered under its trigger, 12px down</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Panels</MenubarSubTrigger>
            <MenubarSubContent alignOffset={-4} sideOffset={6}>
              <MenubarItem>Explorer</MenubarItem>
              <MenubarItem>Terminal</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
