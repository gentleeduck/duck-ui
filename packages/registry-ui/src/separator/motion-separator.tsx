'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { useDirection } from '@gentleduck/primitives/direction'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

const MOTION_SEPARATOR_ANIMATE = { opacity: 1, scaleX: 1, scaleY: 1 } as const
const MOTION_SEPARATOR_INITIAL_HORIZONTAL = { opacity: 0, scaleX: 0, scaleY: 1 } as const
const MOTION_SEPARATOR_INITIAL_VERTICAL = { opacity: 0, scaleX: 1, scaleY: 0 } as const

const MotionSeparator = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> & {
    orientation?: 'horizontal' | 'vertical'
  }
>(({ className, orientation = 'horizontal', dir, ...props }, ref) => {
  const direction = useDirection(toDirection(dir))
  const isHorizontal = orientation === 'horizontal'
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        data-orientation={orientation}
        className={cn('shrink-0 bg-border', isHorizontal ? 'h-px w-full' : 'min-h-full w-px', className)}
        dir={direction}
        initial={isHorizontal ? MOTION_SEPARATOR_INITIAL_HORIZONTAL : MOTION_SEPARATOR_INITIAL_VERTICAL}
        animate={MOTION_SEPARATOR_ANIMATE}
        transition={springBouncy}
        data-slot="separator"
        {...props}
      />
    </LazyMotion>
  )
})
MotionSeparator.displayName = 'MotionSeparator'

export { MotionSeparator }
