'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { contentTransition, spinIn, tapScale } from '@gentleduck/motion/presets/content'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { Slot } from '@gentleduck/primitives/slot'
import { Loader } from 'lucide-react'
import { AnimatePresence, LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { buttonVariants } from './button.constants'
import type { ButtonProps } from './button.types'

const MotionButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
>(
  (
    {
      children,
      variant = 'default',
      size = 'default',
      border = 'default',
      asChild,
      className,
      loading,
      isCollapsed,
      icon,
      secondIcon,
      type = 'button',
      disabled,
      ...props
    },
    ref,
  ) => {
    const content = useMotionPreset(scaleIn, { transition: springBouncy })
    const isDisabled = Boolean(loading) || Boolean(disabled)
    const animateState = isDisabled
      ? { ...(content.animate as Record<string, unknown>), opacity: 0.5 }
      : content.animate

    if (asChild) {
      return (
        <LazyMotion features={loadDomAnimation}>
          <m.span
            data-slot="button"
            initial={content.initial}
            animate={animateState}
            whileTap={isDisabled ? undefined : tapScale}
            transition={content.transition}
            className={cn('inline-flex', isDisabled && 'cursor-not-allowed [&>*]:pointer-events-none')}>
            <Slot
              {...(props as React.HTMLAttributes<HTMLElement>)}
              aria-disabled={isDisabled || undefined}
              className={cn(buttonVariants({ border, className, size: isCollapsed ? 'icon' : size, variant }))}
              ref={ref as React.Ref<HTMLElement>}>
              {children}
            </Slot>
          </m.span>
        </LazyMotion>
      )
    }

    return (
      <LazyMotion features={loadDomAnimation}>
        <m.button
          data-slot="button"
          initial={content.initial}
          animate={animateState}
          whileTap={isDisabled ? undefined : tapScale}
          transition={content.transition}
          {...props}
          aria-busy={loading ? true : undefined}
          aria-disabled={isDisabled || undefined}
          className={cn(
            buttonVariants({ border, className, size: isCollapsed ? 'icon' : size, variant }),
            'overflow-hidden',
            isDisabled && 'cursor-not-allowed',
          )}
          disabled={isDisabled}
          ref={ref}
          type={type as 'button' | 'submit' | 'reset'}>
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <m.span key="loader" {...spinIn} transition={contentTransition} className="inline-flex">
                <Loader aria-hidden="true" className="animate-spin" />
              </m.span>
            ) : icon ? (
              <m.span key="icon" {...spinIn} transition={contentTransition} className="inline-flex">
                {icon}
              </m.span>
            ) : null}
          </AnimatePresence>
          {!isCollapsed && children && children}
          {!isCollapsed && secondIcon && secondIcon}
        </m.button>
      </LazyMotion>
    )
  },
)
MotionButton.displayName = 'MotionButton'

export { MotionButton }
