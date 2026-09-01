'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { useDirection } from '@gentleduck/primitives/direction'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

const TRACK_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const } as const
const THUMB_TRANSITION = {
  x: { ...springBouncy, mass: 0.6 },
  scaleX: { type: 'tween', duration: 0.12, ease: 'easeOut' },
  scaleY: { type: 'tween', duration: 0.12, ease: 'easeOut' },
} as const

const MotionSwitch = React.forwardRef<
  HTMLInputElement,
  Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> & {
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, onCheckedChange, onChange, checked, defaultChecked, dir, disabled, style, ...props }, ref) => {
  const direction = useDirection(toDirection(dir))
  const isRtl = direction === 'rtl'
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked ?? false)
  const value = isControlled ? (checked ?? false) : internalChecked
  const [pressed, setPressed] = React.useState(false)

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked)
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    },
    [isControlled, onChange, onCheckedChange],
  )

  const releasePress = React.useCallback(() => setPressed(false), [])
  const handlePointerDown = React.useCallback(() => setPressed(true), [])

  const stretchOrigin = !value ? (isRtl ? 'right center' : 'left center') : isRtl ? 'left center' : 'right center'

  const trackAnimate = React.useMemo(
    () => ({
      backgroundColor: value ? 'var(--primary)' : 'var(--border)',
      borderColor: value ? 'var(--primary)' : 'var(--border)',
    }),
    [value],
  )

  const thumbStyle = React.useMemo(() => ({ transformOrigin: stretchOrigin }), [stretchOrigin])

  return (
    <LazyMotion features={loadDomAnimation}>
      <m.label
        dir={direction}
        data-slot="switch"
        data-state={value ? 'checked' : 'unchecked'}
        className={cn(
          'relative inline-flex h-[1.75em] w-[3em] shrink-0 cursor-pointer items-center rounded-full border p-[0.125em]',
          'ring-offset-background focus-within:outline-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        style={style}
        initial={false}
        animate={trackAnimate}
        transition={TRACK_TRANSITION}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        onPointerDown={disabled ? undefined : handlePointerDown}
        onPointerUp={releasePress}
        onPointerLeave={releasePress}
        onPointerCancel={releasePress}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          aria-checked={value}
          dir={direction}
          disabled={disabled}
          checked={isControlled ? value : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          onChange={handleChange}
          className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <m.span
          aria-hidden="true"
          className="pointer-events-none block size-[1.375em] rounded-full bg-background shadow-sm"
          style={thumbStyle}
          animate={{
            x: value ? (isRtl ? '-1.25em' : '1.25em') : '0em',
            scaleX: pressed ? 1.3 : 1,
            scaleY: pressed ? 0.92 : 1,
          }}
          transition={THUMB_TRANSITION}
        />
      </m.label>
    </LazyMotion>
  )
})
MotionSwitch.displayName = 'MotionSwitch'

export { MotionSwitch }
