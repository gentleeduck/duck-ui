import { afterEach, describe, expect, it } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import * as ArrowModule from '..'
import { Arrow } from '../arrow'

const ROUNDED = 'M 0,0 C 6,0 13.5,10 15,10 C 16.5,10 24,0 30,0 Z'

describe('Arrow', () => {
  afterEach(cleanup)

  it('draws a rounded arrow stretched over a 30 by 10 box, 10 by 5 unless sized', () => {
    render(<Arrow data-testid="arrow" />)

    const arrow = screen.getByTestId('arrow')
    expect(arrow.getAttribute('data-slot')).toBe('arrow')
    expect([arrow.getAttribute('width'), arrow.getAttribute('height')]).toEqual(['10', '5'])
    expect(arrow.getAttribute('viewBox')).toBe('0 0 30 10')
    expect(arrow.getAttribute('preserveAspectRatio')).toBe('none')
    expect([...arrow.children].map((child) => child.getAttribute('d'))).toEqual([ROUNDED])
  })

  it('draws its children inside its own svg in place of the rounded arrow when asChild is set', () => {
    render(
      <Arrow asChild data-testid="arrow" width={14} height={8}>
        <path d="M0 0h30L15 10z" />
      </Arrow>,
    )

    const arrow = screen.getByTestId('arrow')
    expect(arrow.tagName).toBe('svg')
    expect([arrow.getAttribute('width'), arrow.getAttribute('height')]).toEqual(['14', '8'])
    expect([...arrow.children].map((child) => child.getAttribute('d'))).toEqual(['M0 0h30L15 10z'])
  })

  it('is also exported as Root, the name Radix gives it, and names itself Arrow', () => {
    expect([ArrowModule.Root === Arrow, Arrow.displayName]).toEqual([true, 'Arrow'])
  })

  it('takes a viewBox and an aspect ratio passed to it over its own', () => {
    render(
      <Arrow asChild data-testid="arrow" viewBox="0 0 14 8" preserveAspectRatio="xMidYMax meet">
        <path d="M0 0h14L7 8z" />
      </Arrow>,
    )

    const arrow = screen.getByTestId('arrow')
    expect(arrow.getAttribute('viewBox')).toBe('0 0 14 8')
    expect(arrow.getAttribute('preserveAspectRatio')).toBe('xMidYMax meet')
  })
})
