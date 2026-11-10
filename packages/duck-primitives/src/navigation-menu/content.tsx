import * as React from 'react'
import { DismissableLayer } from '../dismissable-layer'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Presence } from '../presence'
import { useNavigationMenuContext, useNavigationMenuItemContext } from './navigation-menu'
import {
  activeElement,
  FocusGroupContext,
  focusFirst,
  getOpenState,
  getTabbableCandidates,
  getTriggers,
  makeContentId,
  makeTriggerId,
  ROOT_CONTENT_DISMISS,
  useFocusGroup,
  whenMouse,
} from './navigation-menu.libs'
import type { INavigationMenu } from './navigation-menu.types'

const CONTENT_NAME = 'NavigationMenuContent'

const NavigationMenuContent = React.forwardRef<INavigationMenu.ContentImplElement, INavigationMenu.IContentProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.IContentProps>, forwardedRef) => {
    const { forceMount, ...contentProps } = props
    const context = useNavigationMenuContext(CONTENT_NAME, props.__scopeNavigationMenu)
    const itemContext = useNavigationMenuItemContext(CONTENT_NAME, props.__scopeNavigationMenu)
    const composedRefs = useComposedRefs(itemContext.contentRef, forwardedRef)
    const open = itemContext.value === context.value

    const commonProps = {
      'data-state': getOpenState(open),
      value: itemContext.value,
      triggerRef: itemContext.triggerRef,
      focusProxyRef: itemContext.focusProxyRef,
      wasEscapeCloseRef: itemContext.wasEscapeCloseRef,
      onContentFocusOutside: itemContext.onContentFocusOutside,
      onRootContentClose: itemContext.onRootContentClose,
      ...contentProps,
    }

    return !context.viewport ? (
      <Presence present={forceMount || open}>
        <NavigationMenuContentImpl
          {...commonProps}
          ref={composedRefs}
          onPointerEnter={composeEventHandlers(props.onPointerEnter, context.onContentEnter)}
          onPointerLeave={composeEventHandlers(props.onPointerLeave, whenMouse(context.onContentLeave))}
          style={{
            // prevent interaction while animating out
            pointerEvents: !open && context.isRootMenu ? 'none' : undefined,
            ...commonProps.style,
          }}
        />
      </Presence>
    ) : (
      <ViewportContentMounter forceMount={forceMount} {...commonProps} ref={composedRefs} />
    )
  },
)

NavigationMenuContent.displayName = CONTENT_NAME

const ViewportContentMounter = React.forwardRef<
  INavigationMenu.ViewportContentMounterElement,
  INavigationMenu.IViewportContentMounterProps
>((props: INavigationMenu.IScoped<INavigationMenu.IViewportContentMounterProps>, forwardedRef) => {
  const context = useNavigationMenuContext(CONTENT_NAME, props.__scopeNavigationMenu)
  const { onViewportContentChange, onViewportContentRemove } = context

  useLayoutEffect(() => {
    onViewportContentChange(props.value, {
      ref: forwardedRef,
      ...props,
    })
  }, [props, forwardedRef, onViewportContentChange])

  useLayoutEffect(() => {
    return () => onViewportContentRemove(props.value)
  }, [props.value, onViewportContentRemove])

  return null
})

ViewportContentMounter.displayName = 'ViewportContentMounter'

type MotionAttribute = 'to-start' | 'to-end' | 'from-start' | 'from-end'

const NavigationMenuContentImpl = React.forwardRef<
  INavigationMenu.ContentImplElement,
  INavigationMenu.IContentImplProps
