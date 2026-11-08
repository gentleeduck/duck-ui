import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Presence } from '../presence'
import { MenuContentImpl } from './content'
import { useMenuContext, useMenuRootContext } from './menu'
import { isTextEntry, SUB_CLOSE_KEYS } from './menu.libs'
import type { IMenu } from './menu.types'
import { usePortalContext } from './portal'
import { useMenuSubContext } from './sub'

const CONTENT_NAME = 'MenuContent'
const SUB_CONTENT_NAME = 'MenuSubContent'

type MenuSubContentElement = IMenu.ContentElement

const MenuSubContent = React.forwardRef<MenuSubContentElement, IMenu.ISubContentProps>(
  (props: IMenu.IScoped<IMenu.ISubContentProps>, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeMenu)
    const { forceMount = portalContext.forceMount, ...subContentProps } = props
    const context = useMenuContext(CONTENT_NAME, props.__scopeMenu)
    const rootContext = useMenuRootContext(CONTENT_NAME, props.__scopeMenu)
    const subContext = useMenuSubContext(SUB_CONTENT_NAME, props.__scopeMenu)
    const ref = React.useRef<MenuSubContentElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref, subContext.onContentChange)
    return (
      <Presence present={forceMount || context.open}>
        <MenuContentImpl
          id={subContext.contentId}
          aria-labelledby={subContext.triggerId}
          {...subContentProps}
          ref={composedRefs}
          align="start"
          side="right"
          disableOutsidePointerEvents={false}
          disableOutsideScroll={false}
          trapFocus={false}
          onOpenAutoFocus={(event) => {
            if (rootContext.isUsingKeyboardRef.current) ref.current?.focus()
            event.preventDefault()
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onFocusOutside={composeEventHandlers(props.onFocusOutside, (event) => {
            if (event.target !== subContext.trigger) context.onOpenChange(false)
          })}
          onEscapeKeyDown={composeEventHandlers(props.onEscapeKeyDown, (event) => {
            if (subContext.closeParentOnEsc) {
              rootContext.onClose()
            } else {
              context.onOpenChange(false)
              subContext.trigger?.focus()
            }
            event.preventDefault()
          })}
          onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
            const isKeyDownInside = event.currentTarget.contains(event.target as HTMLElement)
            const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(event.key)
            if (isKeyDownInside && isCloseKey && !isTextEntry(event.target)) {
              context.onOpenChange(false)
              subContext.trigger?.focus()
              event.preventDefault()
            }
          })}
        />
      </Presence>
    )
  },
)

MenuSubContent.displayName = SUB_CONTENT_NAME

export { MenuSubContent }
