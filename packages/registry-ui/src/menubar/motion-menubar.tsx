'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import * as MenubarPrimitive from '@gentleduck/primitives/menubar'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { menubarContentStyle } from './menubar.constants'

const MotionMenubarContent = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = 'start', alignOffset = -4, sideOffset = 8, children, ...props }, ref) => {
  const content = useMotionPreset(scaleIn, { transition: springBouncy })
  return (
    <LazyMotion features={loadDomAnimation}>
      <MenubarPrimitive.Portal>
        <MenubarPrimitive.Content
          ref={ref}
          align={align}
          alignOffset={alignOffset}
          sideOffset={sideOffset}
          asChild
          {...props}>
          <m.div
            className={cn(menubarContentStyle, className)}
            initial={content.initial}
            animate={content.animate}
            transition={content.transition}>
            {children}
          </m.div>
        </MenubarPrimitive.Content>
      </MenubarPrimitive.Portal>
    </LazyMotion>
  )
})
MotionMenubarContent.displayName = 'MotionMenubarContent'

export { MotionMenubarContent }
