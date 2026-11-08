import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuArrow = menuPart<React.ComponentRef<typeof MenuPrimitive.Arrow>, IDropdownMenu.IArrowProps>(
  MenuPrimitive.Arrow,
  'DropdownMenuArrow',
)

export { DropdownMenuArrow }
