'use client'

import { cn } from '@gentleduck/libs/cn'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { tapScale } from '@gentleduck/motion/presets/content'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as SelectPrimitive from '@gentleduck/primitives/select'
import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import * as React from 'react'
import { SelectHighlight, SelectScrollDownButton, SelectScrollUpButton } from './select'
import type { ISelectTriggerProps } from './select.types'

function MotionSelect({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <SelectPrimitive.Root {...rootProps} {...rest}>
        {children}
      </SelectPrimitive.Root>
    </MotionRootContext.Provider>
  )
}
MotionSelect.displayName = 'MotionSelect'

const MotionSelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const content = useMotionPreset(scaleIn, { transition: springBouncy })
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        forceMount
        asChild
        disableOutsidePointerEvents={false}
        lockScroll={false}
        {...props}>
        <motion.div
          className={cn(
            'relative z-50 max-h-(--gentleduck-select-content-available-height) min-w-32 origin-(--gentleduck-select-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            position === 'popper' &&
              'data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
            className,
          )}
          initial={content.initial}
          animate={isOpen ? content.animate : { ...content.exit, pointerEvents: 'none' }}
          transition={content.transition}>
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              'p-1',
              position === 'popper' &&
                'h-(--gentleduck-select-trigger-height) w-full min-w-(--gentleduck-select-trigger-width)',
            )}>
            <SelectHighlight />
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </motion.div>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
MotionSelectContent.displayName = 'MotionSelectContent'

const MotionSelectTrigger = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Trigger>, ISelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div whileTap={tapScale}>
      <SelectPrimitive.Trigger
        ref={ref}
        data-slot="select-trigger"
        className={cn(
          'flex h-8 min-w-32 select-none items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 text-sm shadow-xs ring-offset-background focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground [&>span]:line-clamp-1',
          className,
        )}
        {...props}>
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden="true" className="size-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    </motion.div>
  ),
)
MotionSelectTrigger.displayName = 'MotionSelectTrigger'

export { MotionSelect, MotionSelectContent, MotionSelectTrigger }
