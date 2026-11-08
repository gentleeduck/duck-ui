'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as DropdownMenuPrimitive from '@gentleduck/primitives/dropdown-menu'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import {
  dropdownMenuContentStyle,
  dropdownMenuScrollStyle,
  dropdownMenuSubContentStyle,
} from './dropdown-menu.constants'

function MotionDropdownMenu({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.Root {...rootProps} {...rest}>
        {children}
      </DropdownMenuPrimitive.Root>
    </MotionRootContext.Provider>
  )
}
MotionDropdownMenu.displayName = 'MotionDropdownMenu'

const MotionDropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const content = useMotionPreset(scaleIn, { transition: springBouncy })
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <DropdownMenuPrimitive.Portal forceMount>
        <DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} forceMount asChild {...props}>
          <m.div
            className={cn(dropdownMenuContentStyle, className)}
            initial={content.initial}
            animate={isOpen ? content.animate : { ...content.exit, pointerEvents: 'none' }}
            transition={content.transition}>
            <div className={dropdownMenuScrollStyle}>{children}</div>
          </m.div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </LazyMotion>
  )
})
MotionDropdownMenuContent.displayName = 'MotionDropdownMenuContent'

function MotionDropdownMenuSub({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Sub>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.Sub {...rootProps} {...rest}>
        {children}
      </DropdownMenuPrimitive.Sub>
    </MotionRootContext.Provider>
  )
}
MotionDropdownMenuSub.displayName = 'MotionDropdownMenuSub'

const MotionDropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const content = useMotionPreset(scaleIn, { transition: springBouncy })
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <DropdownMenuPrimitive.Portal forceMount>
        <DropdownMenuPrimitive.SubContent ref={ref} forceMount asChild {...props}>
          <m.div
            className={cn(dropdownMenuSubContentStyle, className)}
            initial={content.initial}
            animate={isOpen ? content.animate : { ...content.exit, pointerEvents: 'none' }}
            transition={content.transition}>
            {children}
          </m.div>
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </LazyMotion>
  )
})
MotionDropdownMenuSubContent.displayName = 'MotionDropdownMenuSubContent'

export { MotionDropdownMenu, MotionDropdownMenuContent, MotionDropdownMenuSub, MotionDropdownMenuSubContent }
