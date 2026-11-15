'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      <textarea
        className={cn(
          'field-sizing-content flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-hidden transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:disabled:bg-input/80',
          'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
          'aria-warning:border-warning aria-warning:ring-1 aria-warning:ring-warning/20 dark:aria-warning:border-warning/50 dark:aria-warning:ring-warning/40',
          className,
        )}
        data-slot="textarea"
        dir={dir === 'auto' ? dir : direction}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
