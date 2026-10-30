'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { tapScale } from '@gentleduck/motion/presets/content'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { TAP_SCALE_TRANSITION } from '@gentleduck/motion/transitions/tweens'
import * as TogglePrimitive from '@gentleduck/primitives/toggle'
import type { Variants } from '@gentleduck/variants'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { toggleVariants } from './toggle.constants'

const MotionToggle = React.forwardRef<
  HTMLButtonElement,
  Omit<
    React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & Variants.VariantProps<typeof toggleVariants>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
  >
>(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
  const presetOptions = React.useMemo(() => ({ transition: springBouncy }), [])
  const content = useMotionPreset(scaleIn, presetOptions)
  return (
    <LazyMotion features={loadDomAnimation}>
      <TogglePrimitive.Root asChild ref={ref} {...props}>
        {(pressed) => (
          <m.button
            className={cn(toggleVariants({ className, size, variant }))}
            // motion releases a press through this transition, and with none it springs back.
            transition={TAP_SCALE_TRANSITION}
            whileTap={tapScale}>
            {React.Children.map(typeof children === 'function' ? children(pressed) : children, (child, i) => (
              <m.span
                // biome-ignore lint/suspicious/noArrayIndexKey: span wraps positional child by index
                key={i}
                initial={content.initial}
                // The target's own transition wins over the transition prop, so the delay goes in the target.
                animate={{ ...content.animate, transition: { ...content.transition, delay: i * 0.05 } }}
                className="inline-flex">
                {child}
              </m.span>
            ))}
          </m.button>
        )}
      </TogglePrimitive.Root>
    </LazyMotion>
  )
})
MotionToggle.displayName = 'MotionToggle'

export { MotionToggle }
