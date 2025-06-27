'use client'
// NOTE: @see: https://floating-ui.com/
import PopoverPrimitive from '@gentleduck/aria-feather/popover'
import { cn } from '@gentleduck/libs/cn'
import { AnimDialogVariants, AnimPopoverVariants, AnimVariants } from '@gentleduck/motion/anim'
import * as React from 'react'
import { Button } from '../button'
import { PopoverContentProps } from './popover.types'

const Popover = PopoverPrimitive.Root

function PopoverTrigger({
  children,
  asChild,
  ...props
}: React.ComponentPropsWithRef<typeof PopoverPrimitive.Trigger> & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <PopoverPrimitive.Trigger>
      <Button {...props} asChild={asChild}>
        {children}
      </Button>
    </PopoverPrimitive.Trigger>
  )
}

function PopoverContent({
  children,
  className,
  side = 'bottom',
  align = 'center',
  animation = 'default',
  overlay = 'nothing',
  sideOffset = 4,
  ...props
}: PopoverContentProps): React.JSX.Element {
  return (
    <PopoverPrimitive.Content
      className={cn(
        AnimVariants({ overlay }),
        AnimDialogVariants({ animation }),
        AnimPopoverVariants({ side, align }),
        className,
      )}
      side={side}
      align={align}
      {...props}>
      {children}
    </PopoverPrimitive.Content>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
