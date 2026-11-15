'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { slideUp } from '@gentleduck/motion/presets/slide-up'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { typographyVariants } from './typography.constants'

type IMotionIndexProps = { index?: number }

function useTypographyMotion(index: number) {
  const options = React.useMemo(() => ({ transition: springBouncy, delay: index * 0.05 }), [index])
  return useMotionPreset(slideUp, options)
}

type IMotionHeadingProps = Omit<
  React.HTMLAttributes<HTMLHeadingElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> &
  IMotionIndexProps

const MotionTypographyH1 = React.forwardRef<HTMLHeadingElement, IMotionHeadingProps>(
  ({ className, index = 0, ...props }, ref) => {
    const content = useTypographyMotion(index)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.h1
          ref={ref}
          data-slot="typography-h1"
          className={cn(typographyVariants({ level: 'h1' }), className)}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}
          {...props}
        />
      </LazyMotion>
    )
  },
)
MotionTypographyH1.displayName = 'MotionTypographyH1'

const MotionTypographyH2 = React.forwardRef<HTMLHeadingElement, IMotionHeadingProps>(
  ({ className, index = 0, ...props }, ref) => {
    const content = useTypographyMotion(index)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.h2
          ref={ref}
          data-slot="typography-h2"
          className={cn(typographyVariants({ level: 'h2' }), className)}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}
          {...props}
        />
      </LazyMotion>
    )
  },
)
MotionTypographyH2.displayName = 'MotionTypographyH2'

const MotionTypographyH3 = React.forwardRef<HTMLHeadingElement, IMotionHeadingProps>(
  ({ className, index = 0, ...props }, ref) => {
    const content = useTypographyMotion(index)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.h3
          ref={ref}
          data-slot="typography-h3"
          className={cn(typographyVariants({ level: 'h3' }), className)}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}
          {...props}
        />
      </LazyMotion>
    )
  },
)
MotionTypographyH3.displayName = 'MotionTypographyH3'

const MotionTypographyH4 = React.forwardRef<HTMLHeadingElement, IMotionHeadingProps>(
  ({ className, index = 0, ...props }, ref) => {
    const content = useTypographyMotion(index)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.h4
          ref={ref}
          data-slot="typography-h4"
          className={cn(typographyVariants({ level: 'h4' }), className)}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}
          {...props}
        />
      </LazyMotion>
    )
  },
)
MotionTypographyH4.displayName = 'MotionTypographyH4'

type IMotionParagraphProps = Omit<
  React.HTMLAttributes<HTMLParagraphElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> &
  IMotionIndexProps

const MotionTypographyP = React.forwardRef<HTMLParagraphElement, IMotionParagraphProps>(
  ({ className, index = 0, ...props }, ref) => {
    const content = useTypographyMotion(index)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.p
          ref={ref}
          data-slot="typography-p"
          className={cn(typographyVariants({ level: 'p' }), className)}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}
          {...props}
        />
      </LazyMotion>
    )
  },
)
MotionTypographyP.displayName = 'MotionTypographyP'

const MotionTypographyBlockquote = React.forwardRef<
  HTMLQuoteElement,
  Omit<React.HTMLAttributes<HTMLQuoteElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> &
    IMotionIndexProps
>(({ className, index = 0, ...props }, ref) => {
  const content = useTypographyMotion(index)
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.blockquote
        ref={ref}
        data-slot="typography-blockquote"
        className={cn(typographyVariants({ level: 'blockquote' }), className)}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}
      />
    </LazyMotion>
  )
})
MotionTypographyBlockquote.displayName = 'MotionTypographyBlockquote'

const MotionTypographyListItem = React.forwardRef<
  HTMLLIElement,
  Omit<React.HTMLAttributes<HTMLLIElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> &
    IMotionIndexProps
>(({ className, index = 0, ...props }, ref) => {
  const content = useTypographyMotion(index)
  // Own LazyMotion, so this also animates inside a plain list.
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.li
        ref={ref}
        data-slot="typography-list-item"
        className={className}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}
      />
    </LazyMotion>
  )
})
MotionTypographyListItem.displayName = 'MotionTypographyListItem'

const MotionTypographyList = React.forwardRef<
  HTMLUListElement,
  Omit<React.HTMLAttributes<HTMLUListElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> &
    IMotionIndexProps
>(({ className, index = 0, children, ...props }, ref) => {
  const content = useTypographyMotion(index)
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.ul
        ref={ref}
        data-slot="typography-list"
        className={cn(typographyVariants({ level: 'list' }), className)}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}>
        {React.Children.map(children, (child, i) => {
          if (!React.isValidElement<React.LiHTMLAttributes<HTMLLIElement>>(child)) return child
          // motion calls these with its own arguments, where a DOM handler of the same name expects an event.
          const { onAnimationStart, onDrag, onDragEnd, onDragStart, ...item } = child.props
          return <MotionTypographyListItem {...item} index={index + i + 1} />
        })}
      </m.ul>
    </LazyMotion>
  )
})
MotionTypographyList.displayName = 'MotionTypographyList'

const MotionTypographyInlineCode = React.forwardRef<
  HTMLElement,
  Omit<React.HTMLAttributes<HTMLElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> &
    IMotionIndexProps
>(({ className, index = 0, ...props }, ref) => {
  const content = useTypographyMotion(index)
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.code
        ref={ref}
        data-slot="typography-inline-code"
        className={cn(typographyVariants({ level: 'inlineCode' }), className)}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}
      />
    </LazyMotion>
  )
})
MotionTypographyInlineCode.displayName = 'MotionTypographyInlineCode'

const MotionTypographyLead = React.forwardRef<HTMLParagraphElement, IMotionParagraphProps>(
  ({ className, index = 0, ...props }, ref) => {
    const content = useTypographyMotion(index)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.p
          ref={ref}
          data-slot="typography-lead"
          className={cn(typographyVariants({ level: 'lead' }), className)}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}
          {...props}
        />
      </LazyMotion>
    )
  },
)
MotionTypographyLead.displayName = 'MotionTypographyLead'

const MotionTypographyLarge = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> &
    IMotionIndexProps
>(({ className, index = 0, ...props }, ref) => {
  const content = useTypographyMotion(index)
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div
        ref={ref}
        data-slot="typography-large"
        className={cn(typographyVariants({ level: 'large' }), className)}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}
      />
    </LazyMotion>
  )
})
MotionTypographyLarge.displayName = 'MotionTypographyLarge'

const MotionTypographySmall = React.forwardRef<
  HTMLElement,
  Omit<React.HTMLAttributes<HTMLElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> &
    IMotionIndexProps
>(({ className, index = 0, ...props }, ref) => {
  const content = useTypographyMotion(index)
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.small
        ref={ref}
        data-slot="typography-small"
        className={cn(typographyVariants({ level: 'small' }), className)}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        {...props}
      />
    </LazyMotion>
  )
})
MotionTypographySmall.displayName = 'MotionTypographySmall'

const MotionTypographyMuted = React.forwardRef<HTMLParagraphElement, IMotionParagraphProps>(
  ({ className, index = 0, ...props }, ref) => {
    const content = useTypographyMotion(index)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.p
          ref={ref}
          data-slot="typography-muted"
          className={cn(typographyVariants({ level: 'muted' }), className)}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}
          {...props}
        />
      </LazyMotion>
    )
  },
)
MotionTypographyMuted.displayName = 'MotionTypographyMuted'

type ITypographyTableProps = React.HTMLAttributes<HTMLTableElement> & { wrapperClassName?: string }
type IMotionTypographyTableProps = Omit<
  ITypographyTableProps,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> &
  IMotionIndexProps

const MotionTypographyTable = React.forwardRef<HTMLTableElement, IMotionTypographyTableProps>(
  ({ className, wrapperClassName, index = 0, children, ...props }, ref) => {
    const content = useTypographyMotion(index)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.div
          className={cn(typographyVariants({ level: 'tableWrapper' }), wrapperClassName)}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}>
          <table
            ref={ref}
            data-slot="typography-table"
            className={cn(typographyVariants({ level: 'table' }), className)}
            {...props}>
            {children}
          </table>
        </m.div>
      </LazyMotion>
    )
  },
)
MotionTypographyTable.displayName = 'MotionTypographyTable'

export {
  MotionTypographyBlockquote,
  MotionTypographyH1,
  MotionTypographyH2,
  MotionTypographyH3,
  MotionTypographyH4,
  MotionTypographyInlineCode,
  MotionTypographyLarge,
  MotionTypographyLead,
  MotionTypographyList,
  MotionTypographyListItem,
  MotionTypographyMuted,
  MotionTypographyP,
  MotionTypographySmall,
  MotionTypographyTable,
}
