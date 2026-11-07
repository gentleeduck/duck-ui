'use client'

import { cn } from '@gentleduck/libs/cn'
import * as HoverCardPrimitive from '@gentleduck/primitives/hover-card'
import type { Variants } from '@gentleduck/variants'
import * as React from 'react'
import { buttonVariants } from '../button'
import { hoverCardContentStyle } from './hover-card.constants'

const HoverCard = HoverCardPrimitive.Root
HoverCard.displayName = 'HoverCard'

const HoverCardTrigger = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger> & Variants.VariantProps<typeof buttonVariants>
>(({ children, className, variant = 'outline', size = 'default', border = 'default', ...props }, ref) => {
  return (
    <HoverCardPrimitive.Trigger
      ref={ref}
      className={cn(buttonVariants({ variant, size, border }), className)}
      data-slot="hover-card-trigger"
      {...props}>
      {children}
    </HoverCardPrimitive.Trigger>
  )
})
HoverCardTrigger.displayName = HoverCardPrimitive.Trigger.displayName

const HoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, children, side = 'top', align = 'center', sideOffset = 4, ...props }, ref) => {
  return (
    <HoverCardPrimitive.Portal forceMount={props.forceMount}>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=open]:animate-in',
          'animation-duration-200 data-[state=closed]:animation-duration-150 ease-(--gentleduck-motion-ease)',
          hoverCardContentStyle,
          className,
        )}
        data-slot="hover-card-content"
        side={side}
        sideOffset={sideOffset}
        {...props}>
        {children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  )
})
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

const HoverCardArrow = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Arrow>
>(({ className, style, ...props }, ref) => (
  <HoverCardPrimitive.Arrow
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
        stroke="var(--hover-card-border-color)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  </HoverCardPrimitive.Arrow>
))
HoverCardArrow.displayName = 'HoverCardArrow'

export { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger }
