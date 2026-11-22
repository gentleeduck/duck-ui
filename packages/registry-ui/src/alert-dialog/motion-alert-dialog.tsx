'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { fadeIn } from '@gentleduck/motion/presets/fade-in'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springStiff } from '@gentleduck/motion/transitions/springs'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as AlertDialogPrimitive from '@gentleduck/primitives/alert-dialog'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { AlertDialogPortal, type IAlertDialogContentProps } from './alert-dialog'

function MotionAlertDialog({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <AlertDialogPrimitive.Root {...rootProps} {...rest}>
        {children}
      </AlertDialogPrimitive.Root>
    </MotionRootContext.Provider>
  )
}
MotionAlertDialog.displayName = 'MotionAlertDialog'

const MotionAlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  IAlertDialogContentProps
>(({ className, children, container, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const overlay = useMotionPreset(fadeIn, { transition: springStiff })
  const content = useMotionPreset(scaleIn, { transition: springStiff })
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <AlertDialogPortal container={container} forceMount>
        <AlertDialogPrimitive.Overlay forceMount asChild>
          <m.div
            className="fixed inset-0 z-50 bg-black/80 data-[nested]:bg-transparent"
            initial={overlay.initial}
            animate={isOpen ? overlay.animate : { ...overlay.exit, pointerEvents: 'none' }}
            transition={overlay.transition}
          />
        </AlertDialogPrimitive.Overlay>
        <AlertDialogPrimitive.Content ref={ref} forceMount asChild {...props}>
          <m.div
            className={cn(
              'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
              className,
            )}
            initial={content.initial}
            animate={isOpen ? content.animate : { ...content.exit, pointerEvents: 'none' }}
            transition={content.transition}>
            {children}
          </m.div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </LazyMotion>
  )
})
MotionAlertDialogContent.displayName = 'MotionAlertDialogContent'

export { MotionAlertDialog, MotionAlertDialogContent }
