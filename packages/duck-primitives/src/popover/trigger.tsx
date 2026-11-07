import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { getState } from '../libs/get-state'
import * as PopperPrimitive from '../popper'
import { Primitive } from '../primitive-elements'
import { usePopoverContext, usePopperScope } from './popover'
import type { IPopover } from './popover.types'

const TRIGGER_NAME = 'PopoverTrigger'

/** Toggles open state; auto-wraps in a PopperAnchor unless a custom anchor is provided. */
export const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof Primitive.button>,
  IPopover.IScoped<IPopover.ITriggerProps>
>((props, forwardedRef) => {
  const { __scopePopover, ...triggerProps } = props
  const context = usePopoverContext(TRIGGER_NAME, __scopePopover)
  const popperScope = usePopperScope(__scopePopover)
  const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef)

  const trigger = (
    <Primitive.button
      data-slot="popover-trigger"
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.open}
      aria-controls={context.open ? context.contentId : undefined}
      data-state={getState(context.open)}
      {...triggerProps}
      ref={composedTriggerRef}
      onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
    />
  )

  return context.hasCustomAnchor ? (
    trigger
  ) : (
    <PopperPrimitive.PopperAnchor asChild {...popperScope}>
      {trigger}
    </PopperPrimitive.PopperAnchor>
  )
})

PopoverTrigger.displayName = TRIGGER_NAME
