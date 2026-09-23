'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      <input
        dir={direction}
        type={type}
        className={cn(
          'h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base outline-none transition-colors',
          'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
          'placeholder:text-muted-foreground',
          'focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
          'md:text-sm',
          'dark:bg-input/30 dark:disabled:bg-input/80',
          'aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
          'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
          'aria-warning:border-warning aria-warning:text-warning aria-warning:ring-warning/20 dark:aria-warning:border-warning/50 dark:aria-warning:ring-warning/40',
          className,
        )}
        ref={ref}
        data-slot="input"
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'

export { Input }
