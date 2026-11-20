// From Base UI, packages/react/src/progress/root/ProgressRoot.test.tsx. MIT, see src/__tests__/base-ui/LICENSE.
// Left out, as Radix behaves otherwise: a value past max or below min, which Base UI clamps and Radix logs and draws
// indeterminate, and min equal to max, which Radix logs and falls back from. Base UI's `format` and `locale` are
// `getValueLabel` here.

import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Progress, ProgressIndicator, ProgressValue } from '../index'

freshDom()

describe('Base UI progress', () => {
  let error: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    error = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    error.mockRestore()
  })

  it('updates aria-valuenow as the value changes', () => {
    const progress = (value: number) => (
      <Progress value={value} aria-label="Loading">
        <ProgressIndicator />
      </Progress>
    )
    const { rerender } = render(progress(30))

    rerender(progress(50))

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50')
  })

  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    it(`draws a value of ${value} indeterminate`, () => {
      render(
        <Progress value={value} aria-label="Loading">
          <ProgressValue data-testid="value" />
          <ProgressIndicator />
        </Progress>,
      )
      const bar = screen.getByRole('progressbar')

      expect([
        bar.getAttribute('data-state'),
        bar.hasAttribute('aria-valuenow'),
        screen.getByTestId('value').textContent,
      ]).toEqual(['indeterminate', false, ''])
    })
  }
})
