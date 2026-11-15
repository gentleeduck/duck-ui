import * as React from 'react'
import { createDirectionalPreset } from './presets/directional'
import { fadeIn } from './presets/fade-in'
import { popIn } from './presets/pop-in'
import { rotateIn } from './presets/rotate-in'
import { scaleIn } from './presets/scale-in'
import { slideDown } from './presets/slide-down'
import { slideFromLeft } from './presets/slide-from-left'
import { slideFromRight } from './presets/slide-from-right'
import { slideUp } from './presets/slide-up'
import type {
  Direction,
  IDuckMotion,
  IMotionPreset,
  IMotionPresetResult,
  MotionAnimationState,
  MotionPresetName,
  MotionTransitionConfig,
} from './presets/types'
import { useDuckReducedMotion } from './react'
import { springDefault } from './transitions/springs'
import { TAP_SCALE_TRANSITION } from './transitions/tweens'

export type {
  Direction,
  IDuckMotion,
  IMotionPreset,
  IMotionPresetResult,
  MotionAnimationState,
  MotionPresetName,
  MotionTransitionConfig,
}

const presetMap: Record<MotionPresetName, IMotionPreset> = {
  fadeIn,
  scaleIn,
  slideUp,
  slideDown,
  slideFromLeft,
  slideFromRight,
  rotateIn,
  popIn,
}

export interface IUseMotionPresetOptions extends IDuckMotion.IPresetOptions {}

// A spring carries the blur past blur(0px) to a negative radius, which is invalid CSS, so that frame keeps the last
// blur. The blur takes the same spring, critically damped.
function withSettledBlur(transition: MotionTransitionConfig): MotionTransitionConfig {
  if (transition.type !== 'spring') return transition
  const { damping, mass, stiffness } = transition
  const filter =
    damping === undefined && mass === undefined && stiffness === undefined
      ? { ...transition, bounce: 0 }
      : { ...transition, damping: Math.max(damping ?? 10, 2 * Math.sqrt((stiffness ?? 100) * (mass ?? 1))) }
  return { ...transition, filter }
}

// The entrance scales on scaleX and scaleY, which motion multiplies with scale, and leaves scale to the press.
function scaleOnAxes(target: MotionAnimationState): MotionAnimationState {
  const { scale, ...rest } = target
  return scale === undefined ? target : { ...rest, scale: 1, scaleX: scale, scaleY: scale }
}

function buildResult(preset: IMotionPreset, reduced: boolean, options?: IUseMotionPresetOptions): IMotionPresetResult {
  const baseTransition: MotionTransitionConfig = options?.transition ?? springDefault
  const enterTransition: MotionTransitionConfig = reduced
    ? { duration: 0 }
    : withSettledBlur({
        ...(options?.enterTransition ?? baseTransition),
        ...(options?.delay ? { delay: options.delay } : {}),
      })
  const exitTransition: MotionTransitionConfig = reduced
    ? { duration: 0 }
    : withSettledBlur(options?.exitTransition ?? baseTransition)

  // motion releases a whileTap through the animate target's transition, delay and all.
  if (options?.tap && !reduced) {
    const enter = { ...enterTransition, scale: TAP_SCALE_TRANSITION }
    return {
      initial: scaleOnAxes(preset.initial),
      animate: { ...scaleOnAxes(preset.animate), transition: enter },
      exit: { ...scaleOnAxes(preset.exit), transition: exitTransition },
      transition: enter,
    }
  }

  return {
    initial: { ...preset.initial },
    animate: { ...preset.animate, transition: enterTransition },
    exit: { ...preset.exit, transition: exitTransition },
    transition: enterTransition,
  }
}

/** Accepts preset name or object; object form is tree-shakeable. */
export function useMotionPreset(
  nameOrPreset: MotionPresetName | IMotionPreset,
  options?: IUseMotionPresetOptions,
): IMotionPresetResult {
  const reduced = useDuckReducedMotion()
  const { delay, direction, enterTransition, exitTransition, tap, transition } = options ?? {}
  const preset = direction
    ? createDirectionalPreset(direction)
    : typeof nameOrPreset === 'string'
      ? presetMap[nameOrPreset]
      : nameOrPreset
  return React.useMemo(
    () => buildResult(preset, reduced, { delay, enterTransition, exitTransition, tap, transition }),
    [reduced, preset, delay, enterTransition, exitTransition, tap, transition],
  )
}
