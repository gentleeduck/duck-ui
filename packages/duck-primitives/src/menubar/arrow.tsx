import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarArrow = menuPart<React.ComponentRef<typeof MenuPrimitive.Arrow>, IMenubar.IArrowProps>(
  MenuPrimitive.Arrow,
  'MenubarArrow',
)

export { MenubarArrow }
