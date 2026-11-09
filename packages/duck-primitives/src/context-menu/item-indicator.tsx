import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuItemIndicator = menuPart<
  React.ComponentRef<typeof MenuPrimitive.ItemIndicator>,
  IContextMenu.IItemIndicatorProps
>(MenuPrimitive.ItemIndicator, 'ContextMenuItemIndicator')

export { ContextMenuItemIndicator }
