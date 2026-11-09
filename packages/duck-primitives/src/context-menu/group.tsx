import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuGroup = menuPart<React.ComponentRef<typeof MenuPrimitive.Group>, IContextMenu.IGroupProps>(
  MenuPrimitive.Group,
  'ContextMenuGroup',
)

export { ContextMenuGroup }
