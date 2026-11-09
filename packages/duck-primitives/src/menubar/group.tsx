import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarGroup = menuPart<React.ComponentRef<typeof MenuPrimitive.Group>, IMenubar.IGroupProps>(
  MenuPrimitive.Group,
  'MenubarGroup',
)

export { MenubarGroup }
