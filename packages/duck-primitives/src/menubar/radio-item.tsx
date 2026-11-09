import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarRadioItem = menuPart<React.ComponentRef<typeof MenuPrimitive.RadioItem>, IMenubar.IRadioItemProps>(
  MenuPrimitive.RadioItem,
  'MenubarRadioItem',
)

export { MenubarRadioItem }
