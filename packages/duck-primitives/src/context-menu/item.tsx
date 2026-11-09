import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuItem = menuPart<React.ComponentRef<typeof MenuPrimitive.Item>, IContextMenu.IItemProps>(
  MenuPrimitive.Item,
  'ContextMenuItem',
)

export { ContextMenuItem }
