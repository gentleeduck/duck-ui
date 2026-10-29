'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDuckReducedMotion } from '@gentleduck/motion'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { withMotion } from '../_internal/motion-shell'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { firstTwoLetters, overflowLabel } from './avatar.libs'
import type { IAvatarGroupProps } from './avatar.types'

const MotionAvatar = withMotion(Avatar, scaleIn, { transition: springBouncy })
MotionAvatar.displayName = 'MotionAvatar'

const MotionAvatarGroup = React.forwardRef<HTMLDivElement, IAvatarGroupProps>(
  ({ imgs, maxVisible = 3, getOverflowLabel = overflowLabel, className, ...props }, ref) => {
    const visibleImgs = imgs.slice(0, maxVisible)
    const overflowCount = imgs.length > maxVisible ? imgs.length - maxVisible : 0
    const content = useMotionPreset(scaleIn, { transition: springBouncy })
    const reduced = useDuckReducedMotion()
    // The target's own transition wins over the transition prop, so the delay goes in the target.
    const stagger = (index: number) => ({
      ...content.animate,
      transition: { ...content.transition, delay: reduced ? 0 : index * 0.08 },
    })

    return (
      <LazyMotion features={loadDomAnimation}>
        <div className={cn('flex items-center -space-x-5', className)} ref={ref} {...props}>
          {visibleImgs.map((img, i) => (
            <m.div key={img.id ?? img.src ?? img.alt ?? i} initial={content.initial} animate={stagger(i)}>
              <Avatar className="border-2 border-border">
                <AvatarImage alt={img.alt} src={img.src} />
                <AvatarFallback aria-label={img.alt || undefined} role={img.alt ? 'img' : undefined}>
                  {firstTwoLetters(img.fallback ?? img.alt ?? '')}
                </AvatarFallback>
              </Avatar>
            </m.div>
          ))}
          {overflowCount > 0 && (
            <m.div
              initial={content.initial}
              animate={stagger(visibleImgs.length)}
              aria-label={getOverflowLabel(overflowCount)}
              role="img"
              className="relative z-10 flex size-10 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm ring-2 ring-background">
              +{overflowCount}
            </m.div>
          )}
        </div>
      </LazyMotion>
    )
  },
)
MotionAvatarGroup.displayName = 'MotionAvatarGroup'

export { MotionAvatar, MotionAvatarGroup }
