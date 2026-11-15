import type { TargetAndTransition, Transition } from 'motion/react'

export namespace IDuckMotion {
  export type IAnimationState = TargetAndTransition
  export type ITransitionConfig = Transition
  export interface IPreset {
    initial: IAnimationState
    animate: IAnimationState
    exit: IAnimationState
  }
  export interface IPresetResult extends IPreset {
    transition: ITransitionConfig
  }
  export interface IPresetOptions {
    transition?: ITransitionConfig
    enterTransition?: ITransitionConfig
    exitTransition?: ITransitionConfig
    delay?: number
    direction?: IDirection
    /** The element also takes `whileTap`: `scale` gets the 15ms tap tween so a press releases at once, and the entrance does not scale. */
    tap?: boolean
  }
  export type IPresetName =
    | 'fadeIn'
    | 'scaleIn'
    | 'slideUp'
    | 'slideDown'
    | 'slideFromLeft'
    | 'slideFromRight'
    | 'rotateIn'
    | 'popIn'
  export type IDirection = 'top' | 'bottom' | 'left' | 'right'
}

// Backward-compat aliases — kept for the public type surface.
export type MotionAnimationState = IDuckMotion.IAnimationState
export type MotionTransitionConfig = IDuckMotion.ITransitionConfig
export type IMotionPreset = IDuckMotion.IPreset
export type IMotionPresetResult = IDuckMotion.IPresetResult
export type Direction = IDuckMotion.IDirection
export type MotionPresetName = IDuckMotion.IPresetName
