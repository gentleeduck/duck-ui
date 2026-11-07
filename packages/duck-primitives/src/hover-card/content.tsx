import * as React from 'react'
import { useDirection } from '../direction'
import { DismissableLayer } from '../dismissable-layer'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import * as PopperPrimitive from '../popper'
import { Presence } from '../presence'
import { useHoverCardContext, usePopperScope } from './hover-card'
import type { IHoverCard } from './hover-card.types'
import { usePortalContext } from './portal'
import { excludeTouch } from './trigger'

const CONTENT_NAME = 'HoverCardContent'

const POPPER_VARIABLES = {
  '--gentleduck-hover-card-content-transform-origin': 'var(--gentleduck-popper-transform-origin)',
  '--gentleduck-hover-card-content-available-width': 'var(--gentleduck-popper-available-width)',
  '--gentleduck-hover-card-content-available-height': 'var(--gentleduck-popper-available-height)',
  '--gentleduck-hover-card-trigger-width': 'var(--gentleduck-popper-anchor-width)',
  '--gentleduck-hover-card-trigger-height': 'var(--gentleduck-popper-anchor-height)',
} as React.CSSProperties

type HoverCardContentImplElement = React.ComponentRef<typeof PopperPrimitive.Content>

export const HoverCardContent = React.forwardRef<HoverCardContentImplElement, IHoverCard.IContentProps>(
  (props: IHoverCard.IScoped<IHoverCard.IContentProps>, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeHoverCard)
    const { forceMount = portalContext.forceMount, ...contentProps } = props
    const context = useHoverCardContext(CONTENT_NAME, props.__scopeHoverCard)
    return (
      <Presence present={forceMount || context.open}>
        <HoverCardContentImpl
          data-state={context.open ? 'open' : 'closed'}
          {...contentProps}
          onPointerEnter={composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen))}
          onPointerLeave={composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose))}
          ref={forwardedRef}
        />
      </Presence>
    )
  },
)

HoverCardContent.displayName = CONTENT_NAME

const HoverCardContentImpl = React.forwardRef<HoverCardContentImplElement, IHoverCard.IContentImplProps>(
  (props: IHoverCard.IScoped<IHoverCard.IContentImplProps>, forwardedRef) => {
    const {
      __scopeHoverCard,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      ...contentProps
    } = props
    const context = useHoverCardContext(CONTENT_NAME, __scopeHoverCard)
    const popperScope = usePopperScope(__scopeHoverCard)
    const ref = React.useRef<HoverCardContentImplElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)
    const [press, setPress] = React.useState<{ document: Document; inside: boolean } | null>(null)
    const direction = useDirection(context.dir)
    const { hasSelectionRef, isPointerDownOnContentRef } = context

    React.useEffect(() => {
      if (!press) return
      const { style } = press.document.body
      const userSelect = style.userSelect || style.webkitUserSelect
      if (press.inside) {
        style.userSelect = 'none'
        style.webkitUserSelect = 'none'
      }

      const handleRelease = () => {
        setPress(null)
        isPointerDownOnContentRef.current = false
        // A press inside the selection clears it only once the release is done.
        setTimeout(() => {
          if (press.document.getSelection()?.toString()) hasSelectionRef.current = true
        })
      }

      press.document.addEventListener('pointerup', handleRelease)
      press.document.addEventListener('pointercancel', handleRelease)
      return () => {
        press.document.removeEventListener('pointerup', handleRelease)
        press.document.removeEventListener('pointercancel', handleRelease)
        if (press.inside) {
          style.userSelect = userSelect
          style.webkitUserSelect = userSelect
        }
      }
    }, [press, hasSelectionRef, isPointerDownOnContentRef])

    React.useEffect(
      () => () => {
        hasSelectionRef.current = false
        isPointerDownOnContentRef.current = false
      },
      [hasSelectionRef, isPointerDownOnContentRef],
    )

    React.useEffect(() => {
      const content = ref.current
      if (!content) return
      const removeFromTabOrder = () => {
        for (const node of content.querySelectorAll<HTMLElement | SVGElement>('*')) {
          if (node.tabIndex >= 0) node.setAttribute('tabindex', '-1')
        }
      }
      removeFromTabOrder()
      // A child can render on its own after the card opens, as a profile that loads does.
      const observer = new MutationObserver(removeFromTabOrder)
      observer.observe(content, { attributeFilter: ['tabindex'], childList: true, subtree: true })
      return () => observer.disconnect()
    })

    return (
      <DismissableLayer
        asChild
        disableOutsidePointerEvents={false}
        onInteractOutside={onInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        onFocusOutside={composeEventHandlers(onFocusOutside, (event) => {
          event.preventDefault()
        })}
        onDismiss={context.onDismiss}>
        <PopperPrimitive.Content
          data-slot="hover-card-content"
          dir={direction}
          {...popperScope}
          {...contentProps}
          onPointerDown={composeEventHandlers(contentProps.onPointerDown, (event) => {
            const { currentTarget } = event
            setPress({ document: currentTarget.ownerDocument, inside: currentTarget.contains(event.target as Node) })
            hasSelectionRef.current = false
            isPointerDownOnContentRef.current = true
          })}
          ref={composedRefs}
          style={{
            ...contentProps.style,
            userSelect: press?.inside ? 'text' : undefined,
            WebkitUserSelect: press?.inside ? 'text' : undefined,
            ...POPPER_VARIABLES,
          }}
        />
      </DismissableLayer>
    )
  },
)

HoverCardContentImpl.displayName = 'HoverCardContentImpl'
