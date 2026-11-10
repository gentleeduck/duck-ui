'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { useMotionMount } from '@gentleduck/motion/use-motion-root'
import { useControllableState } from '@gentleduck/primitives/hooks/use-controllable-state'
import * as NavigationMenuPrimitive from '@gentleduck/primitives/navigation-menu'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import type { NavigationMenu } from './navigation-menu'
import {
  navigationMenuStyle,
  navigationMenuViewportPositionStyle,
  navigationMenuViewportStyle,
} from './navigation-menu.constants'

const VIEWPORT_OPTIONS = { transition: springBouncy } as const

function MotionNavigationMenuViewport({ open }: { open: boolean }) {
  const viewport = useMotionPreset(scaleIn, VIEWPORT_OPTIONS)
  const shouldRender = useMotionMount(open)

  return (
    <div className={navigationMenuViewportPositionStyle}>
      <LazyMotion features={loadDomAnimation}>
        <NavigationMenuPrimitive.Viewport asChild forceMount={shouldRender || undefined}>
          <m.div
            animate={open ? viewport.animate : viewport.exit}
            className={navigationMenuViewportStyle}
            initial={viewport.initial}
            transition={viewport.transition}
          />
        </NavigationMenuPrimitive.Viewport>
      </LazyMotion>
    </div>
  )
}

const MotionNavigationMenu = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenu>
>(({ className, children, viewport = true, value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
  const [value, setValue] = useControllableState({
    caller: 'MotionNavigationMenu',
    defaultProp: defaultValue ?? '',
    onChange: onValueChange,
    prop: valueProp,
  })

  return (
    <NavigationMenuPrimitive.Root
      className={cn(navigationMenuStyle, className)}
      data-viewport={viewport}
      onValueChange={setValue}
      ref={ref}
      value={value}
      {...props}>
      {children}
      {viewport && <MotionNavigationMenuViewport open={value !== ''} />}
    </NavigationMenuPrimitive.Root>
  )
})
MotionNavigationMenu.displayName = 'MotionNavigationMenu'

export { MotionNavigationMenu }
