import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarLabel = menuPart<React.ComponentRef<typeof MenuPrimitive.Label>, IMenubar.ILabelProps>(
  MenuPrimitive.Label,
  'MenubarLabel',
)

export { MenubarLabel }
