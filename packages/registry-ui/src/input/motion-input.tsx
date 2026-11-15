'use client'

import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import type * as React from 'react'
import { withMotion } from '../_internal/motion-shell'
import { Input } from './input'

const MotionInput = withMotion<React.ComponentProps<'input'> & { index?: number }, HTMLInputElement>(
  Input,
  scaleIn,
  { transition: springBouncy },
  { stagger: 0.05 },
)

export { MotionInput }
