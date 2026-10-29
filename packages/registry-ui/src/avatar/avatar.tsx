'use client'

import { cn } from '@gentleduck/libs/cn'
import * as AvatarPrimitive from '@gentleduck/primitives/avatar'
import * as React from 'react'
import { firstTwoLetters, overflowLabel } from './avatar.libs'
import type { IAvatarGroupProps } from './avatar.types'

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn('aspect-square size-full', className)} {...props} />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn('flex size-full items-center justify-center rounded-full bg-muted', className)}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

const AvatarGroup = React.forwardRef<HTMLDivElement, IAvatarGroupProps>(
  ({ imgs, maxVisible = 3, getOverflowLabel = overflowLabel, className, ...props }, ref) => {
    const visibleImgs = imgs.slice(0, maxVisible)
    const overflowCount = imgs.length > maxVisible ? imgs.length - maxVisible : 0

    return (
      <div className={cn('flex items-center -space-x-5', className)} ref={ref} {...props}>
        {visibleImgs.map((img, i) => (
          <Avatar className="border-2 border-border" key={img.id ?? img.src ?? img.alt ?? i}>
            <AvatarImage alt={img.alt} src={img.src} />
            {/* Named by the alt, so a screen reader hears the same name before and after the photo loads. */}
            <AvatarFallback aria-label={img.alt || undefined} role={img.alt ? 'img' : undefined}>
              {firstTwoLetters(img.fallback ?? img.alt ?? '')}
            </AvatarFallback>
          </Avatar>
        ))}

        {overflowCount > 0 && (
          <div
            aria-label={getOverflowLabel(overflowCount)}
            className="relative z-10 flex size-10 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm ring-2 ring-background"
            role="img">
            +{overflowCount}
          </div>
        )}
      </div>
    )
  },
)
AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarFallback, AvatarGroup, AvatarImage }
