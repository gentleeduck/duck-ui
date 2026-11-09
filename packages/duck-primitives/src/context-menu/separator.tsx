import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuSeparator = menuPart<React.ComponentRef<typeof MenuPrimitive.Separator>, IContextMenu.ISeparatorProps>(
  MenuPrimitive.Separator,
  'ContextMenuSeparator',
)

export { ContextMenuSeparator }
