'use client'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const [menu, setMenu] = React.useState('')
  const [wrap, setWrap] = React.useState(true)
  const [last, setLast] = React.useState('nothing yet')

  return (
    <div className="flex flex-col items-center gap-3">
      <Menubar onValueChange={setMenu} value={menu}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => setLast('save')}>
              Save
              <MenubarShortcut keys="mod+s" onKeysPressed={() => setLast('save, from its keys')} />
            </MenubarItem>
            <MenubarItem onSelect={() => setLast('export')}>
              Export
              <MenubarShortcut keys="mod+shift+e" onKeysPressed={() => setLast('export, from its keys')} />
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={wrap} closeOnSelect={false} onCheckedChange={setWrap}>
              Word wrap
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem onSelect={() => setMenu('file')}>Go to the File menu</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="text-muted-foreground text-sm">
        Open: {menu || 'none'}, wrap {wrap ? 'on' : 'off'}, last: {last}
      </p>
    </div>
  )
}
