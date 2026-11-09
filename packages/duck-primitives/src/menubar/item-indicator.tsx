import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarItemIndicator = menuPart<
  React.ComponentRef<typeof MenuPrimitive.ItemIndicator>,
  IMenubar.IItemIndicatorProps
>(MenuPrimitive.ItemIndicator, 'MenubarItemIndicator')

export { MenubarItemIndicator }
