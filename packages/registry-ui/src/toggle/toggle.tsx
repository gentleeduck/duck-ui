'use client'

import { cn } from '@gentleduck/libs/cn'
import * as TogglePrimitive from '@gentleduck/primitives/toggle'
import type { Variants } from '@gentleduck/variants'
import * as React from 'react'
import { toggleVariants } from './toggle.constants'

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & Variants.VariantProps<typeof toggleVariants>
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return <TogglePrimitive.Root className={cn(toggleVariants({ className, size, variant }))} ref={ref} {...props} />
})
Toggle.displayName = 'Toggle'

export { Toggle }
