'use client'

import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { Primitive } from '../primitive-elements'
import { usePopoverContext } from './popover'
import type { IPopover } from './popover.types'

const CLOSE_NAME = 'PopoverClose'

export const PopoverClose = React.forwardRef<
  React.ComponentRef<typeof Primitive.button>,
  IPopover.IScoped<IPopover.ICloseProps>
>((props, forwardedRef) => {
  const { __scopePopover, ...closeProps } = props
  const context = usePopoverContext(CLOSE_NAME, __scopePopover)

  return (
    <Primitive.button
      data-slot="popover-close"
      type="button"
      {...closeProps}
      ref={forwardedRef}
      onClick={composeEventHandlers(closeProps.onClick, () => context.onOpenChange(false))}
    />
  )
})

PopoverClose.displayName = CLOSE_NAME
