'use client'

import { useDialogContext } from '@gentleduck/aria-feather/dialog'
import { Trigger as PopoverPrimitiveTrigger, Root } from '@gentleduck/aria-feather/popover'
import { cn } from '@gentleduck/libs/cn'
import { AnimDialogVariants, AnimPopoverVariants, AnimVariants } from '@gentleduck/motion/anim'
import { VariantProps } from '@gentleduck/variants'
import * as React from 'react'
import { Button } from '../button'

function Popover({ hoverable = false, mode = 'dialog', ...props }: React.ComponentPropsWithoutRef<typeof Root>) {
  return <Root {...props} hoverable={hoverable} mode={mode} />
}

function PopoverTrigger({
  onClick,
  open,
  children,
  asChild,
  ...props
}: React.ComponentPropsWithRef<typeof Button> & {
  open?: boolean
}): React.JSX.Element {
  return (
    <PopoverPrimitiveTrigger>
      <Button {...props} asChild={asChild}>
        {children}
      </Button>
    </PopoverPrimitiveTrigger>
  )
}

// TODO: Add the rest of the radix API props.
// TODO: Add the slign and the sides sepretaly.
// TODO: Fix the variants and make it work like radix.
// FIX: When i click on the sec ttrigger in a group of two triggers the click close the opened one
// it should close the other and proceed with click action on the current button i am attempting to
// click.
// FIX: the hooks timing to match each component.
// FIX: the tooltip in general i want it identical (e.g., animation, timing).
// FIX: the hoverCard in general i want it identical (e.g., animation, timing).
function PopoverContent({
  className,
  children,
  side = 'bottom',
  overlay = 'nothing',
  ...props
}: React.ComponentProps<'dialog'> &
  VariantProps<typeof AnimPopoverVariants> & {
    overlay?: 'default' | 'nothing'
    closedby?: string
  }) {
  const { id, ref } = useDialogContext()

  return (
    <dialog
      ref={ref}
      style={{ '--position-anchor': `--${id}` } as React.CSSProperties}
      closedby="any"
      id={id}
      popover="auto"
      className={cn(
        AnimVariants({ motionBackdrop: overlay }),
        AnimDialogVariants(),
        AnimPopoverVariants({ side: side }),
        className,
      )}
      {...props}>
      {children}
    </dialog>
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
