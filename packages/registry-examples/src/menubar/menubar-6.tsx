'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@gentleduck/registry-ui/menubar'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [modal, setModal] = React.useState(false)
  const [locked, setLocked] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={modal} id="menubar-modal" onCheckedChange={setModal} />
          <Label htmlFor="menubar-modal">Modal</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={locked} id="menubar-locked" onCheckedChange={setLocked} />
          <Label htmlFor="menubar-locked">Lock the bar</Label>
        </div>
      </div>
      <Menubar disabled={locked} modal={modal}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New Tab</MenubarItem>
            <MenubarItem>New Window</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="help">
          <MenubarTrigger disabled>Help</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
      <p className="max-w-64 text-center text-muted-foreground text-sm">
        {modal
          ? 'A click outside closes the menu and goes no further.'
          : 'The page still takes clicks while a menu is open.'}
      </p>
    </div>
  )
}
