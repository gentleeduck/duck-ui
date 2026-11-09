import * as React from 'react'
import * as MenuPrimitive from '../menu'
import { useContextMenuContext, useMenuScope } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const CONTENT_NAME = 'ContextMenuContent'

export const POPPER_VARIABLES = {
  '--gentleduck-context-menu-content-transform-origin': 'var(--gentleduck-popper-transform-origin)',
  '--gentleduck-context-menu-content-available-width': 'var(--gentleduck-popper-available-width)',
  '--gentleduck-context-menu-content-available-height': 'var(--gentleduck-popper-available-height)',
  '--gentleduck-context-menu-trigger-width': 'var(--gentleduck-popper-anchor-width)',
  '--gentleduck-context-menu-trigger-height': 'var(--gentleduck-popper-anchor-height)',
} as React.CSSProperties

type ContextMenuContentElement = React.ComponentRef<typeof MenuPrimitive.Content>

const ContextMenuContent = React.forwardRef<ContextMenuContentElement, IContextMenu.IContentProps>(
  (props: IContextMenu.IScoped<IContextMenu.IContentProps>, forwardedRef) => {
    const { __scopeContextMenu, ...contentProps } = props
    const context = useContextMenuContext(CONTENT_NAME, __scopeContextMenu)
    const menuScope = useMenuScope(__scopeContextMenu)
    const hasInteractedOutsideRef = React.useRef(false)

    // Kept mounted, the content outlives its close and hears the page while closed, so each opening starts clean.
    React.useEffect(() => {
      if (context.open) hasInteractedOutsideRef.current = false
    }, [context.open])

    return (
      <MenuPrimitive.Content
        {...menuScope}
        {...contentProps}
        ref={forwardedRef}
        side="right"
        sideOffset={2}
        align="start"
        onCloseAutoFocus={(event) => {
          props.onCloseAutoFocus?.(event)
          if (hasInteractedOutsideRef.current) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          props.onInteractOutside?.(event)
          if (event.defaultPrevented) return
          if (!context.modal) hasInteractedOutsideRef.current = true
          const press = event.detail.originalEvent
          if (!('button' in press) || !(press.button === 2 || press.ctrlKey)) return
          // A modal menu leaves the page no pointer events, so only the layer sees a press that lands on the trigger.
          // The contextmenu after it clears the mark wherever it goes, or the next press does where none follows.
          const closes = context.rightClickClosesRef
          closes.current = true
          const clear = () => {
            closes.current = false
            window.removeEventListener('contextmenu', clear)
            window.removeEventListener('pointerdown', clear, true)
          }
          window.addEventListener('contextmenu', clear, { once: true })
          window.addEventListener('pointerdown', clear, { capture: true, once: true })
        }}
        style={{ ...props.style, ...POPPER_VARIABLES }}
      />
    )
  },
)

ContextMenuContent.displayName = CONTENT_NAME

export { ContextMenuContent }
