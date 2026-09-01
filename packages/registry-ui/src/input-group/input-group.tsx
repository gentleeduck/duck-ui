'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import type { Variants } from '@gentleduck/variants'
import { cva } from '@gentleduck/variants'
import * as React from 'react'
import { Button } from '../button'
import { toDirection } from '../direction/direction.libs'
import { Input } from '../input'
import { Textarea } from '../textarea'

const InputGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, dir, children, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      // biome-ignore lint/a11y/useSemanticElements: group role is semantically correct for input grouping
      <div
        className={cn(
          'group/input-group relative flex w-full items-center rounded-md border border-input shadow-xs outline-none transition-[color,box-shadow] has-disabled:cursor-not-allowed dark:bg-input/30',
          'h-9 has-[>textarea]:h-auto',
          'has-[>[data-align=inline-start]]:[&>input]:ps-2',
          'has-[>[data-align=inline-end]]:[&>input]:pe-2',
          'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
          'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',
          'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50',
          'has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40',
          className,
        )}
        data-slot="input-group"
        dir={direction}
        ref={ref}
        role="group"
        {...props}>
        {children}
      </div>
    )
  },
)
InputGroup.displayName = 'InputGroup'

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 font-medium text-muted-foreground text-sm group-has-disabled/input-group:cursor-not-allowed group-data-[disabled=true]/input-group:cursor-not-allowed group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      align: 'inline-start',
    },
    variants: {
      align: {
        'block-end': 'order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3',
        'block-start':
          'order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3',
        'inline-end': 'order-last pe-3 has-[>button]:me-[-0.45rem] has-[>kbd]:me-[-0.35rem]',
        'inline-start': 'order-first ps-3 has-[>button]:ms-[-0.45rem] has-[>kbd]:ms-[-0.35rem]',
      },
    },
  },
)

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & Variants.VariantProps<typeof inputGroupAddonVariants>
>(({ className, align = 'inline-start', ...props }, ref) => {
  return (
    // biome-ignore lint/a11y/useSemanticElements: group role is semantically correct for addon grouping
    // biome-ignore lint/a11y/useKeyWithClickEvents: click handler delegates focus to input, not interactive itself
    <div
      className={cn(inputGroupAddonVariants({ align }), className)}
      data-align={align}
      data-slot="input-group-addon"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      ref={ref}
      role="group"
      {...props}
    />
  )
})
InputGroupAddon.displayName = 'InputGroupAddon'

const inputGroupButtonVariants = cva('flex items-center gap-2 text-sm shadow-none', {
  defaultVariants: {
    size: 'xs',
  },
  variants: {
    size: {
      'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
      'icon-xs': 'size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0',
      xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
      sm: 'h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5',
    },
  },
})

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, 'size'> & Variants.VariantProps<typeof inputGroupButtonVariants>
>(({ className, type = 'button', variant = 'ghost', size = 'xs', ...props }, ref) => {
  return (
    <Button
      className={cn(inputGroupButtonVariants({ size }), className)}
      data-size={size}
      ref={ref}
      type={type}
      variant={variant}
      {...props}
    />
  )
})
InputGroupButton.displayName = 'InputGroupButton'

const InputGroupText = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => {
    return (
      <span
        className={cn(
          "flex items-center gap-2 text-muted-foreground text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
InputGroupText.displayName = 'InputGroupText'

const InputGroupInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
  ({ className, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      <Input
        className={cn(
          'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
          className,
        )}
        dir={direction}
        data-slot="input-group-control"
        ref={ref}
        {...props}
      />
    )
  },
)
InputGroupInput.displayName = 'InputGroupInput'

const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentPropsWithoutRef<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        className={cn(
          'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
          className,
        )}
        data-slot="input-group-control"
        ref={ref}
        {...props}
      />
    )
  },
)
InputGroupTextarea.displayName = 'InputGroupTextarea'

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea }
