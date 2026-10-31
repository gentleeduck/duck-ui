'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Menu } from 'lucide-react'

export default function Demo() {
  return (
    <Drawer shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:ring-2 data-[state=open]:ring-ring">
          <Menu className="me-2 h-4 w-4" />
          Open drawer
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer</DrawerTitle>
          <DrawerDescription>The trigger stays active while the drawer is open.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}
