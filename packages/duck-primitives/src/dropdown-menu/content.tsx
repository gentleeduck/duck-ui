import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import * as MenuPrimitive from '../menu'
import { useDropdownMenuContext, useMenuScope } from './dropdown-menu'
import type { IDropdownMenu } from './dropdown-menu.types'

const CONTENT_NAME = 'DropdownMenuContent'

export const POPPER_VARIABLES = {
  '--gentleduck-dropdown-menu-content-transform-origin': 'var(--gentleduck-popper-transform-origin)',
  '--gentleduck-dropdown-menu-content-available-width': 'var(--gentleduck-popper-available-width)',
  '--gentleduck-dropdown-menu-content-available-height': 'var(--gentleduck-popper-available-height)',
  '--gentleduck-dropdown-menu-trigger-width': 'var(--gentleduck-popper-anchor-width)',
  '--gentleduck-dropdown-menu-trigger-height': 'var(--gentleduck-popper-anchor-height)',
} as React.CSSProperties

type DropdownMenuContentElement = React.ComponentRef<typeof MenuPrimitive.Content>

const DropdownMenuContent = React.forwardRef<DropdownMenuContentElement, IDropdownMenu.IContentProps>(
  (props: IDropdownMenu.IScoped<IDropdownMenu.IContentProps>, forwardedRef) => {
    const { __scopeDropdownMenu, ...contentProps } = props
    const context = useDropdownMenuContext(CONTENT_NAME, __scopeDropdownMenu)
    const menuScope = useMenuScope(__scopeDropdownMenu)
    const hasInteractedOutsideRef = React.useRef(false)

    return (
      <MenuPrimitive.Content
        id={context.contentId}
        aria-labelledby={context.triggerId}
        {...menuScope}
        {...contentProps}
        ref={forwardedRef}
        onCloseAutoFocus={composeEventHandlers(props.onCloseAutoFocus, (event) => {
          if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus()
          hasInteractedOutsideRef.current = false
          event.preventDefault()
        })}
        onInteractOutside={composeEventHandlers(props.onInteractOutside, (event) => {
          const originalEvent = event.detail.originalEvent as PointerEvent
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick
          if (!context.modal || isRightClick) hasInteractedOutsideRef.current = true
        })}
        style={{ ...props.style, ...POPPER_VARIABLES }}
      />
    )
  },
)

DropdownMenuContent.displayName = CONTENT_NAME

export { DropdownMenuContent }
