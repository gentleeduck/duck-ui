'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import type { DirectionalSide } from '@gentleduck/motion/presets/_utils'
import { fadeIn } from '@gentleduck/motion/presets/fade-in'
import { createSlideEdge } from '@gentleduck/motion/presets/slide-edge'
import { tweenSlow } from '@gentleduck/motion/transitions/tweens'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as SheetPrimitive from '@gentleduck/primitives/sheet'
import { X } from 'lucide-react'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import type { ISheetContentProps } from './sheet'
import { SheetPortal } from './sheet'

const OVERLAY_OPTIONS = {} as const

function MotionSheet({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <SheetPrimitive.Root {...rootProps} {...rest}>
        {children}
      </SheetPrimitive.Root>
    </MotionRootContext.Provider>
  )
}
MotionSheet.displayName = 'MotionSheet'

const MotionSheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  ISheetContentProps & { closeText?: string; hideClose?: boolean }
>(({ side = 'right', className, children, closeText = 'Close', hideClose = false, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const overlay = useMotionPreset(fadeIn, OVERLAY_OPTIONS)
  const resolvedSide = (Array.isArray(side) ? side[0] : (side ?? 'right')) as DirectionalSide
  const slide = React.useMemo(() => createSlideEdge(resolvedSide), [resolvedSide])
  const shouldRender = useMotionMount(isOpen, 320)

  const positionClasses: Record<string, string> = {
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
  }

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <SheetPortal forceMount>
        <SheetPrimitive.Overlay forceMount asChild>
          <m.div
            className="fixed inset-0 z-50 bg-black/80"
            initial={overlay.initial}
            animate={isOpen ? overlay.animate : { ...overlay.exit, pointerEvents: 'none' }}
            transition={overlay.transition}
          />
        </SheetPrimitive.Overlay>
        <SheetPrimitive.Content ref={ref} forceMount asChild {...props}>
          <m.div
            className={cn('fixed z-50 gap-4 bg-background p-6 shadow-lg', positionClasses[resolvedSide], className)}
            initial={slide.initial}
            animate={isOpen ? slide.animate : { ...slide.exit, pointerEvents: 'none' }}
            transition={tweenSlow}>
            {children}
            {!hideClose && (
              <SheetPrimitive.Close className="absolute end-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed data-[state=open]:bg-secondary">
                <X aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">{closeText}</span>
              </SheetPrimitive.Close>
            )}
          </m.div>
        </SheetPrimitive.Content>
      </SheetPortal>
    </LazyMotion>
  )
})
MotionSheetContent.displayName = 'MotionSheetContent'

export { MotionSheet, MotionSheetContent }
