import * as React from 'react'
import * as MenuPrimitive from '../menu'
import { CONTENT_STYLE, useMenuScope } from './menubar'
import type { IMenubar } from './menubar.types'

const SUB_CONTENT_NAME = 'MenubarSubContent'

type MenubarSubContentElement = React.ComponentRef<typeof MenuPrimitive.Content>

const MenubarSubContent = React.forwardRef<MenubarSubContentElement, IMenubar.ISubContentProps>(
  (props: IMenubar.IScoped<IMenubar.ISubContentProps>, forwardedRef) => {
    const { __scopeMenubar, ...subContentProps } = props
    const menuScope = useMenuScope(__scopeMenubar)

    return (
      <MenuPrimitive.SubContent
        {...menuScope}
        data-slot="menubar-content"
        {...subContentProps}
        ref={forwardedRef}
        style={{ ...props.style, ...CONTENT_STYLE }}
      />
    )
  },
)

MenubarSubContent.displayName = SUB_CONTENT_NAME

export { MenubarSubContent }
