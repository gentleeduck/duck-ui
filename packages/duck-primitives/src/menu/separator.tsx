import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { IMenu } from './menu.types'

const SEPARATOR_NAME = 'MenuSeparator'

type MenuSeparatorElement = React.ComponentRef<typeof Primitive.div>

const MenuSeparator = React.forwardRef<MenuSeparatorElement, IMenu.ISeparatorProps>(
  (props: IMenu.IScoped<IMenu.ISeparatorProps>, forwardedRef) => {
    const { __scopeMenu, ...separatorProps } = props
    return (
      <Primitive.div
        data-slot="menu-separator"
        role="separator"
        aria-orientation="horizontal"
        {...separatorProps}
        ref={forwardedRef}
      />
    )
  },
)

MenuSeparator.displayName = SEPARATOR_NAME

export { MenuSeparator }
