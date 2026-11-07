import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import * as PopperPrimitive from '../popper'
import { Primitive } from '../primitive-elements'
import { useHoverCardContext, usePopperScope } from './hover-card'
import type { IHoverCard } from './hover-card.types'

const TRIGGER_NAME = 'HoverCardTrigger'

type HoverCardTriggerElement = React.ComponentRef<typeof Primitive.a>

export const HoverCardTrigger = React.forwardRef<HoverCardTriggerElement, IHoverCard.ITriggerProps>(
  (props: IHoverCard.IScoped<IHoverCard.ITriggerProps>, forwardedRef) => {
    const { __scopeHoverCard, ...triggerProps } = props
    const context = useHoverCardContext(TRIGGER_NAME, __scopeHoverCard)
    const popperScope = usePopperScope(__scopeHoverCard)
    // A tap focuses a link after the pointer is up, so the press is remembered until a blur or a cancel.
    const touchedRef = React.useRef(false)
    return (
      <PopperPrimitive.Anchor asChild {...popperScope}>
        <Primitive.a
          data-slot="hover-card-trigger"
          data-state={context.open ? 'open' : 'closed'}
          {...triggerProps}
          ref={forwardedRef}
          onPointerEnter={composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen))}
          onPointerLeave={composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose))}
          onPointerDown={composeEventHandlers(props.onPointerDown, (event) => {
            touchedRef.current = event.pointerType === 'touch'
          })}
          onPointerCancel={composeEventHandlers(props.onPointerCancel, () => {
            touchedRef.current = false
          })}
          onFocus={composeEventHandlers(props.onFocus, () => {
            if (!touchedRef.current) context.onOpen()
          })}
          onBlur={composeEventHandlers(props.onBlur, () => {
            touchedRef.current = false
            context.onClose()
          })}
        />
      </PopperPrimitive.Anchor>
    )
  },
)

HoverCardTrigger.displayName = TRIGGER_NAME

/** Skip handler for touch pointers (touch-and-hold should not trigger hover behavior). */
export function excludeTouch<E>(eventHandler: () => void) {
  return (event: React.PointerEvent<E>) => (event.pointerType === 'touch' ? undefined : eventHandler())
}
