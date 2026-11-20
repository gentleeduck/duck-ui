// From Ark UI, packages/react/src/components/avatar/tests/avatar.test.tsx. MIT, see src/__tests__/ark/LICENSE.

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { Avatar, AvatarFallback, AvatarImage } from '../index'

freshDom()

describe('Ark UI avatar', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>PA</AvatarFallback>
        <AvatarImage src="https://example.com/avatar.png" alt="avatar" />
      </Avatar>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows its initials when given no src', () => {
    render(
      <Avatar>
        <AvatarFallback>PA</AvatarFallback>
        <AvatarImage alt="avatar" />
      </Avatar>,
    )

    expect([screen.getByText('PA').textContent, screen.queryByRole('img')]).toEqual(['PA', null])
  })
})
