import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import * as VisuallyHiddenPrimitive from '../visibility-hidden'
import { useNavigationMenuContext, useNavigationMenuItemContext } from './navigation-menu'
import { getOpenState, makeContentId, makeTriggerId, useFocusGroupItem, whenMouse } from './navigation-menu.libs'
import type { INavigationMenu } from './navigation-menu.types'

const TRIGGER_NAME = 'NavigationMenuTrigger'

const NavigationMenuTrigger = React.forwardRef<INavigationMenu.TriggerElement, INavigationMenu.ITriggerProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.ITriggerProps>, forwardedRef) => {
    const { __scopeNavigationMenu, disabled, onKeyDown, ...triggerProps } = props
    const context = useNavigationMenuContext(TRIGGER_NAME, props.__scopeNavigationMenu)
    const itemContext = useNavigationMenuItemContext(TRIGGER_NAME, props.__scopeNavigationMenu)
    const ref = React.useRef<INavigationMenu.TriggerElement>(null)
    const composedRefs = useComposedRefs(ref, itemContext.triggerRef, forwardedRef)
    const triggerId = makeTriggerId(context.baseId, itemContext.value)
    const contentId = makeContentId(context.baseId, itemContext.value)
    const hasPointerMoveOpenedRef = React.useRef(false)
    const wasClickCloseRef = React.useRef(false)
    const open = itemContext.value === context.value
    const focusGroupItem = useFocusGroupItem(
      __scopeNavigationMenu,
      composeEventHandlers(onKeyDown, (event) => {
        const verticalEntryKey = context.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        const entryKey = { horizontal: 'ArrowDown', vertical: verticalEntryKey }[context.orientation]
        if (open && event.key === entryKey) {
          itemContext.onEntryKeyDown()
          // Keeps the focus group from moving on to the next trigger.
          event.preventDefault()
        }
      }),
      composedRefs,
    )

    const { triggers } = context
    const { value, triggerRef } = itemContext
    useLayoutEffect(() => {
      const trigger = { value, ref: triggerRef }
      triggers.add(trigger)
      return () => void triggers.delete(trigger)
    }, [triggers, value, triggerRef])

    return (
      <>
        <Primitive.button
          data-slot="navigation-menu-trigger"
          id={triggerId}
          disabled={disabled}
          data-disabled={disabled ? '' : undefined}
          data-state={getOpenState(open)}
          aria-expanded={open}
          aria-controls={open ? contentId : undefined}
          {...triggerProps}
          {...focusGroupItem}
          onPointerEnter={composeEventHandlers(props.onPointerEnter, () => {
            wasClickCloseRef.current = false
            itemContext.wasEscapeCloseRef.current = false
          })}
          onPointerMove={composeEventHandlers(
            props.onPointerMove,
            whenMouse(() => {
              if (
                disabled ||
                wasClickCloseRef.current ||
                itemContext.wasEscapeCloseRef.current ||
                hasPointerMoveOpenedRef.current
              )
                return
              context.onTriggerEnter(itemContext.value)
              hasPointerMoveOpenedRef.current = true
            }),
          )}
          onPointerLeave={composeEventHandlers(
            props.onPointerLeave,
            whenMouse(() => {
              if (disabled) return
              context.onTriggerLeave()
              hasPointerMoveOpenedRef.current = false
            }),
          )}
          onClick={composeEventHandlers(props.onClick, () => {
            context.onItemSelect(itemContext.value)
            wasClickCloseRef.current = open
          })}
        />

        {/* Proxy tab order between trigger and content */}
        {open && (
          <>
            <VisuallyHiddenPrimitive.Root
              aria-hidden
              tabIndex={0}
              ref={itemContext.focusProxyRef}
              onFocus={(event) => {
                const content = itemContext.contentRef.current
                const prevFocusedElement = event.relatedTarget as HTMLElement | null
                const wasTriggerFocused = prevFocusedElement === ref.current
                const wasFocusFromContent = content?.contains(prevFocusedElement)

                if (wasTriggerFocused || !wasFocusFromContent) {
                  itemContext.onFocusProxyEnter(wasTriggerFocused ? 'start' : 'end')
                }
              }}
            />

            {/* Restructure a11y tree to make content accessible to screen reader when using the viewport */}
            {context.viewport && <span aria-owns={contentId} />}
          </>
        )}
      </>
    )
  },
)

NavigationMenuTrigger.displayName = TRIGGER_NAME

export { NavigationMenuTrigger }
