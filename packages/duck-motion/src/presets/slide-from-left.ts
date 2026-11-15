import { createSlidePreset } from './directional'
import type { IMotionPreset } from './types'

// createSlidePreset takes the way the element moves, as slideUp takes 'top', so from the left is toward the right.
/** Slide from the left with light blur. Use for sidebar reveals and breadcrumb chevrons. */
export const slideFromLeft: IMotionPreset = createSlidePreset('right')
