import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import * as MenuPrimitive from '../menu'
import { Primitive } from '../primitive-elements'
import { useDropdownMenuContext, useMenuScope } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const TRIGGER_NAME = 'DropdownMenuTrigger'

type DropdownMenuTriggerElement = React.ComponentRef<typeof Primitive.button>

const DropdownMenuTrigger = React.forwardRef<DropdownMenuTriggerElement, IDropdownMenu.ITriggerProps>(
  (props: IDropdownMenu.IScoped<IDropdownMenu.ITriggerProps>, forwardedRef) => {
    const { __scopeDropdownMenu, disabled = false, ...triggerProps } = props
    const context = useDropdownMenuContext(TRIGGER_NAME, __scopeDropdownMenu)
    const menuScope = useMenuScope(__scopeDropdownMenu)
    const composedRefs = useComposedRefs(forwardedRef, context.triggerRef)
    return (
      <MenuPrimitive.Anchor asChild {...menuScope}>
        <Primitive.button
          data-slot="dropdown-menu-trigger"
          type="button"
          id={context.triggerId}
          aria-haspopup="menu"
          aria-expanded={context.open}
          aria-controls={context.open ? context.contentId : undefined}
          data-state={context.open ? 'open' : 'closed'}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          {...triggerProps}
          ref={composedRefs}
          onPointerDown={composeEventHandlers(props.onPointerDown, (event) => {
            if (!disabled && event.button === 0 && event.ctrlKey === false) {
              context.onOpenToggle()
              if (!context.open) event.preventDefault()
            }
          })}
          onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
            if (disabled) return
            if (['Enter', ' '].includes(event.key)) context.onOpenToggle()
            if (event.key === 'ArrowDown') context.onOpenChange(true)
            if (['Enter', ' ', 'ArrowDown'].includes(event.key)) event.preventDefault()
          })}
        />
      </MenuPrimitive.Anchor>
    )
  },
)

DropdownMenuTrigger.displayName = TRIGGER_NAME

export { DropdownMenuTrigger }
