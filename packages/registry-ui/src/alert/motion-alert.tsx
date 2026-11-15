'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { useDirection } from '@gentleduck/primitives/direction'
import type { Variants } from '@gentleduck/variants'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'
import { alertVariants } from './alert.constants'

const MotionAlert = React.forwardRef<
  HTMLDivElement,
  Omit<
    React.HTMLAttributes<HTMLDivElement> & Variants.VariantProps<typeof alertVariants>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
  >
>(({ className, variant = 'default', dir, ...props }, ref) => {
  const direction = useDirection(toDirection(dir))
  const content = useMotionPreset(scaleIn, { transition: springBouncy })
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div
        ref={ref}
        className={cn(alertVariants({ variant }), className)}
        data-slot="alert"
        dir={direction}
        role="alert"
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}
      />
    </LazyMotion>
  )
})
MotionAlert.displayName = 'MotionAlert'

const MotionAlertTitle = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
>(({ className, ...props }, ref) => {
  const content = useMotionPreset(scaleIn, { transition: springBouncy, delay: 0.1 })
  // Own LazyMotion, so this also animates inside a plain `Alert`.
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div
        ref={ref}
        className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
        data-slot="alert-title"
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}
      />
    </LazyMotion>
  )
})
MotionAlertTitle.displayName = 'MotionAlertTitle'

const MotionAlertDescription = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
>(({ className, ...props }, ref) => {
  const content = useMotionPreset(scaleIn, { transition: springBouncy, delay: 0.18 })
  // Own LazyMotion, so this also animates inside a plain `Alert`.
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div
        ref={ref}
        className={cn(
          'col-start-2 grid justify-items-start gap-1 text-muted-foreground text-sm [&_p]:leading-relaxed',
          className,
        )}
        data-slot="alert-description"
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}
      />
    </LazyMotion>
  )
})
MotionAlertDescription.displayName = 'MotionAlertDescription'

export { MotionAlert, MotionAlertDescription, MotionAlertTitle }
