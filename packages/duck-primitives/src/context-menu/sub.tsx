import type * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import * as MenuPrimitive from '../menu'
import { useMenuScope } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const SUB_NAME = 'ContextMenuSub'

const ContextMenuSub: React.FC<IContextMenu.ISubProps> = (props: IContextMenu.IScoped<IContextMenu.ISubProps>) => {
  const { __scopeContextMenu, open: openProp, defaultOpen, onOpenChange, ...subProps } = props
  const menuScope = useMenuScope(__scopeContextMenu)
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: SUB_NAME,
  })

  return <MenuPrimitive.Sub {...menuScope} {...subProps} open={open} onOpenChange={setOpen} />
}

ContextMenuSub.displayName = SUB_NAME

export { ContextMenuSub }
