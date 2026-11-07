'use client'

import { cn } from '@gentleduck/libs/cn'
import * as TooltipPrimitive from '@gentleduck/primitives/tooltip'
import * as React from 'react'
import { tooltipContentStyle } from './tooltip.constants'

const TooltipProvider = TooltipPrimitive.Provider
TooltipProvider.displayName = 'TooltipProvider'

const Tooltip = TooltipPrimitive.Root
Tooltip.displayName = 'Tooltip'

const TooltipTrigger = TooltipPrimitive.Trigger
TooltipTrigger.displayName = 'TooltipTrigger'

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal forceMount={props.forceMount}>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 animate-in data-[state=closed]:animate-out',
        'animation-duration-200 data-[state=closed]:animation-duration-150 ease-(--gentleduck-motion-ease)',
        tooltipContentStyle,
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

const TooltipArrow = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, style, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    asChild
    width={14}
    height={7}
    className={cn(className)}
    {...props}
    overflow="visible"
    style={style}>
    <g>
      {/* Fill before the outline, so the 1px line sits on the curve like the content border. */}
      <path d="M 0,-2 L 30,-2 L 30,0 C 24,0 16.5,10 15,10 C 13.5,10 6,0 0,0 Z" fill="var(--popover)" />
      {/* non-scaling-stroke keeps it 1px under the uneven 30x10 to 14x7 scale. */}
      <path
        d="M 0,0 C 6,0 13.5,10 15,10 C 16.5,10 24,0 30,0"
        fill="none"
        stroke="var(--tooltip-border-color)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  </TooltipPrimitive.Arrow>
))
TooltipArrow.displayName = 'TooltipArrow'

export { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger }
