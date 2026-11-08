import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuCheckboxItem = menuPart<
  React.ComponentRef<typeof MenuPrimitive.CheckboxItem>,
  IDropdownMenu.ICheckboxItemProps
>(MenuPrimitive.CheckboxItem, 'DropdownMenuCheckboxItem')

export { DropdownMenuCheckboxItem }
