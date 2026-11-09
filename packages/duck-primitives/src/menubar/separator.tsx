import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarSeparator = menuPart<React.ComponentRef<typeof MenuPrimitive.Separator>, IMenubar.ISeparatorProps>(
  MenuPrimitive.Separator,
  'MenubarSeparator',
)

export { MenubarSeparator }
