import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuGroup = menuPart<React.ComponentRef<typeof MenuPrimitive.Group>, IDropdownMenu.IGroupProps>(
  MenuPrimitive.Group,
  'DropdownMenuGroup',
)

export { DropdownMenuGroup }
