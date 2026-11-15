'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'
import type { Variants } from '@gentleduck/variants'
import { cva } from '@gentleduck/variants'
import React from 'react'

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",

  {
    defaultVariants: {
      border: 'default',
      size: 'default',
      variant: 'default',
    },
    variants: {
      border: {
        default: '',
        destructive: 'border border-destructive/40 bg-destructive/40 hover:border-destructive hover:bg-destructive/65',
        primary: 'border border-border/40 hover:border-border/80',
        secondary: 'border border-secondary/40 bg-secondary/40 hover:border-secondary hover:bg-secondary/65',
        warning: 'border border-warning/40 bg-warning/40 hover:border-warning hover:bg-warning/65',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        icon: 'size-9',
        'icon-lg': 'size-10',
        'icon-sm': 'size-8',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
      },
      variant: {
        dashed:
          'border border-input border-dashed bg-background text-accent-foreground shadow-xs hover:bg-accent/50 hover:text-accent-foreground',
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive: 'bg-destructive/90 text-destructive-foreground shadow-xs hover:bg-destructive/70',
        expandIcon: 'group relative bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'text-accent-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        nothing: '',
        outline:
          'border border-input bg-background text-accent-foreground shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        warning: 'bg-warning/90 text-warning-foreground shadow-xs hover:bg-warning/70',
      },
    },
  },
)

type ButtonVariantProps = Variants.VariantProps<typeof buttonVariants>

export default function Demo() {
  const [variant, setVariant] = React.useState<ButtonVariantProps['variant']>('default')
  const [size, setSize] = React.useState<ButtonVariantProps['size']>('default')
  const [border, setBorder] = React.useState<ButtonVariantProps['border']>('default')

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 p-6">
      <div className="absolute start-0 top-0 flex flex-col gap-4">
        {/* Variant Select */}
        <Select onValueChange={(val) => setVariant(val as ButtonVariantProps['variant'])}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choose Variant" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Variant</SelectLabel>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="nothing">Nothing</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Size Select */}
        <Select onValueChange={(val) => setSize(val as ButtonVariantProps['size'])}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choose Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Size</SelectLabel>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="sm">SM</SelectItem>
              <SelectItem value="lg">LG</SelectItem>
              <SelectItem value="icon">Icon</SelectItem>
              <SelectItem value="icon-sm">Icon SM</SelectItem>
              <SelectItem value="icon-lg">Icon LG</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Border Select */}
        <Select onValueChange={(val) => setBorder(val as ButtonVariantProps['border'])}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choose Border" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Border</SelectLabel>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Preview Button */}
      <Button border={border} size={size} variant={variant}>
        Button
      </Button>
    </div>
  )
}
