'use client'

import type { Root } from '@gentleduck/aria-feather/dialog'
import { cn } from '@gentleduck/libs/cn'
import { type AnimPopoverVariants, AnimTooltipVariants } from '@gentleduck/motion/anim'
import type { VariantProps } from '@gentleduck/variants'
import type * as React from 'react'
import type { DialogContentProps } from '../dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/_popover'

function Tooltip({ hoverable = true, popover = true, ...props }: React.ComponentPropsWithoutRef<typeof Root>) {
  return <Popover {...props} hoverable={hoverable} popover={popover} />
}

const TooltipTrigger = PopoverTrigger

function TooltipContent({
  className,
  children,
  side = 'top',
  ...props
}: DialogContentProps & VariantProps<typeof AnimPopoverVariants>): React.JSX.Element {
  return (
    <PopoverContent side={side} role="tooltip" className={cn(AnimTooltipVariants(), className)} {...props}>
      {children}
    </PopoverContent>
  )
}

// function PopoverAnchor({
//   ...props
// }: React.ComponentProps<'dialog'>) {
//   return <dialog {...props} />
// }

export { Tooltip, TooltipTrigger, TooltipContent }

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

// export { Popover, PopoverTrigger, PopoverContent, PopoverWrapper, PopoverClose }
