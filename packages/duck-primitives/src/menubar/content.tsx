import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import * as MenuPrimitive from '../menu'
import { getFocusableItems } from '../roving-focus'
import { useMenubarMenuContext } from './menu'
import { CONTENT_STYLE, useMenubarContext, useMenuScope } from './menubar'
import type { IMenubar } from './menubar.types'

const CONTENT_NAME = 'MenubarContent'

type MenubarContentElement = React.ComponentRef<typeof MenuPrimitive.Content>

const MenubarContent = React.forwardRef<MenubarContentElement, IMenubar.IContentProps>(
  (props: IMenubar.IScoped<IMenubar.IContentProps>, forwardedRef) => {
    const context = useMenubarContext(CONTENT_NAME, props.__scopeMenubar)
    const {
      __scopeMenubar,
      align = 'start',
      side = context.orientation === 'horizontal' ? 'bottom' : 'right',
      ...contentProps
    } = props
    const menuScope = useMenuScope(__scopeMenubar)
    const menuContext = useMenubarMenuContext(CONTENT_NAME, __scopeMenubar)
    const hasInteractedOutsideRef = React.useRef(false)

    return (
      <MenuPrimitive.Content
        id={menuContext.contentId}
        aria-labelledby={menuContext.triggerId}
        data-slot="menubar-content"
        {...menuScope}
        {...contentProps}
        ref={forwardedRef}
        align={align}
        side={side}
        onCloseAutoFocus={composeEventHandlers(props.onCloseAutoFocus, (event) => {
          const menubarOpen = Boolean(context.value)
          if (!menubarOpen && !hasInteractedOutsideRef.current) {
            menuContext.triggerRef.current?.focus()
          }

          hasInteractedOutsideRef.current = false
          event.preventDefault()
        })}
        onFocusOutside={composeEventHandlers(props.onFocusOutside, (event) => {
          const target = event.target as HTMLElement
          const isMenubarTrigger = [...context.items].some((item) => item.ref.current?.contains(target))
          if (isMenubarTrigger) event.preventDefault()
        })}
        onInteractOutside={composeEventHandlers(props.onInteractOutside, () => {
          hasInteractedOutsideRef.current = true
        })}
        onEntryFocus={(event) => {
          if (!menuContext.wasKeyboardTriggerOpenRef.current) event.preventDefault()
        }}
        onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
          // A key typed into a field inside an item is the field's.
          if (!(event.target as HTMLElement).getAttribute('role')?.startsWith('menu')) return
          const horizontal = context.orientation === 'horizontal'
          const values = getFocusableItems(context.items).map(({ item }) => item.id)
          if (horizontal && context.dir === 'rtl') values.reverse()
          const after = (list: string[]) => {
            const index = list.indexOf(menuContext.value)
            return context.loop ? list[(index + 1) % list.length] : list[index + 1]
          }
          // An empty value closes the menu: a vertical bar's menu opens beside it, so the arrow back closes it.
          const keys: Record<string, string | undefined> = horizontal
            ? { ArrowLeft: after([...values].reverse()), ArrowRight: after(values) }
            : { [context.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft']: '' }
          const shifted = event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey
          const value = (shifted ? { ...keys, A: values[values.length - 1], I: values[0] } : keys)[event.key]
          if (value === undefined) return
          event.preventDefault()
          if (value) context.onMenuOpen(value)
          else context.onMenuClose()
        })}
        style={{ ...props.style, ...CONTENT_STYLE }}
      />
    )
  },
)

MenubarContent.displayName = CONTENT_NAME

export { MenubarContent }
