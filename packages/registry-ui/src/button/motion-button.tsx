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
import { holdChild, stopClick } from './button'
import { buttonVariants } from './button.constants'
import type { ButtonProps } from './button.types'

const TAP_PRESET = { tap: true, transition: springBouncy }

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
    const content = useMotionPreset(scaleIn, TAP_PRESET)
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
            animate={content.animate}
            whileTap={isDisabled ? undefined : tapScale}
            transition={content.transition}
            className={cn('inline-flex', isDisabled && 'cursor-not-allowed [&>*]:pointer-events-none')}
            // The child takes no pointer while disabled, so a click lands here.
            onClickCapture={isDisabled ? stopClick : undefined}>
            <Slot
              {...(props as React.HTMLAttributes<HTMLElement>)}
              aria-busy={loading ? true : undefined}
              aria-disabled={isDisabled ? true : props['aria-disabled']}
              className={cn(buttonVariants({ border, className, size: isCollapsed ? 'icon' : size, variant }))}
              onClickCapture={isDisabled ? stopClick : props.onClickCapture}
              ref={ref as React.Ref<HTMLElement>}>
              {isDisabled ? holdChild(children, Boolean(loading)) : children}
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
                <Loader aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
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
