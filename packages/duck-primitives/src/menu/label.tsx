import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { IMenu } from './menu.types'

const LABEL_NAME = 'MenuLabel'

type MenuLabelElement = React.ComponentRef<typeof Primitive.div>

const MenuLabel = React.forwardRef<MenuLabelElement, IMenu.ILabelProps>(
  (props: IMenu.IScoped<IMenu.ILabelProps>, forwardedRef) => {
    const { __scopeMenu, ...labelProps } = props
    return <Primitive.div data-slot="menu-label" {...labelProps} ref={forwardedRef} />
  },
)

MenuLabel.displayName = LABEL_NAME

export { MenuLabel }
