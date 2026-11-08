import * as React from 'react'
import { Presence } from '../presence'
import { Primitive } from '../primitive-elements'
import { useItemIndicatorContext } from './checkbox-item'
import { getCheckedState, isIndeterminate } from './menu.libs'
import type { IMenu } from './menu.types'

const ITEM_INDICATOR_NAME = 'MenuItemIndicator'

type MenuItemIndicatorElement = React.ComponentRef<typeof Primitive.span>

const MenuItemIndicator = React.forwardRef<MenuItemIndicatorElement, IMenu.IItemIndicatorProps>(
  (props: IMenu.IScoped<IMenu.IItemIndicatorProps>, forwardedRef) => {
    const { __scopeMenu, forceMount, ...itemIndicatorProps } = props
    const indicatorContext = useItemIndicatorContext(ITEM_INDICATOR_NAME, __scopeMenu)
    return (
      <Presence present={forceMount || isIndeterminate(indicatorContext.checked) || indicatorContext.checked === true}>
        <Primitive.span
          data-slot="menu-item-indicator"
          {...itemIndicatorProps}
          ref={forwardedRef}
          data-state={getCheckedState(indicatorContext.checked)}
        />
      </Presence>
    )
  },
)

MenuItemIndicator.displayName = ITEM_INDICATOR_NAME

export { MenuItemIndicator }
