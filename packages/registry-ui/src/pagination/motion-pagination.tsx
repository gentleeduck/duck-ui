'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { tapScale } from '@gentleduck/motion/presets/content'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import * as PaginationPrimitive from '@gentleduck/primitives/pagination'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { buttonVariants } from '../button'
import type { IPaginationLinkProps } from './pagination.types'

const MotionPagination = React.forwardRef<
  React.ComponentRef<typeof PaginationPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof PaginationPrimitive.Root>
>(({ className, ...props }, ref) => {
  const content = useMotionPreset(scaleIn, { transition: springBouncy })
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div initial={content.initial} animate={content.animate} transition={content.transition}>
        <PaginationPrimitive.Root
          className={cn('mx-auto flex w-full justify-center', className)}
          ref={ref}
          {...props}
        />
      </m.div>
    </LazyMotion>
  )
})
MotionPagination.displayName = 'MotionPagination'

const MotionPaginationLink = React.forwardRef<
  HTMLAnchorElement,
  Omit<IPaginationLinkProps, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> & { index?: number }
>(({ className, isActive, size = 'icon', index = 0, ...props }, ref) => {
  const options = React.useMemo(() => ({ transition: springBouncy, delay: index * 0.05 }), [index])
  const content = useMotionPreset(scaleIn, options)
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.a
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          buttonVariants({
            size,
            variant: isActive ? 'outline' : 'ghost',
          }),
          className,
        )}
        data-slot="pagination-link"
        ref={ref}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        whileTap={tapScale}
        {...(props as Omit<
          React.ComponentPropsWithoutRef<'a'>,
          'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
        >)}
      />
    </LazyMotion>
  )
})
MotionPaginationLink.displayName = 'MotionPaginationLink'

const MotionPaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof MotionPaginationLink> & { text?: string; index?: number }
>(({ className, text = 'Previous', index = 0, ...props }, ref) => (
  <MotionPaginationLink
    aria-label="Go to previous page"
    className={cn('gap-1 ps-2.5', className)}
    data-slot="pagination-previous"
    ref={ref}
    index={index}
    {...props}
    size="default">
    <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
    <span className="hidden sm:block">{text}</span>
  </MotionPaginationLink>
))
MotionPaginationPrevious.displayName = 'MotionPaginationPrevious'

const MotionPaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof MotionPaginationLink> & { text?: string; index?: number }
>(({ className, text = 'Next', index = 0, ...props }, ref) => (
  <MotionPaginationLink
    aria-label="Go to next page"
    className={cn('gap-1 pe-2.5', className)}
    data-slot="pagination-next"
    ref={ref}
    index={index}
    {...props}
    size="default">
    <span className="hidden sm:block">{text}</span>
    <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
  </MotionPaginationLink>
))
MotionPaginationNext.displayName = 'MotionPaginationNext'

export { MotionPagination, MotionPaginationLink, MotionPaginationNext, MotionPaginationPrevious }
