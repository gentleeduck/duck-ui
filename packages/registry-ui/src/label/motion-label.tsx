'use client'

import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { withMotion } from '../_internal/motion-shell'
import type { ILabelProps } from './label'
import { Label } from './label'

const MotionLabel = withMotion<ILabelProps & { index?: number }, HTMLLabelElement>(
  Label,
  scaleIn,
  { transition: springBouncy },
  { stagger: 0.05 },
)

export { MotionLabel }
