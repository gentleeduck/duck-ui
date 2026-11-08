import * as React from 'react'
import { flushSync } from 'react-dom'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { type Primitive, primitiveElement } from '../primitive-elements/primitive-elements'
import { useRovingFocusItem } from '../roving-focus'
import { useMenuContentContext } from './content'
import { useMenuRootContext, useRovingFocusGroupScope } from './menu'
import { SELECTION_KEYS, whenMouse } from './menu.libs'
import type { IMenu } from './menu.types'

const ITEM_NAME = 'MenuItem'
const ITEM_SELECT = 'menu.itemSelect'

type MenuItemImplElement = React.ComponentRef<typeof Primitive.div>
type MenuItemElement = MenuItemImplElement

const MenuItem = React.forwardRef<MenuItemElement, IMenu.IItemProps>(
  (props: IMenu.IScoped<IMenu.IItemProps>, forwardedRef) => {
    const { disabled = false, closeOnSelect = true, onSelect, ...itemProps } = props
    const rootContext = useMenuRootContext(ITEM_NAME, props.__scopeMenu)
    const contentContext = useMenuContentContext(ITEM_NAME, props.__scopeMenu)
    const isPointerDownRef = React.useRef(false)

    const handleSelect = (event: React.MouseEvent<HTMLDivElement>) => {
      const menuItem = event.currentTarget
      // A disabled item rendered as a link would still follow it.
      if (disabled) event.preventDefault()
      else {
        const itemSelectEvent = new CustomEvent(ITEM_SELECT, { bubbles: true, cancelable: true })
        menuItem.addEventListener(ITEM_SELECT, (event) => onSelect?.(event), { once: true })
        flushSync(() => menuItem.dispatchEvent(itemSelectEvent))
        if (itemSelectEvent.defaultPrevented || !closeOnSelect) {
          isPointerDownRef.current = false
        } else {
          rootContext.onClose()
        }
      }
    }

    return useMenuItemImpl(
      {
        ...itemProps,
        disabled,
        onClick: composeEventHandlers(props.onClick, handleSelect),
        onPointerDown: (event) => {
          props.onPointerDown?.(event)
          isPointerDownRef.current = true
        },
        onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
          if (!isPointerDownRef.current) event.currentTarget?.click()
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          // A key typed into a focusable descendant, even one portalled out, still bubbles here through React.
          if (disabled || event.target !== event.currentTarget) return
          if (contentContext.searchRef.current !== '' && event.key === ' ') return
          if (SELECTION_KEYS.includes(event.key)) {
            event.currentTarget.click()
            event.preventDefault()
          }
        }),
      },
      forwardedRef,
    )
  },
)

MenuItem.displayName = ITEM_NAME

// An item renders this rather than a MenuItemImpl, which would cost a fiber per item.
function useMenuItemImpl(
  props: IMenu.IScoped<IMenu.IItemImplProps>,
  forwardedRef: React.Ref<MenuItemImplElement> | undefined,
) {
  const { __scopeMenu, disabled = false, textValue, asChild, onMouseDown, onFocus, onKeyDown, ...itemProps } = props
  const contentContext = useMenuContentContext(ITEM_NAME, __scopeMenu)
  const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu)
  const [isFocused, setIsFocused] = React.useState(false)
  const item = useRovingFocusItem(
    {
      ...rovingFocusGroupScope,
      focusable: !disabled,
      textValue,
      onMouseDown,
      onKeyDown,
      onFocus: composeEventHandlers(onFocus, () => setIsFocused(true)),
    },
    forwardedRef,
  )
  const Element = primitiveElement('div', asChild)

  return (
    <Element
      {...item.attributes}
      data-slot="menu-item"
      role="menuitem"
      data-highlighted={isFocused ? '' : undefined}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? '' : undefined}
      {...itemProps}
      {...item.handlers}
      onPointerMove={composeEventHandlers(
        props.onPointerMove,
        whenMouse((event) => {
          if (disabled) {
            contentContext.onItemLeave(event)
          } else {
            contentContext.onItemEnter(event)
            if (!event.defaultPrevented) {
              const item = event.currentTarget
              item.focus({ preventScroll: true })
            }
          }
        }),
      )}
      onPointerLeave={composeEventHandlers(
        props.onPointerLeave,
        whenMouse((event) => contentContext.onItemLeave(event)),
      )}
      onBlur={composeEventHandlers(props.onBlur, () => setIsFocused(false))}
    />
  )
}

const MenuItemImpl = React.forwardRef<MenuItemImplElement, IMenu.IItemImplProps>(
  (props: IMenu.IScoped<IMenu.IItemImplProps>, forwardedRef) => useMenuItemImpl(props, forwardedRef),
)

MenuItemImpl.displayName = 'MenuItemImpl'

export { MenuItem, MenuItemImpl }
