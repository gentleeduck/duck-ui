'use client'
// NOTE: @see: https://floating-ui.com/
import PopoverPrimitive from '@gentleduck/aria-feather/popover'
import { cn } from '@gentleduck/libs/cn'
import {
  AnimDialogVariants,
  AnimPopoverArrowVariants,
  AnimPopoverVariants,
  AnimVariants,
} from '@gentleduck/motion/anim'
import * as React from 'react'
import { Button } from '../button'
import { PopoverContentProps } from './popover.types'

const Popover = PopoverPrimitive.Root

function PopoverTrigger({
  children,
  asChild,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> & React.ComponentPropsWithoutRef<typeof Button>) {
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
  ...props
}: PopoverContentProps): React.JSX.Element {
  return (
    <PopoverPrimitive.Content
      className={cn(
        AnimVariants({ overlay }),
        AnimDialogVariants({ animation }),
        AnimPopoverVariants({ side, align }),
        AnimPopoverArrowVariants({ side }),
        className,
      )}
      side={side}
      align={align as never}
      {...props}
      onChange={() => {
        console.log('hi')
      }}>
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
