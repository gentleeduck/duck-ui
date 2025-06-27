'use client'

import { cn } from '@gentleduck/libs/cn'
import * as React from 'react'

const Separator = ({
  className,
  orientation = 'horizontal',
  ref,
  ...props
}: React.HTMLProps<HTMLHRElement> & {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}) => (
  <hr
    role="separator"
    ref={ref}
    aria-orientation={orientation}
    className={cn(
      'border-border border',
      orientation === 'horizontal' ? 'w-full border-x' : 'h-full border-y',
      className,
    )}
    {...props}
    duck-separator=""
  />
)

const Hr = ({
  className,
  y = false,
  x = false,
  ...props
}: React.HTMLAttributes<HTMLHRElement> & {
  className?: string
  y?: boolean
  x?: boolean
}) => (
  <hr
    role="separator"
    aria-orientation={y ? 'horizontal' : 'vertical'}
    className={cn('border-border border', y ? 'w-full border-y' : 'h-full border-x', className)}
    {...props}
    duck-hr=""
  />
)

export { Separator, Hr }
