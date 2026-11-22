'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { createTooltipPreset } from '@gentleduck/motion/presets/tooltip'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as TooltipPrimitive from '@gentleduck/primitives/tooltip'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { tooltipContentStyle } from './tooltip.constants'

function MotionTooltip({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <TooltipPrimitive.Root {...rootProps} {...rest}>
        {children}
      </TooltipPrimitive.Root>
    </MotionRootContext.Provider>
  )
}
MotionTooltip.displayName = 'MotionTooltip'

const MotionTooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, side = 'top', children, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const preset = React.useMemo(() => createTooltipPreset(side), [side])
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <TooltipPrimitive.Portal forceMount>
        <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} side={side} forceMount asChild {...props}>
          <m.div
            className={cn(tooltipContentStyle, className)}
            initial={preset.initial}
            animate={isOpen ? preset.animate : { ...preset.exit, pointerEvents: 'none' }}
            transition={springBouncy}>
            {children}
          </m.div>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </LazyMotion>
  )
})
MotionTooltipContent.displayName = 'MotionTooltipContent'

export { MotionTooltip, MotionTooltipContent }
