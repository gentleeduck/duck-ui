// From Ark UI, packages/react/src/components/progress/tests/progress.test.tsx. MIT, see src/__tests__/ark/LICENSE.

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { Progress, ProgressIndicator } from '../index'

freshDom()

describe('Ark UI progress', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <Progress value={30} aria-label="Loading">
        <ProgressIndicator />
      </Progress>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders its value against a max of its own', () => {
    render(
      <Progress value={30} max={60} aria-label="Loading">
        <ProgressIndicator />
      </Progress>,
    )
    const bar = screen.getByRole('progressbar')

    expect([bar.getAttribute('aria-valuenow'), bar.getAttribute('aria-valuemax')]).toEqual(['30', '60'])
  })
})
