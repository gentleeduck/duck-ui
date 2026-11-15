'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import { Slot } from '@gentleduck/primitives/slot'
import type { Variants } from '@gentleduck/variants'
import { cva } from '@gentleduck/variants'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'
import { Separator } from '../separator'
import { itemVariants } from './item.constants'

const ItemGroupContext = React.createContext(false)

const ItemGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      <ItemGroupContext.Provider value={true}>
        {/* biome-ignore lint/a11y/useSemanticElements: list role on div is intentional for composed item patterns */}
        <div
          className={cn('group/item-group flex flex-col', className)}
          dir={direction}
          data-slot="item-group"
          ref={ref}
          role="list"
          {...props}
        />
      </ItemGroupContext.Provider>
    )
  },
)
ItemGroup.displayName = 'ItemGroup'

const ItemSeparator = React.forwardRef<
  React.ComponentRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => {
  const listed = React.useContext(ItemGroupContext)
  return (
    <Separator
      className={cn('my-0', className)}
      data-slot="item-separator"
      orientation="horizontal"
      ref={ref}
      // A list holds only list items, so in a group the line is drawn and not announced.
      role={listed ? 'none' : undefined}
      {...props}
    />
  )
})
ItemSeparator.displayName = 'ItemSeparator'

const Item = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & Variants.VariantProps<typeof itemVariants> & { asChild?: boolean }
>(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
  const listed = React.useContext(ItemGroupContext)
  const Comp = asChild ? Slot : 'div'
  const item = (
    <Comp
      className={cn(itemVariants({ className, size, variant }))}
      data-size={size}
      data-slot="item"
      data-variant={variant}
      ref={ref}
      role={listed && !asChild ? 'listitem' : undefined}
      {...props}
    />
  )
  return listed && asChild ? (
    // biome-ignore lint/a11y/useSemanticElements: the group is a div list, and the child keeps its own role, a link's included
    <div className="contents" role="listitem">
      {item}
    </div>
  ) : (
    item
  )
})
Item.displayName = 'Item'

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "size-8 rounded-sm border bg-muted [&_svg:not([class*='size-'])]:size-4",
        image: 'size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover',
      },
    },
  },
)

const ItemMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & Variants.VariantProps<typeof itemMediaVariants>
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      className={cn(itemMediaVariants({ className, variant }))}
      data-slot="item-media"
      data-variant={variant}
      ref={ref}
      {...props}
    />
  )
})
ItemMedia.displayName = 'ItemMedia'

const ItemContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none', className)}
        data-slot="item-content"
        ref={ref}
        {...props}
      />
    )
  },
)
ItemContent.displayName = 'ItemContent'

const ItemTitle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('flex w-fit items-center gap-2 font-medium text-sm leading-snug', className)}
        data-slot="item-title"
        ref={ref}
        {...props}
      />
    )
  },
)
ItemTitle.displayName = 'ItemTitle'

const ItemDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<'p'>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        className={cn(
          'line-clamp-2 text-balance font-normal text-muted-foreground text-sm leading-normal',
          '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
          className,
        )}
        data-slot="item-description"
        ref={ref}
        {...props}
      />
    )
  },
)
ItemDescription.displayName = 'ItemDescription'

const ItemActions = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    return <div className={cn('flex items-center gap-2', className)} data-slot="item-actions" ref={ref} {...props} />
  },
)
ItemActions.displayName = 'ItemActions'

const ItemHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('flex basis-full items-center justify-between gap-2', className)}
        data-slot="item-header"
        ref={ref}
        {...props}
      />
    )
  },
)
ItemHeader.displayName = 'ItemHeader'

const ItemFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('flex basis-full items-center justify-between gap-2', className)}
        data-slot="item-footer"
        ref={ref}
        {...props}
      />
    )
  },
)
ItemFooter.displayName = 'ItemFooter'

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
}
