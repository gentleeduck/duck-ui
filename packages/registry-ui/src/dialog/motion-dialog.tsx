'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { fadeIn } from '@gentleduck/motion/presets/fade-in'
import { rotateIn } from '@gentleduck/motion/presets/rotate-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as DialogPrimitive from '@gentleduck/primitives/dialog'
import { X } from 'lucide-react'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { DialogPortal } from './dialog'

function MotionDialog({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <DialogPrimitive.Root {...rootProps} {...rest}>
        {children}
      </DialogPrimitive.Root>
    </MotionRootContext.Provider>
  )
}
MotionDialog.displayName = 'MotionDialog'

const MotionDialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    closeText?: string
    hideClose?: boolean
  }
>(({ className, children, closeText = 'Close', hideClose = false, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const overlay = useMotionPreset(fadeIn, { transition: springBouncy })
  const content = useMotionPreset(rotateIn, { transition: springBouncy })
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <DialogPortal forceMount>
        <DialogPrimitive.Overlay forceMount asChild>
          <m.div
            className="fixed inset-0 z-50 bg-black/80"
            initial={overlay.initial}
            animate={isOpen ? overlay.animate : { ...overlay.exit, pointerEvents: 'none' }}
            transition={overlay.transition}
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content ref={ref} forceMount asChild {...props}>
          <m.div
            className={cn(
              'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
              className,
            )}
            initial={content.initial}
            animate={isOpen ? content.animate : { ...content.exit, pointerEvents: 'none' }}
            transition={content.transition}>
            {children}
            {!hideClose && (
              <DialogPrimitive.Close className="absolute end-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">{closeText}</span>
              </DialogPrimitive.Close>
            )}
          </m.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </LazyMotion>
  )
})
MotionDialogContent.displayName = 'MotionDialogContent'

export { MotionDialog, MotionDialogContent }
