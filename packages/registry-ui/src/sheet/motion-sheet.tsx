'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import type { DirectionalSide } from '@gentleduck/motion/presets/_utils'
import { fadeIn } from '@gentleduck/motion/presets/fade-in'
import { createSlideEdge } from '@gentleduck/motion/presets/slide-edge'
import { tweenSlow } from '@gentleduck/motion/transitions/tweens'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import { type IDirection, useDirection } from '@gentleduck/primitives/direction'
import * as SheetPrimitive from '@gentleduck/primitives/sheet'
import { X } from 'lucide-react'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'
import type { ISheetContentProps } from './sheet'
import { SheetPortal } from './sheet'

const MOTION_OPTIONS = { transition: tweenSlow } as const

const POSITION_CLASSES: Record<DirectionalSide, string> = {
  top: 'inset-x-0 top-0 max-h-dvh border-b',
  bottom: 'inset-x-0 bottom-0 max-h-dvh border-t',
  left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
  right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
}

/** Carries the root `dir` prop to the content, which needs a physical side for the slide offset. */
const MotionSheetDirContext = React.createContext<IDirection.Kind | undefined>(undefined)

function resolveSheetSide(side: Exclude<ISheetContentProps['side'], undefined>, dir: IDirection.Kind): DirectionalSide {
  // `null` and `unset` skip a cva variant, and the slide still needs an edge, so they slide in from the right.
  const physical = side === null || side === 'unset' ? 'right' : side
  if (dir !== 'rtl') return physical
  return physical === 'left' ? 'right' : physical === 'right' ? 'left' : physical
}

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
      <MotionSheetDirContext.Provider value={rest.dir}>
        <SheetPrimitive.Root {...rootProps} {...rest}>
          {children}
        </SheetPrimitive.Root>
      </MotionSheetDirContext.Provider>
    </MotionRootContext.Provider>
  )
}
MotionSheet.displayName = 'MotionSheet'

const MotionSheetContent = React.forwardRef<React.ComponentRef<typeof SheetPrimitive.Content>, ISheetContentProps>(
  ({ side = 'right', className, children, closeText = 'Close', hideClose = false, container, ...props }, ref) => {
    const { isOpen } = useMotionContent()
    const overlay = useMotionPreset(fadeIn, MOTION_OPTIONS)
    const rootDir = React.useContext(MotionSheetDirContext)
    const direction = useDirection(toDirection(props.dir) ?? rootDir)
    const resolvedSide = resolveSheetSide(side, direction)
    const slide = useMotionPreset(
      React.useMemo(() => createSlideEdge(resolvedSide), [resolvedSide]),
      MOTION_OPTIONS,
    )
    const shouldRender = useMotionMount(isOpen, 320)

    if (!shouldRender) return null

    return (
      <LazyMotion features={loadDomAnimation}>
        <SheetPortal container={container} forceMount>
          <SheetPrimitive.Overlay forceMount asChild>
            <m.div
              className="fixed inset-0 z-50 bg-black/80 data-[nested]:bg-transparent"
              initial={overlay.initial}
              animate={isOpen ? overlay.animate : { ...overlay.exit, pointerEvents: 'none' }}
              transition={overlay.transition}
            />
          </SheetPrimitive.Overlay>
          <SheetPrimitive.Content ref={ref} forceMount asChild {...props}>
            <m.div
              className={cn(
                'fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg',
                POSITION_CLASSES[resolvedSide],
                className,
              )}
              initial={slide.initial}
              animate={isOpen ? slide.animate : { ...slide.exit, pointerEvents: 'none' }}
              transition={slide.transition}>
              {children}
              {!hideClose && (
                <SheetPrimitive.Close className="absolute end-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <X aria-hidden="true" className="size-4" />
                  <span className="sr-only">{closeText}</span>
                </SheetPrimitive.Close>
              )}
            </m.div>
          </SheetPrimitive.Content>
        </SheetPortal>
      </LazyMotion>
    )
  },
)
MotionSheetContent.displayName = 'MotionSheetContent'

export { MotionSheet, MotionSheetContent }
