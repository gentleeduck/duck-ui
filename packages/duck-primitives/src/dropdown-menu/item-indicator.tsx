import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuItemIndicator = menuPart<
  React.ComponentRef<typeof MenuPrimitive.ItemIndicator>,
  IDropdownMenu.IItemIndicatorProps
>(MenuPrimitive.ItemIndicator, 'DropdownMenuItemIndicator')

export { DropdownMenuItemIndicator }
