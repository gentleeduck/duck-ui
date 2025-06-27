'use client'

import { cn } from '@gentleduck/libs/cn'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'

function HoverCard({
  hoverable = true,
  skipDelayDuration = 0,
  delayDuration = 500,
  ...props
}: React.ComponentPropsWithRef<typeof Popover>) {
  return (
    <Popover hoverable={hoverable} skipDelayDuration={skipDelayDuration} delayDuration={delayDuration} {...props} />
  )
}

const HoverCardTrigger = PopoverTrigger

function HoverCardContent({
  className,
  children,
  side = 'top',
  ...props
}: React.ComponentPropsWithRef<typeof PopoverContent>): React.JSX.Element {
  return (
    <PopoverContent side={side as never} role="tooltip" className={cn('max-w-[20rem]', className)} {...props}>
      {children}
    </PopoverContent>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
