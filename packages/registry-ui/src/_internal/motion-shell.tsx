'use client'

import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import type { IMotionPreset, IUseMotionPresetOptions } from '@gentleduck/motion/motion-presets'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'

/** Props omitted on wrapped element to avoid React/Motion lifecycle overload conflicts. */
export type MotionConflictKeys = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'

const DEFAULT_INLINE_WRAPPER = 'inline-flex'

export interface IMotionShellProps {
  /** Motion preset object or registered preset name. */
  preset: IMotionPreset
  /** Optional preset transition overrides (delay, transition, direction). */
  options?: IUseMotionPresetOptions
  /** className applied to the motion `<m.div>` wrapper. */
  wrapperClassName?: string
  /** Children rendered inside the animated wrapper. */
  children: React.ReactNode
}

/**
 * Inline-motion wrapper around a non-motion primitive — tiny `<m.div>` inside `LazyMotion`.
 * For motion-as-root patterns use `useMotionContent` directly.
 */
export function MotionShell({
  preset,
  options,
  wrapperClassName = DEFAULT_INLINE_WRAPPER,
  children,
}: IMotionShellProps) {
  const content = useMotionPreset(preset, options)
  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div
        className={wrapperClassName}
        initial={content.initial}
        animate={content.animate}
        transition={content.transition}>
        {children}
      </m.div>
    </LazyMotion>
  )
}
MotionShell.displayName = 'MotionShell'

/**
 * HOC: wraps `Component` in `MotionShell` with `preset`. Fourth arg accepts a `wrapperClassName`
 * string OR `{ wrapperClassName?, stagger? }`.
 * Use bespoke `motion-*.tsx` when motion element must be the component root.
 * @example withMotion(Avatar, scaleIn, { transition: springBouncy })
 */
export interface IWithMotionConfig {
  wrapperClassName?: string
  /** Seconds each step of an `index` prop holds the entrance back. The `index` never reaches `Component`. */
  stagger?: number
}

export function withMotion<TProps extends object, TRef>(
  Component: React.ForwardRefExoticComponent<TProps & React.RefAttributes<TRef>>,
  preset: IMotionPreset,
  options?: IUseMotionPresetOptions,
  config?: string | IWithMotionConfig,
): React.ForwardRefExoticComponent<TProps & React.RefAttributes<TRef>> {
  const displayName = `Motion(${Component.displayName ?? Component.name ?? 'Component'})`
  const wrapperClassName = typeof config === 'string' ? config : config?.wrapperClassName
  const stagger = typeof config === 'object' ? config.stagger : undefined
  const Motionised = React.forwardRef<TRef, TProps>((props, ref) => {
    const { index = 0, ...others } = props as TProps & { index?: number }
    return (
      <MotionShell
        preset={preset}
        options={stagger === undefined ? options : { ...options, delay: index * stagger }}
        wrapperClassName={wrapperClassName}>
        <Component {...((stagger === undefined ? props : others) as TProps)} ref={ref} />
      </MotionShell>
    )
  }) as React.ForwardRefExoticComponent<TProps & React.RefAttributes<TRef>>
  Motionised.displayName = displayName
  return Motionised
}
