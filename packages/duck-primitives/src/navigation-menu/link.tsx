import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { Primitive } from '../primitive-elements'
import { LINK_SELECT, ROOT_CONTENT_DISMISS, useFocusGroupItem } from './navigation-menu.libs'
import type { INavigationMenu } from './navigation-menu.types'

const LINK_NAME = 'NavigationMenuLink'

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, INavigationMenu.ILinkProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.ILinkProps>, forwardedRef) => {
    const { __scopeNavigationMenu, active, onSelect, closeOnSelect = true, onKeyDown, ...linkProps } = props
    const focusGroupItem = useFocusGroupItem(__scopeNavigationMenu, onKeyDown, forwardedRef)

    return (
      <Primitive.a
        data-slot="navigation-menu-link"
        data-active={active ? '' : undefined}
        aria-current={active ? 'page' : undefined}
        {...linkProps}
        {...focusGroupItem}
        // biome-ignore lint/a11y/useValidAnchor: navigation-menu link is a primitive that composes anchor semantics  -  consumers provide href
        onClick={composeEventHandlers(
          props.onClick,
          (event) => {
            const target = event.target as HTMLElement
            const linkSelectEvent = new CustomEvent(LINK_SELECT, { cancelable: true })
            target.addEventListener(LINK_SELECT, (event) => onSelect?.(event), { once: true })
            target.dispatchEvent(linkSelectEvent)

            // A held key opens the link in another tab or window, or downloads it, so the page stays and the menu with it.
            const opensElsewhere = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
            if (closeOnSelect && !linkSelectEvent.defaultPrevented && !opensElsewhere) {
              const rootContentDismissEvent = new CustomEvent(ROOT_CONTENT_DISMISS, {
                bubbles: true,
                cancelable: true,
              })
              target.dispatchEvent(rootContentDismissEvent)
            }
          },
          { checkForDefaultPrevented: false },
        )}
      />
    )
  },
)

NavigationMenuLink.displayName = LINK_NAME

export { NavigationMenuLink }
