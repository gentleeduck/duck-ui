'use client'

import { cn } from '@gentleduck/libs/cn'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverClose = PopoverPrimitive.Close
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// PopoverWrapper Component
export interface PopoverWrapperProps {
  wrapper?: React.ComponentPropsWithoutRef<typeof Popover>
  trigger?: React.ComponentPropsWithoutRef<typeof PopoverTrigger>
  content?: React.ComponentPropsWithoutRef<typeof PopoverContent>
}

const PopoverWrapper: React.FC<PopoverWrapperProps> = ({ content, trigger, wrapper }) => {
  const { className: triggerClassName, key: triggerKey, children: triggerChildren, ...triggerProps } = trigger ?? {}
  const { className: contentClassName, key: contentKey, children: contentChildren, ...contentProps } = content ?? {}

  return (
    <Popover {...wrapper}>
      <PopoverTrigger asChild className={cn('', triggerClassName)} {...triggerProps}>
        {triggerChildren}
      </PopoverTrigger>
      <PopoverContent className={cn('w-80', contentClassName)} {...contentProps}>
        {contentChildren}
      </PopoverContent>
    </Popover>
  )
}

PopoverWrapper.displayName = 'PopoverWrapper'

export { Popover, PopoverTrigger, PopoverContent, PopoverWrapper, PopoverClose }
