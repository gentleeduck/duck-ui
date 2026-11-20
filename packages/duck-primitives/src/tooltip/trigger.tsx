import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { joinIds } from '../libs/join-ids'
import { Primitive } from '../primitive-elements'
import { useTooltipProviderContext } from './provider'
import { useTooltipContext } from './tooltip'
import { lastInput, watchInput } from './tooltip.libs'
import type { ITooltip } from './tooltip.types'

const TRIGGER_NAME = 'TooltipTrigger'

type TooltipTriggerElement = React.ComponentRef<typeof Primitive.button>

export const TooltipTrigger = React.forwardRef<TooltipTriggerElement, ITooltip.ITriggerProps>(
  (props: ITooltip.IScoped<ITooltip.ITriggerProps>, forwardedRef) => {
    const { __scopeTooltip, disableCloseOnClick = false, 'aria-describedby': ariaDescribedby, ...triggerProps } = props
    const context = useTooltipContext(TRIGGER_NAME, __scopeTooltip)
    const providerContext = useTooltipProviderContext(TRIGGER_NAME, __scopeTooltip)
    const ref = React.useRef<TooltipTriggerElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onTriggerChange)
    const hasPointerMoveOpenedRef = React.useRef(false)

    React.useEffect(() => {
      if (ref.current) watchInput(ref.current.ownerDocument)
    }, [])

    return (
      <Primitive.button
        // Left out rather than undefined, which an asChild child spreading its props last would take over its own.
        {...(disableCloseOnClick
          ? { 'data-tooltip-state': context.stateAttribute }
          : { 'data-slot': 'tooltip-trigger', 'data-state': context.stateAttribute })}
        // We purposefully avoid adding `type=button` here because tooltip triggers are also
        // commonly anchors and the anchor `type` attribute signifies MIME type.
        aria-describedby={context.open ? joinIds(ariaDescribedby, context.contentId) : ariaDescribedby}
        {...triggerProps}
        ref={composedRefs}
        onPointerMove={composeEventHandlers(props.onPointerMove, (event) => {
          // A move over a trigger nested in another is the inner one's, which is heard first.
          if (event.pointerType === 'touch' || claimedMoves.has(event.nativeEvent)) return
          claimedMoves.add(event.nativeEvent)
          if (!hasPointerMoveOpenedRef.current && !providerContext.isPointerInTransitRef.current) {
            hasPointerMoveOpenedRef.current = context.onTriggerEnter()
          }
        })}
        onPointerLeave={composeEventHandlers(props.onPointerLeave, (event) => {
          context.onTriggerLeave()
          context.triggerGraceRef.current?.(event)
          hasPointerMoveOpenedRef.current = false
        })}
        // A press closes the tooltip, and drops one still waiting out its delay.
        onPointerDown={composeEventHandlers(props.onPointerDown, () => {
          if (!disableCloseOnClick) context.onClose()
        })}
        onFocus={composeEventHandlers(props.onFocus, (event) => {
          // A menu item picked with the pointer hands focus back focus-visible, and a dialog closed with the pointer
          // hands it back with no input since its button took focus, so each check catches what the other misses.
          if (!lastInput.pointer && event.currentTarget.matches(':focus-visible')) context.onOpen()
        })}
        onBlur={composeEventHandlers(props.onBlur, context.onClose)}
        onClick={disableCloseOnClick ? props.onClick : composeEventHandlers(props.onClick, context.onClose)}
      />
    )
  },
)

TooltipTrigger.displayName = TRIGGER_NAME

const claimedMoves = new WeakSet<Event>()
