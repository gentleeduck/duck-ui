import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { IMenu } from './menu.types'

const GROUP_NAME = 'MenuGroup'

type MenuGroupElement = React.ComponentRef<typeof Primitive.div>

const MenuGroup = React.forwardRef<MenuGroupElement, IMenu.IGroupProps>(
  (props: IMenu.IScoped<IMenu.IGroupProps>, forwardedRef) => {
    const { __scopeMenu, ...groupProps } = props
    return <Primitive.div data-slot="menu-group" role="group" {...groupProps} ref={forwardedRef} />
  },
)

MenuGroup.displayName = GROUP_NAME

export { MenuGroup }
