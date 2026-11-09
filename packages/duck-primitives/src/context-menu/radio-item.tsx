import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuRadioItem = menuPart<React.ComponentRef<typeof MenuPrimitive.RadioItem>, IContextMenu.IRadioItemProps>(
  MenuPrimitive.RadioItem,
  'ContextMenuRadioItem',
)

export { ContextMenuRadioItem }
