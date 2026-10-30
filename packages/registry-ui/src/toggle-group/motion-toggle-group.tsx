'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomMax } from '@gentleduck/motion/motion-features'
import { tapScale } from '@gentleduck/motion/presets/content'
import { springSmooth } from '@gentleduck/motion/transitions/springs'
import { tweenNormal } from '@gentleduck/motion/transitions/tweens'
import * as ToggleGroupPrimitive from '@gentleduck/primitives/toggle-group'
import { AnimatePresence, LayoutGroup, LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { toggleVariants } from '../toggle/toggle.constants'
import type {
  IToggleGroupItemProps,
  IToggleGroupProps,
  ToggleGroupElement,
  ToggleGroupItemElement,
} from './toggle-group'
import { ToggleGroup, ToggleGroupContext } from './toggle-group'

const INDICATOR = 'absolute inset-0 rounded-[inherit] bg-accent'

const MotionToggleGroup: React.ForwardRefExoticComponent<IToggleGroupProps & React.RefAttributes<ToggleGroupElement>> =
  React.forwardRef<ToggleGroupElement, IToggleGroupProps>(({ children, ...props }, ref) => {
    const groupId = React.useId()
    return (
      <LazyMotion features={loadDomMax}>
        <LayoutGroup id={`toggle-group-${groupId}`}>
          <ToggleGroup ref={ref} {...props}>
            {children}
          </ToggleGroup>
        </LayoutGroup>
      </LazyMotion>
    )
  })
MotionToggleGroup.displayName = 'MotionToggleGroup'

const MotionToggleGroupItem: React.ForwardRefExoticComponent<
  Omit<IToggleGroupItemProps, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> &
    React.RefAttributes<ToggleGroupItemElement>
> = React.forwardRef<
  ToggleGroupItemElement,
  Omit<IToggleGroupItemProps, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
>(({ className, variant, size, children, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item asChild ref={ref} {...props}>
      {(pressed) => (
        <m.button
          whileTap={tapScale}
          className={cn(
            toggleVariants({ variant: variant || context.variant, size: size || context.size }),
            'relative rounded-none focus-visible:z-10 focus-visible:ring-offset-0 data-[state=on]:bg-transparent',
            className,
          )}>
          {context.type === 'multiple' ? (
            // Items on together cannot share one layoutId: motion would hide all but the last as one element.
            <AnimatePresence initial={false}>
              {pressed && (
                <m.span
                  animate={{ opacity: 1 }}
                  className={INDICATOR}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key="indicator"
                  transition={tweenNormal}
                />
              )}
            </AnimatePresence>
          ) : (
            pressed && <m.span className={INDICATOR} layoutId="toggle-group-indicator" transition={springSmooth} />
          )}
          <span className="relative z-10 inline-flex items-center justify-center">
            {typeof children === 'function' ? children(pressed) : children}
          </span>
        </m.button>
      )}
    </ToggleGroupPrimitive.Item>
  )
})
MotionToggleGroupItem.displayName = 'MotionToggleGroupItem'

export { MotionToggleGroup, MotionToggleGroupItem }
