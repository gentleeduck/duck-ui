import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuLabel = menuPart<React.ComponentRef<typeof MenuPrimitive.Label>, IContextMenu.ILabelProps>(
  MenuPrimitive.Label,
  'ContextMenuLabel',
)

export { ContextMenuLabel }
