'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { createTooltipPreset } from '@gentleduck/motion/presets/tooltip'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as HoverCardPrimitive from '@gentleduck/primitives/hover-card'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { hoverCardContentStyle } from './hover-card.constants'

export const HoverCardPlacementContext = React.createContext<'top' | 'right' | 'bottom' | 'left' | undefined>('top')

function MotionHoverCard({
  placement = 'top',
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentProps<typeof HoverCardPrimitive.Root> & { placement?: 'top' | 'right' | 'bottom' | 'left' }) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })

  return (
    <MotionRootContext.Provider value={contextValue}>
      <HoverCardPlacementContext.Provider value={placement}>
        <HoverCardPrimitive.Root {...rootProps} {...rest} />
      </HoverCardPlacementContext.Provider>
    </MotionRootContext.Provider>
  )
}
MotionHoverCard.displayName = 'MotionHoverCard'

const MotionHoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, children, side, align = 'center', sideOffset = 4, ...props }, ref) => {
  const defaultSide = React.useContext(HoverCardPlacementContext)
  const { isOpen } = useMotionContent()
  const resolvedSide = side ?? defaultSide ?? 'top'
  const preset = React.useMemo(() => createTooltipPreset(resolvedSide, 6), [resolvedSide])
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <HoverCardPrimitive.Portal forceMount>
        <HoverCardPrimitive.Content
          ref={ref}
          align={align}
          side={resolvedSide}
          sideOffset={sideOffset}
          forceMount
          asChild
          {...props}>
          <m.div
            className={cn(hoverCardContentStyle, className)}
            data-slot="hover-card-content"
            initial={preset.initial}
            animate={isOpen ? preset.animate : { ...preset.exit, pointerEvents: 'none' }}
            transition={springBouncy}>
            {children}
          </m.div>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal>
    </LazyMotion>
  )
})
MotionHoverCardContent.displayName = 'MotionHoverCardContent'

export { MotionHoverCard, MotionHoverCardContent }
