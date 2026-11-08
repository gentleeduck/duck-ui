import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuItem = menuPart<React.ComponentRef<typeof MenuPrimitive.Item>, IDropdownMenu.IItemProps>(
  MenuPrimitive.Item,
  'DropdownMenuItem',
)

export { DropdownMenuItem }
