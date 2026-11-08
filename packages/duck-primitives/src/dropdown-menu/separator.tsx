import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuSeparator = menuPart<
  React.ComponentRef<typeof MenuPrimitive.Separator>,
  IDropdownMenu.ISeparatorProps
>(MenuPrimitive.Separator, 'DropdownMenuSeparator')

export { DropdownMenuSeparator }
