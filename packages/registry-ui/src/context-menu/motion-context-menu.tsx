'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { MotionRootContext, useMotionContent, useMotionMount, useMotionRoot } from '@gentleduck/motion/use-motion-root'
import * as ContextMenuPrimitive from '@gentleduck/primitives/context-menu'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import type { IContextMenuContentProps } from './context-menu'
import { contextMenuContentStyle, contextMenuSubContentStyle } from './context-menu.constants'

function MotionContextMenu({
  children,
  open,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>) {
  const { rootProps, contextValue } = useMotionRoot({ open, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <ContextMenuPrimitive.Root {...rootProps} {...rest}>
        {children}
      </ContextMenuPrimitive.Root>
    </MotionRootContext.Provider>
  )
}
MotionContextMenu.displayName = 'MotionContextMenu'

const MotionContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  IContextMenuContentProps
>(({ className, children, container, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const content = useMotionPreset(scaleIn, { transition: springBouncy })
  const isOpenRef = React.useRef(isOpen)
  isOpenRef.current = isOpen
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <ContextMenuPrimitive.Portal container={container} forceMount>
        <ContextMenuPrimitive.Content
          ref={ref}
          forceMount
          asChild
          onPointerDownOutside={(e) => {
            if (!isOpenRef.current) e.preventDefault()
          }}
          onFocusOutside={(e) => {
            if (!isOpenRef.current) e.preventDefault()
          }}
          {...props}>
          <m.div
            className={cn(contextMenuContentStyle, className)}
            initial={content.initial}
            animate={isOpen ? content.animate : { ...content.exit, pointerEvents: 'none' }}
            transition={content.transition}>
            {children}
          </m.div>
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </LazyMotion>
  )
})
MotionContextMenuContent.displayName = 'MotionContextMenuContent'

function MotionContextMenuSub({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Sub>) {
  const { rootProps, contextValue } = useMotionRoot({ open, defaultOpen, onOpenChange })
  return (
    <MotionRootContext.Provider value={contextValue}>
      <ContextMenuPrimitive.Sub {...rootProps} {...rest}>
        {children}
      </ContextMenuPrimitive.Sub>
    </MotionRootContext.Provider>
  )
}
MotionContextMenuSub.displayName = 'MotionContextMenuSub'

const MotionContextMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = useMotionContent()
  const content = useMotionPreset(scaleIn, { transition: springBouncy })
  const shouldRender = useMotionMount(isOpen)

  if (!shouldRender) return null

  return (
    <LazyMotion features={loadDomAnimation}>
      <ContextMenuPrimitive.Portal forceMount>
        <ContextMenuPrimitive.SubContent ref={ref} forceMount asChild {...props}>
          <m.div
            className={cn(contextMenuSubContentStyle, className)}
            initial={content.initial}
            animate={isOpen ? content.animate : { ...content.exit, pointerEvents: 'none' }}
            transition={content.transition}>
            {children}
          </m.div>
        </ContextMenuPrimitive.SubContent>
      </ContextMenuPrimitive.Portal>
    </LazyMotion>
  )
})
MotionContextMenuSubContent.displayName = 'MotionContextMenuSubContent'

export { MotionContextMenu, MotionContextMenuContent, MotionContextMenuSub, MotionContextMenuSubContent }
