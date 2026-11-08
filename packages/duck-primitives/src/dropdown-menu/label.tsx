import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuLabel = menuPart<React.ComponentRef<typeof MenuPrimitive.Label>, IDropdownMenu.ILabelProps>(
  MenuPrimitive.Label,
  'DropdownMenuLabel',
)

export { DropdownMenuLabel }
