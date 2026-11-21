'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'

export default function Demo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open over a tinted backdrop</Button>
      </DrawerTrigger>
      <DrawerContent overlayProps={{ className: 'bg-primary/30 backdrop-blur-sm' }}>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>overlayProps styles the backdrop behind the drawer.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
