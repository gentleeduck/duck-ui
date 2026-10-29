'use client'

import { cn } from '@gentleduck/libs/cn'
import * as ProgressPrimitive from '@gentleduck/primitives/progress'
import * as React from 'react'
import { getProgressPercent } from './progress.libs'

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, min, max, ...props }, ref) => {
  const percent = getProgressPercent(value, max, min)
  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      max={max}
      min={min}
      ref={ref}
      value={value}
      {...props}>
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full bg-primary transition-[width] duration-200 ease-(--gentleduck-motion-ease)',
          percent === null && 'animate-pulse motion-reduce:animate-none motion-reduce:opacity-50',
        )}
        style={{ width: `${percent ?? 100}%` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = 'Progress'

export { Progress }
