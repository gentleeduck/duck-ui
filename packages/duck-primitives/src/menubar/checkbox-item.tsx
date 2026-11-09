import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarCheckboxItem = menuPart<
  React.ComponentRef<typeof MenuPrimitive.CheckboxItem>,
  IMenubar.ICheckboxItemProps
>(MenuPrimitive.CheckboxItem, 'MenubarCheckboxItem')

export { MenubarCheckboxItem }
