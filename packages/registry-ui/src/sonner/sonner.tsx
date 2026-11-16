'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import { useTheme } from 'next-themes'
import React from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { toDirection } from '../direction/direction.libs'

/** Left and right corners mirror in RTL, like every other physical side in the library. */
function mirrorPosition(position: NonNullable<ToasterProps['position']>, dir: 'ltr' | 'rtl') {
  if (dir !== 'rtl') return position
  if (position.endsWith('-left')) return position.replace('-left', '-right') as typeof position
  if (position.endsWith('-right')) return position.replace('-right', '-left') as typeof position
  return position
}

const Toaster = React.forwardRef<React.ComponentRef<typeof Sonner>, ToasterProps>(
  ({ dir, className, position, style, ...props }, ref) => {
    const { theme = 'system' } = useTheme()
    const direction = useDirection(toDirection(dir))

    return (
      <Sonner
        ref={ref}
        className={cn('toaster group [&_li>div]:w-full', className)}
        dir={direction}
        position={mirrorPosition(position ?? 'bottom-right', direction)}
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-border': 'var(--border)',
            '--normal-text': 'var(--popover-foreground)',
            ...style,
          } as React.CSSProperties
        }
        theme={theme as ToasterProps['theme']}
        {...props}
      />
    )
  },
)
Toaster.displayName = 'Toaster'

export { Toaster }
