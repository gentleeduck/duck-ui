'use client'

import PopoverPrimitive, { PopoverContentProps, usePopoverContext } from '@gentleduck/aria-feather/popover'
import { cn } from '@gentleduck/libs/cn'
import { AnimPopoverVariants } from '@gentleduck/motion/anim'
import type { VariantProps } from '@gentleduck/variants'
import * as React from 'react'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

function PopoverContent({
  children,
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'default',
  ...props
}: PopoverContentProps &
  VariantProps<typeof AnimPopoverVariants> & {
    sideOffset: number | string
  }): React.JSX.Element {
  const { id } = usePopoverContext()
  return (
    <PopoverPrimitive.Content className={cn(AnimPopoverVariants({ side: side, align: align }), className)} {...props}>
      {children}
    </PopoverPrimitive.Content>
  )
}

export { Popover, PopoverTrigger, PopoverContent }

// PopoverWrapper Component
// export interface PopoverWrapperProps {
//   wrapper?: React.ComponentPropsWithoutRef<typeof Popover>
//   trigger?: React.ComponentPropsWithoutRef<typeof PopoverTrigger>
//   content?: React.ComponentPropsWithoutRef<typeof PopoverContent>
// }

// const PopoverWrapper: React.FC<PopoverWrapperProps> = ({ content, trigger, wrapper }) => {
//   const { className: triggerClassName, key: triggerKey, children: triggerChildren, ...triggerProps } = trigger ?? {}
//   const { className: contentClassName, key: contentKey, children: contentChildren, ...contentProps } = content ?? {}

//   return (
//     <Popover {...wrapper}>
//       <PopoverTrigger asChild className={cn('', triggerClassName)} {...triggerProps}>
//         {triggerChildren}
//       </PopoverTrigger>
//       <PopoverContent className={cn('w-80', contentClassName)} {...contentProps}>
//         {contentChildren}
//       </PopoverContent>
//     </Popover>
//   )
// }

// PopoverWrapper.displayName = 'PopoverWrapper'

// export { Popover, PopoverTrigger, PopoverContent, PopoverWrapper, PopoverClose }
