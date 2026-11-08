import type * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import * as MenuPrimitive from '../menu'
import { useMenuScope } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const SUB_NAME = 'DropdownMenuSub'

const DropdownMenuSub: React.FC<IDropdownMenu.ISubProps> = (props: IDropdownMenu.IScoped<IDropdownMenu.ISubProps>) => {
  const { __scopeDropdownMenu, open: openProp, defaultOpen, onOpenChange, ...subProps } = props
  const menuScope = useMenuScope(__scopeDropdownMenu)
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: SUB_NAME,
  })

  return <MenuPrimitive.Sub {...menuScope} {...subProps} open={open} onOpenChange={setOpen} />
}

DropdownMenuSub.displayName = SUB_NAME

export { DropdownMenuSub }
