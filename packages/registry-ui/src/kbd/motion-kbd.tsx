'use client'

import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import type * as React from 'react'
import { withMotion } from '../_internal/motion-shell'
import { Kbd } from './kbd'

const MOTION_KBD_STAGGER = 0.03

const MotionKbd = withMotion<React.ComponentPropsWithoutRef<typeof Kbd> & { index?: number }, HTMLElement>(
  Kbd,
  scaleIn,
  { transition: springBouncy },
  {
    wrapperClassName: 'inline-flex',
    stagger: MOTION_KBD_STAGGER,
  },
)

export { MotionKbd }
