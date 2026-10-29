'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import * as ProgressPrimitive from '@gentleduck/primitives/progress'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { getProgressPercent } from './progress.libs'

const MOTION_PROGRESS_BAR_INITIAL = { scaleX: 0, opacity: 0.5 } as const
const MOTION_PROGRESS_BAR_TRANSITION = {
  scaleX: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  opacity: { duration: 0.2, ease: 'easeOut' },
} as const
const MOTION_PROGRESS_BAR_WAITING = { scaleX: 1, opacity: [1, 0.5, 1] }
const MOTION_PROGRESS_BAR_WAITING_TRANSITION = {
  scaleX: MOTION_PROGRESS_BAR_TRANSITION.scaleX,
  opacity: { duration: 2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY },
} as const
const MOTION_PROGRESS_SHIMMER_INITIAL = { x: '-100%' } as const
const MOTION_PROGRESS_SHIMMER_ANIMATE = { x: '200%' } as const
const MOTION_PROGRESS_SHIMMER_TRANSITION = {
  duration: 2,
  ease: 'easeInOut',
  repeat: Number.POSITIVE_INFINITY,
  repeatDelay: 0.5,
} as const

const MotionProgress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'asChild'>
>(({ className, value, min, max, ...props }, ref) => {
  const percent = getProgressPercent(value, max, min)
  const barAnimate = React.useMemo(
    () => (percent === null ? MOTION_PROGRESS_BAR_WAITING : { scaleX: percent / 100, opacity: 1 }),
    [percent],
  )
  return (
    <LazyMotion features={loadDomAnimation}>
      <ProgressPrimitive.Root
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
        max={max}
        min={min}
        ref={ref}
        value={value}
        {...props}>
        <ProgressPrimitive.Indicator asChild>
          <m.div
            className="relative h-full origin-left bg-primary [&:dir(rtl)]:origin-right"
            initial={MOTION_PROGRESS_BAR_INITIAL}
            animate={barAnimate}
            transition={percent === null ? MOTION_PROGRESS_BAR_WAITING_TRANSITION : MOTION_PROGRESS_BAR_TRANSITION}>
            <m.span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)] [&:dir(rtl)]:-scale-x-100"
              initial={MOTION_PROGRESS_SHIMMER_INITIAL}
              animate={MOTION_PROGRESS_SHIMMER_ANIMATE}
              transition={MOTION_PROGRESS_SHIMMER_TRANSITION}
            />
          </m.div>
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    </LazyMotion>
  )
})
MotionProgress.displayName = 'MotionProgress'

export { MotionProgress }
