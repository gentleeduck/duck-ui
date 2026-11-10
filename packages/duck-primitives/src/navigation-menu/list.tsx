import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useNavigationMenuContext } from './navigation-menu'
import { FocusGroupContext, useFocusGroup } from './navigation-menu.libs'
import type { INavigationMenu } from './navigation-menu.types'

const LIST_NAME = 'NavigationMenuList'

const NavigationMenuList = React.forwardRef<HTMLUListElement, INavigationMenu.IListProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.IListProps>, forwardedRef) => {
    const { __scopeNavigationMenu, ...listProps } = props
    const context = useNavigationMenuContext(LIST_NAME, __scopeNavigationMenu)
    const focusGroup = useFocusGroup()

    const list = (
      <Primitive.ul
        dir={context.isRootMenu ? context.dir : undefined}
        data-slot="navigation-menu-list"
        data-orientation={context.orientation}
        {...listProps}
        ref={forwardedRef}
      />
    )

    return (
      <Primitive.div
        data-slot="navigation-menu-list-wrapper"
        style={{ position: 'relative' }}
        ref={context.onIndicatorTrackChange}>
        {context.isRootMenu ? <FocusGroupContext.Provider value={focusGroup}>{list}</FocusGroupContext.Provider> : list}
      </Primitive.div>
    )
  },
)

NavigationMenuList.displayName = LIST_NAME

export { NavigationMenuList }
