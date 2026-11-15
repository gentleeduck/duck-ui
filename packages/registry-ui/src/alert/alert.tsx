'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import type { Variants } from '@gentleduck/variants'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'
import { alertVariants } from './alert.constants'

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & Variants.VariantProps<typeof alertVariants>
>(({ className, variant = 'default', dir, ...props }, ref) => {
  const direction = useDirection(toDirection(dir))
  return (
    <div
      ref={ref}
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      dir={direction}
      role="alert"
      {...props}
    />
  )
})
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      data-slot="alert-title"
      {...props}
    />
  ),
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'col-start-2 text-muted-foreground text-sm [&_p:not(:first-child)]:mt-2 [&_p]:leading-relaxed',
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  ),
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle }
