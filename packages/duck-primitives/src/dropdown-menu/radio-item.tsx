import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuRadioItem = menuPart<
  React.ComponentRef<typeof MenuPrimitive.RadioItem>,
  IDropdownMenu.IRadioItemProps
>(MenuPrimitive.RadioItem, 'DropdownMenuRadioItem')

export { DropdownMenuRadioItem }
