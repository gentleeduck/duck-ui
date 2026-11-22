import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { withMotion } from '../motion-shell'

describe('withMotion', () => {
  test('names the wrapper after the component it wraps', () => {
    const Pond = React.forwardRef<HTMLDivElement>((_, ref) => <div ref={ref} />)
    Pond.displayName = 'Pond'

    expect(withMotion(Pond, scaleIn).displayName).toBe('Motion(Pond)')
  })

  test('names the wrapper Motion(Component) when the component has no display name', () => {
    const Unnamed = React.forwardRef<HTMLDivElement>((_, ref) => <div ref={ref} />)

    expect(withMotion(Unnamed, scaleIn).displayName).toBe('Motion(Component)')
  })
})
