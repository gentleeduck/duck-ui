'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as PopoverPrimitive from '@gentleduck/primitives/popover'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { popoverContentStyle } from './popover.constants'

const CONTENT_OPTIONS = { transition: springBouncy } as const

function MotionPopover({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <PopoverPrimitive.Root {...rootProps} {...rest}>
        {children}
      </PopoverPrimitive.Root>
    </MotionRootContext.Provider>
  )
}
MotionPopover.displayName = 'MotionPopover'

const MotionPopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const content = useMotionPreset(scaleIn, CONTENT_OPTIONS)
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <PopoverPrimitive.Portal forceMount>
        <PopoverPrimitive.Content ref={ref} sideOffset={sideOffset} forceMount asChild {...props}>
          <m.div
            className={cn(popoverContentStyle, className)}
            initial={content.initial}
            animate={isOpen ? content.animate : { ...content.exit, pointerEvents: 'none' }}
            transition={content.transition}>
            {children}
          </m.div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </LazyMotion>
  )
})
MotionPopoverContent.displayName = 'MotionPopoverContent'

export { MotionPopover, MotionPopoverContent }
