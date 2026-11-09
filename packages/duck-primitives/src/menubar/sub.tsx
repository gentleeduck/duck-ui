import type * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import * as MenuPrimitive from '../menu'
import { useMenuScope } from './menubar'
import type { IMenubar } from './menubar.types'

const SUB_NAME = 'MenubarSub'

const MenubarSub: React.FC<IMenubar.ISubProps> = (props: IMenubar.IScoped<IMenubar.ISubProps>) => {
  const { __scopeMenubar, open: openProp, defaultOpen, onOpenChange, ...subProps } = props
  const menuScope = useMenuScope(__scopeMenubar)
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: SUB_NAME,
  })

  return <MenuPrimitive.Sub {...menuScope} {...subProps} open={open} onOpenChange={setOpen} />
}

MenubarSub.displayName = SUB_NAME

export { MenubarSub }
