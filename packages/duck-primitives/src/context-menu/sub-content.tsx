import * as React from 'react'
import * as MenuPrimitive from '../menu'
import { POPPER_VARIABLES } from './content'
import { useMenuScope } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const SUB_CONTENT_NAME = 'ContextMenuSubContent'

type ContextMenuSubContentElement = React.ComponentRef<typeof MenuPrimitive.Content>

const ContextMenuSubContent = React.forwardRef<ContextMenuSubContentElement, IContextMenu.ISubContentProps>(
  (props: IContextMenu.IScoped<IContextMenu.ISubContentProps>, forwardedRef) => {
    const { __scopeContextMenu, ...subContentProps } = props
    const menuScope = useMenuScope(__scopeContextMenu)

    return (
      <MenuPrimitive.SubContent
        {...menuScope}
        {...subContentProps}
        ref={forwardedRef}
        style={{ ...props.style, ...POPPER_VARIABLES }}
      />
    )
  },
)

ContextMenuSubContent.displayName = SUB_CONTENT_NAME

export { ContextMenuSubContent }
