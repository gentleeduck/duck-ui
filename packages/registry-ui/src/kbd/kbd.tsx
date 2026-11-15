'use client'

import { cn } from '@gentleduck/libs/cn'
import * as React from 'react'
import { useKeysLabel } from '../_internal/keys-label'

interface IKbdProps extends React.ComponentPropsWithoutRef<'kbd'> {
  keys?: string
}

/**
 * Key labels such as `Ctrl+S` or `⌘+K` keep their order on RTL pages, so direction follows the label
 * (`dir="auto"`) instead of the page. Pass `dir` to override.
 */
const Kbd = React.forwardRef<HTMLElement, IKbdProps>(({ className, keys, children, ...props }, ref) => {
  const label = useKeysLabel(keys)
  return (
    <kbd
      className={cn(
        'pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm bg-muted px-1 font-medium font-sans text-muted-foreground text-xs',
        "[&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      data-slot="kbd"
      dir="auto"
      ref={ref}
      {...props}>
      {children ?? label}
    </kbd>
  )
})
Kbd.displayName = 'Kbd'

const KbdGroup = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'kbd'>>(
  ({ className, ...props }, ref) => (
    <kbd
      className={cn('inline-flex items-center gap-1', className)}
      data-slot="kbd-group"
      dir="auto"
      ref={ref}
      {...props}
    />
  ),
)
KbdGroup.displayName = 'KbdGroup'

export type { IKbdProps }
export { Kbd, KbdGroup }
