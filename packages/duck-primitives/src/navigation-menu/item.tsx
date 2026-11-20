import * as React from 'react'
import { useId } from '../hooks/use-id'
import { Primitive } from '../primitive-elements'
import { NavigationMenuItemContextProvider } from './navigation-menu'
import { focusFirst, getTabbableCandidates, removeFromTabOrder } from './navigation-menu.libs'
import type { INavigationMenu } from './navigation-menu.types'

const ITEM_NAME = 'NavigationMenuItem'

const NavigationMenuItem = React.forwardRef<HTMLLIElement, INavigationMenu.IItemProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.IItemProps>, forwardedRef) => {
    const { __scopeNavigationMenu, value: valueProp, ...itemProps } = props
    const value = useId(valueProp)
    const contentRef = React.useRef<INavigationMenu.ContentImplElement>(null)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const focusProxyRef = React.useRef<HTMLSpanElement>(null)
    const restoreContentTabOrderRef = React.useRef(() => {})
    const wasEscapeCloseRef = React.useRef(false)

    const handleContentEntry = React.useCallback((side = 'start') => {
      if (contentRef.current) {
        restoreContentTabOrderRef.current()
        const candidates = getTabbableCandidates(contentRef.current)
        focusFirst(side === 'start' ? candidates : candidates.reverse())
      }
    }, [])

    const handleContentExit = React.useCallback(() => {
      // biome-ignore lint/style/noNonNullAssertion: only the content calls this, from the layer its own node holds
      const candidates = getTabbableCandidates(contentRef.current!)
      if (candidates.length) restoreContentTabOrderRef.current = removeFromTabOrder(candidates)
    }, [])

    return (
      <NavigationMenuItemContextProvider
        scope={__scopeNavigationMenu}
        value={value}
        triggerRef={triggerRef}
        contentRef={contentRef}
        focusProxyRef={focusProxyRef}
        wasEscapeCloseRef={wasEscapeCloseRef}
        onEntryKeyDown={handleContentEntry}
        onFocusProxyEnter={handleContentEntry}
        onRootContentClose={handleContentExit}
        onContentFocusOutside={handleContentExit}>
        <Primitive.li data-slot="navigation-menu-item" {...itemProps} ref={forwardedRef} />
      </NavigationMenuItemContextProvider>
    )
  },
)

NavigationMenuItem.displayName = ITEM_NAME

export { NavigationMenuItem }
