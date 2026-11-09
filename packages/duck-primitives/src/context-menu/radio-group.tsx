import type * as React from 'react'
import * as MenuPrimitive from '../menu'
import { menuPart } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const ContextMenuRadioGroup = menuPart<
  React.ComponentRef<typeof MenuPrimitive.RadioGroup>,
  IContextMenu.IRadioGroupProps
>(MenuPrimitive.RadioGroup, 'ContextMenuRadioGroup')

export { ContextMenuRadioGroup }
