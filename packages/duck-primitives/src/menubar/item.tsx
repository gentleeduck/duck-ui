import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarItem = menuPart<React.ComponentRef<typeof MenuPrimitive.Item>, IMenubar.IItemProps>(
  MenuPrimitive.Item,
  'MenubarItem',
)

export { MenubarItem }
