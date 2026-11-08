import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const DropdownMenuRadioGroup = menuPart<
  React.ComponentRef<typeof MenuPrimitive.RadioGroup>,
  IDropdownMenu.IRadioGroupProps
>(MenuPrimitive.RadioGroup, 'DropdownMenuRadioGroup')

export { DropdownMenuRadioGroup }
