'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import { Slot } from '@gentleduck/primitives/slot'
import type { Variants } from '@gentleduck/variants'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'
import { Separator } from '../separator'
import { buttonGroupVariants } from './button-group.constants'

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & Variants.VariantProps<typeof buttonGroupVariants>
>(({ className, orientation = 'horizontal', dir, ...props }, ref) => {
  const direction = useDirection(toDirection(dir))
  return (
    // biome-ignore lint/a11y/useSemanticElements: group role is semantically correct for button groups
    <div
      className={cn(buttonGroupVariants({ orientation }), className)}
      data-orientation={orientation}
      data-slot="button-group"
      dir={direction}
      ref={ref}
      role="group"
      {...props}
    />
  )
})
ButtonGroup.displayName = 'ButtonGroup'

const ButtonGroupText = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    asChild?: boolean
  }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      className={cn(
        "flex items-center gap-2 rounded-md border bg-muted px-4 font-medium text-sm shadow-xs [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ButtonGroupText.displayName = 'ButtonGroupText'

const ButtonGroupSeparator = React.forwardRef<
  React.ComponentRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, orientation = 'vertical', ...props }, ref) => {
  return (
    <Separator
      className={cn('relative m-0! self-stretch bg-input data-[orientation=vertical]:h-auto', className)}
      orientation={orientation}
      ref={ref}
      {...props}
    />
  )
})
ButtonGroupSeparator.displayName = 'ButtonGroupSeparator'

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }
