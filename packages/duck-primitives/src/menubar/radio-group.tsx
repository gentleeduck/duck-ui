import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './menubar'
import type { IMenubar } from './menubar.types'

const MenubarRadioGroup = menuPart<React.ComponentRef<typeof MenuPrimitive.RadioGroup>, IMenubar.IRadioGroupProps>(
  MenuPrimitive.RadioGroup,
  'MenubarRadioGroup',
)

export { MenubarRadioGroup }