>((props: INavigationMenu.IScoped<INavigationMenu.IContentImplProps>, forwardedRef) => {
  const {
    __scopeNavigationMenu,
    value,
    triggerRef,
    focusProxyRef,
    wasEscapeCloseRef,
    onRootContentClose,
    onContentFocusOutside,
    ...contentProps
  } = props
  const context = useNavigationMenuContext(CONTENT_NAME, __scopeNavigationMenu)
  const ref = React.useRef<INavigationMenu.ContentImplElement>(null)
  const composedRefs = useComposedRefs(ref, forwardedRef)
  const triggerId = makeTriggerId(context.baseId, value)
  const contentId = makeContentId(context.baseId, value)
  const focusGroup = useFocusGroup()
  const prevMotionAttributeRef = React.useRef<MotionAttribute | null>(null)

  const { onItemDismiss } = context

  React.useEffect(() => {
    const content = ref.current

    // bubble dismiss to root content, then return focus to its trigger
    if (context.isRootMenu && content) {
      const handleClose = () => {
        onItemDismiss()
        onRootContentClose()
        if (content.contains(document.activeElement)) triggerRef.current?.focus()
      }
      content.addEventListener(ROOT_CONTENT_DISMISS, handleClose)
      return () => content.removeEventListener(ROOT_CONTENT_DISMISS, handleClose)
    }
  }, [context.isRootMenu, triggerRef, onItemDismiss, onRootContentClose])

  const motionAttribute = React.useMemo(() => {
    const values = getTriggers(context.triggers).map((trigger) => trigger.value)
    // Right to left reverses a row on screen, and leaves a column top to bottom.
    if (context.dir === 'rtl' && context.orientation === 'horizontal') values.reverse()
    const index = values.indexOf(context.value)
    const prevIndex = values.indexOf(context.previousValue)
    const isSelected = value === context.value
    const wasSelected = prevIndex === values.indexOf(value)

    // only animate selected and last-selected to avoid interrupting unrelated transitions
    if (!isSelected && !wasSelected) return prevMotionAttributeRef.current

    const attribute = (() => {
      // no direction on initial open or full close (leaving the list entirely)
      if (index !== prevIndex) {
        if (isSelected && prevIndex !== -1) return index > prevIndex ? 'from-end' : 'from-start'
        if (wasSelected && index !== -1) return index > prevIndex ? 'to-start' : 'to-end'
      }
      return null
    })()

    prevMotionAttributeRef.current = attribute
    return attribute
  }, [context.previousValue, context.value, context.dir, context.orientation, context.triggers, value])

  return (
    <FocusGroupContext.Provider value={focusGroup}>
      <DismissableLayer
        dir={context.dir}
        data-slot="navigation-menu-content"
        id={contentId}
        aria-labelledby={triggerId}
        data-motion={motionAttribute}
        data-orientation={context.orientation}
        {...contentProps}
        ref={composedRefs}
        disableOutsidePointerEvents={false}
        onDismiss={() => {
          const rootContentDismissEvent = new Event(ROOT_CONTENT_DISMISS, {
            bubbles: true,
            cancelable: true,
          })
          ref.current?.dispatchEvent(rootContentDismissEvent)
        }}
        onFocusOutside={composeEventHandlers(props.onFocusOutside, (event) => {
          onContentFocusOutside()
          const menu = context.rootNavigationMenu
          // Focus arriving from outside the menu, such as a dialog focusing itself on open, keeps the content open.
          const focusCameFromMenu = menu?.contains(event.detail.originalEvent.relatedTarget as Node | null)
          if (menu?.contains(event.target as Node) || !focusCameFromMenu) event.preventDefault()
        })}
        onPointerDownOutside={composeEventHandlers(props.onPointerDownOutside, (event) => {
          const target = event.target as HTMLElement
          const isTrigger = [...context.triggers].some((trigger) => trigger.ref.current?.contains(target))
          const isRootViewport = context.isRootMenu && context.viewport?.contains(target)
          if (isTrigger || isRootViewport || !context.isRootMenu) event.preventDefault()
        })}
        onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
          const isMetaKey = event.altKey || event.ctrlKey || event.metaKey
          const isTabKey = event.key === 'Tab' && !isMetaKey
          if (isTabKey) {
            const candidates = getTabbableCandidates(event.currentTarget)
            const focused = activeElement(event.currentTarget.ownerDocument)
            const index = candidates.findIndex((candidate) => candidate === focused)
            const isMovingBackwards = event.shiftKey
            const nextCandidates = isMovingBackwards
              ? candidates.slice(0, index).reverse()
              : candidates.slice(index + 1, candidates.length)

            if (focusFirst(nextCandidates)) {
              event.preventDefault()
            } else {
              // at the edge of tabbable candidates: hand off to the proxy so the
              // browser tabs out naturally to the next/prev element after the menu
              focusProxyRef.current?.focus()
            }
          }
        })}
        onEscapeKeyDown={composeEventHandlers(props.onEscapeKeyDown, (_event) => {
          // suppresses pointer-over reopen until pointer leaves the trigger
          wasEscapeCloseRef.current = true
        })}
      />
    </FocusGroupContext.Provider>
  )
})
NavigationMenuContentImpl.displayName = 'NavigationMenuContentImpl'

export { NavigationMenuContent, NavigationMenuContentImpl }
