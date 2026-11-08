import * as React from 'react'
import * as MenuPrimitive from '../menu'
import { POPPER_VARIABLES } from './content'
import { useMenuScope } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const SUB_CONTENT_NAME = 'DropdownMenuSubContent'

type DropdownMenuSubContentElement = React.ComponentRef<typeof MenuPrimitive.Content>

const DropdownMenuSubContent = React.forwardRef<DropdownMenuSubContentElement, IDropdownMenu.ISubContentProps>(
  (props: IDropdownMenu.IScoped<IDropdownMenu.ISubContentProps>, forwardedRef) => {
    const { __scopeDropdownMenu, ...subContentProps } = props
    const menuScope = useMenuScope(__scopeDropdownMenu)

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

DropdownMenuSubContent.displayName = SUB_CONTENT_NAME

export { DropdownMenuSubContent }
