'use client'

import * as React from 'react'
import { cn } from '@gentleduck/libs/cn'
import { Button } from '../button'
import { Slot } from '@gentleduck/aria-feather/slot'
import { Root, Trigger as PopoverPrimitiveTrigger } from '@gentleduck/aria-feather/popover'
import { AnimDialogVariants, AnimPopoverVariants, AnimVariants } from '@gentleduck/motion/anim'
import { useDialogContext } from '@gentleduck/aria-feather/dialog'

function Popover({ hoverable = false, mode = "dialog", ...props }: React.ComponentPropsWithoutRef<typeof Root>) {
  return <Root {...props} hoverable={hoverable} mode={mode} />
}

function PopoverTrigger({
  onClick,
  open,
  children,
  asChild,
  ...props
}: React.ComponentPropsWithRef<typeof Slot> & {
  open?: boolean
  asChild?: boolean
}): React.JSX.Element {

  return (
    <PopoverPrimitiveTrigger>
      <Button {...props} asChild={asChild}>
        {children}
      </Button>
    </PopoverPrimitiveTrigger>
  )
}

function PopoverContent({
  className,
  children,
  side = "bottom",
  overlay = "nothing",
  ...props
}: React.ComponentProps<'dialog'> & { overlay?: "default" | "nothing" } = { overlay: "nothing" }) {

  const { id, ref } = useDialogContext()

  return (
    <dialog ref={ref}
      style={{ '--position-anchor': `--${id}` } as React.CSSProperties}
      closedby="any" id={id} popover="auto"
      className={cn(AnimVariants({ motionBackdrop: overlay }), AnimDialogVariants(), AnimPopoverVariants({ side: side }), className)}
      {...props}>
      {children}
    </dialog>
  )
}

export {
  Popover, PopoverTrigger, PopoverContent,
}



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
