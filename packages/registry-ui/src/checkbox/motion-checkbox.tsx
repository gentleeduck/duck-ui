'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { checkerBounce, contentTransition } from '@gentleduck/motion/presets/content'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { Label } from '../label'
import { Checkbox } from './checkbox'
import type { ICheckboxGroupProps, ICheckboxProps, ICheckboxWithLabelProps } from './checkbox.types'

const MotionCheckbox = React.forwardRef<HTMLInputElement, ICheckboxProps>(({ onCheckedChange, ...props }, ref) => {
  const [bounce, setBounce] = React.useState(false)
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div
        animate={bounce ? checkerBounce : {}}
        transition={contentTransition}
        onAnimationComplete={() => setBounce(false)}
        className="inline-flex">
        <Checkbox
          ref={ref}
          onCheckedChange={(next) => {
            setBounce(true)
            onCheckedChange?.(next)
          }}
          {...props}
        />
      </m.div>
    </LazyMotion>
  )
})
MotionCheckbox.displayName = 'MotionCheckbox'

const MotionCheckboxWithLabel = React.forwardRef<
  HTMLDivElement,
  Omit<ICheckboxWithLabelProps, 'ref'> & { index?: number }
>(({ id, checkbox, label, className, index = 0 }, ref) => {
  const { className: labelClassName, ...labelProps } = label
  const content = useMotionPreset(scaleIn, { transition: springBouncy, delay: index * 0.05 })
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div
        className={cn('flex items-center justify-start gap-2', className)}
        ref={ref}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}
        data-slot="checkbox-with-label">
        <MotionCheckbox id={id} {...checkbox} />
        <Label className={cn('cursor-pointer', labelClassName)} htmlFor={id} {...labelProps} />
      </m.div>
    </LazyMotion>
  )
})
MotionCheckboxWithLabel.displayName = 'MotionCheckboxWithLabel'

const MotionCheckboxGroup = React.forwardRef<HTMLDivElement, Omit<ICheckboxGroupProps, 'ref'>>(
  ({ subtasks, defaults, ...props }, ref) => {
    const { checkbox, label } = defaults || {}
    return (
      <div className={cn('mb-3 flex flex-col gap-2')} {...props} data-slot="checkbox-group" ref={ref}>
        {subtasks.map(({ id, title, checked }, i) => (
          <MotionCheckboxWithLabel
            checkbox={{
              ...checkbox,
              className: 'size-4 rounded-full border-muted-foreground/80',
              defaultChecked: checked,
            }}
            label={{ ...label, children: title }}
            data-slot="checkbox-with-label"
            id={id}
            key={id}
            index={i}
          />
        ))}
      </div>
    )
  },
)
MotionCheckboxGroup.displayName = 'MotionCheckboxGroup'

export { MotionCheckbox, MotionCheckboxGroup, MotionCheckboxWithLabel }
