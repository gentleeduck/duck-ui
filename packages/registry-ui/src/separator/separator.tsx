'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

const Separator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement> & {
    orientation?: 'horizontal' | 'vertical'
  }
>(({ className, orientation = 'horizontal', dir, ...props }, ref) => {
  const direction = useDirection(toDirection(dir))
  return (
    <hr
      ref={ref}
      aria-orientation={orientation}
      data-orientation={orientation}
      className={cn(
        'shrink-0 border-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'min-h-full w-px',
        className,
      )}
      dir={direction}
      data-slot="separator"
      {...props}
    />
  )
})
Separator.displayName = 'Separator'

export { Separator }
