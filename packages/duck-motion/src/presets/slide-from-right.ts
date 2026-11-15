import { createSlidePreset } from './directional'
import type { IMotionPreset } from './types'

// createSlidePreset takes the way the element moves, so from the right is toward the left.
/** Slide from the right with light blur. Use for sidebar reveals and trailing actions. */
export const slideFromRight: IMotionPreset = createSlidePreset('left')
