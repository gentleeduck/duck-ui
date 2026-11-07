'use client'

import { cn } from '@gentleduck/libs/cn'
import type { IPopover } from '@gentleduck/primitives/popover'
import * as PopoverPrimitive from '@gentleduck/primitives/popover'
import * as React from 'react'
import { popoverContentStyle } from './popover.constants'

const Popover = PopoverPrimitive.Root
Popover.displayName = 'Popover'

const PopoverTrigger: typeof PopoverPrimitive.Trigger = PopoverPrimitive.Trigger
PopoverTrigger.displayName = 'PopoverTrigger'

const PopoverAnchor: typeof PopoverPrimitive.Anchor = PopoverPrimitive.Anchor
PopoverAnchor.displayName = 'PopoverAnchor'

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal forceMount={props.forceMount}>
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=open]:animate-in',
        'animation-duration-200 data-[state=closed]:animation-duration-150 ease-(--gentleduck-motion-ease)',
        popoverContentStyle,
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

const PopoverArrow = React.forwardRef<SVGSVGElement, IPopover.IArrowProps>((props, ref) => (
  <PopoverPrimitive.Arrow ref={ref} asChild width={14} height={7} {...props} overflow="visible">
    <g>
      {/* Fill before the outline, so the 1px line sits on the curve like the content border. */}
      <path d="M 0,-2 L 30,-2 L 30,0 C 24,0 16.5,10 15,10 C 13.5,10 6,0 0,0 Z" fill="var(--popover)" />
      {/* non-scaling-stroke keeps it 1px under the uneven 30x10 to 14x7 scale. */}
      <path
        d="M 0,0 C 6,0 13.5,10 15,10 C 16.5,10 24,0 30,0"
        fill="none"
        stroke="var(--popover-border-color)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  </PopoverPrimitive.Arrow>
))
PopoverArrow.displayName = 'PopoverArrow'

const PopoverTitle = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Title>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Title ref={ref} className={cn('font-medium leading-none', className)} {...props} />
))
PopoverTitle.displayName = 'PopoverTitle'

const PopoverDescription = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Description>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Description ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />
))
PopoverDescription.displayName = 'PopoverDescription'

const PopoverClose: typeof PopoverPrimitive.Close = PopoverPrimitive.Close
PopoverClose.displayName = 'PopoverClose'

export {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
}
