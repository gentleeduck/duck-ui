'use client'

import { cn } from '@gentleduck/libs/cn'
import { AnimTooltipVariants } from '@gentleduck/motion/anim'
import type * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'

function Tooltip({
  hoverable = true,
  skipDelayDuration = 0,
  delayDuration = 300,
  ...props
}: React.ComponentPropsWithRef<typeof Popover>) {
  return (
    <Popover hoverable={hoverable} skipDelayDuration={skipDelayDuration} delayDuration={delayDuration} {...props} />
  )
}

const TooltipTrigger = PopoverTrigger

function TooltipContent({
  className,
  children,
  side = 'top',
  ...props
}: React.ComponentPropsWithRef<typeof PopoverContent>): React.JSX.Element {
  return (
    <PopoverContent side={side as never} role="tooltip" className={cn(AnimTooltipVariants(), className)} {...props}>
      {children}
    </PopoverContent>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent }
