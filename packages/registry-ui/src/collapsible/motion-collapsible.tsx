'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { heightAuto } from '@gentleduck/motion/presets/height-auto'
import { tweenExpand } from '@gentleduck/motion/transitions/tweens'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { useCollapsible, useForwardedRef } from './collapsible'

const MotionCollapsibleContent = React.forwardRef<
  HTMLElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
>(({ children, className, ...props }, ref) => {
  const { open, contentId, contentRef } = useCollapsible()
  const contentRefs = useForwardedRef(contentRef, ref)

  return (
    <LazyMotion features={loadDomAnimation}>
      <m.section
        animate={open ? heightAuto.open : heightAuto.closed}
        initial={false}
        transition={tweenExpand}
        style={{ overflow: 'hidden' }}
        aria-hidden={!open}
        inert={!open || undefined}
        data-slot="collapsible-content"
        id={contentId}
        ref={contentRefs}
        {...props}>
        <div className={cn(className)}>{children}</div>
      </m.section>
    </LazyMotion>
  )
})
MotionCollapsibleContent.displayName = 'MotionCollapsibleContent'

export { MotionCollapsibleContent }
