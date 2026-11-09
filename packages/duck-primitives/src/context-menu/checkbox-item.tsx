import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuCheckboxItem = menuPart<
  React.ComponentRef<typeof MenuPrimitive.CheckboxItem>,
  IContextMenu.ICheckboxItemProps
>(MenuPrimitive.CheckboxItem, 'ContextMenuCheckboxItem')

export { ContextMenuCheckboxItem }
