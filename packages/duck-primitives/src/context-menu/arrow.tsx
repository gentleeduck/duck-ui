import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuArrow = menuPart<React.ComponentRef<typeof MenuPrimitive.Arrow>, IContextMenu.IArrowProps>(
  MenuPrimitive.Arrow,
  'ContextMenuArrow',
)

export { ContextMenuArrow }
