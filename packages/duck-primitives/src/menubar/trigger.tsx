import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import * as MenuPrimitive from '../menu'
import { primitiveElement } from '../primitive-elements/primitive-elements'
import { useRovingFocusItem } from '../roving-focus'
import { useMenubarMenuContext } from './menu'
import { useMenubarContext, useMenuScope, useRovingFocusGroupScope } from './menubar'
import type { IMenubar } from './menubar.types'

const TRIGGER_NAME = 'MenubarTrigger'

const MenubarTrigger = React.forwardRef<IMenubar.TriggerElement, IMenubar.ITriggerProps>(
  (props: IMenubar.IScoped<IMenubar.ITriggerProps>, forwardedRef) => {
    const { __scopeMenubar, disabled: disabledProp, asChild, onMouseDown, onFocus, onKeyDown, ...triggerProps } = props
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenubar)
    const menuScope = useMenuScope(__scopeMenubar)
    const context = useMenubarContext(TRIGGER_NAME, __scopeMenubar)
    const menuContext = useMenubarMenuContext(TRIGGER_NAME, __scopeMenubar)
    const composedRefs = useComposedRefs(forwardedRef, menuContext.triggerRef)
    const [isFocused, setIsFocused] = React.useState(false)
    const open = context.value === menuContext.value
    const disabled = disabledProp || context.disabled
    const openKey =
      context.orientation === 'horizontal' ? 'ArrowDown' : context.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const item = useRovingFocusItem(
      {
        ...rovingFocusGroupScope,
        focusable: !disabled,
        tabStopId: menuContext.value,
        onMouseDown,
        onKeyDown: composeEventHandlers(onKeyDown, (event) => {
          if (disabled || !['Enter', ' ', openKey].includes(event.key)) return
          if (event.key === openKey) context.onMenuOpen(menuContext.value)
          else context.onMenuToggle(menuContext.value)
          menuContext.wasKeyboardTriggerOpenRef.current = true
          event.preventDefault()
        }),
        onFocus: composeEventHandlers(onFocus, () => setIsFocused(true)),
      },
      composedRefs,
    )
    const Element = primitiveElement('button', asChild)

    return (
      <MenuPrimitive.Anchor asChild {...menuScope}>
        <Element
          {...item.attributes}
          data-slot="menubar-trigger"
          type="button"
          role="menuitem"
          id={menuContext.triggerId}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuContext.contentId : undefined}
          data-highlighted={isFocused ? '' : undefined}
          data-state={open ? 'open' : 'closed'}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          {...triggerProps}
          {...item.handlers}
          onPointerDown={composeEventHandlers(props.onPointerDown, (event) => {
            if (!disabled && event.button === 0 && event.ctrlKey === false) {
              context.onMenuOpen(menuContext.value)
              if (!open) event.preventDefault()
            }
          })}
          onPointerEnter={composeEventHandlers(props.onPointerEnter, (event) => {
            const menubarOpen = Boolean(context.value)
            if (menubarOpen && !open && !disabled) {
              context.onMenuOpen(menuContext.value)
              event.currentTarget.focus()
            }
          })}
          onBlur={composeEventHandlers(props.onBlur, () => setIsFocused(false))}
        />
      </MenuPrimitive.Anchor>
    )
  },
)

MenubarTrigger.displayName = TRIGGER_NAME

export { MenubarTrigger }
