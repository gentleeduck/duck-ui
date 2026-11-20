// From Ark UI, packages/react/src/components/toggle-group/tests/toggle-group.test.tsx. MIT, see src/__tests__/ark/LICENSE.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { ToggleGroup, ToggleGroupItem } from '../index'

freshDom()

function ComponentUnderTest(props: Partial<React.ComponentProps<typeof ToggleGroup>>) {
  return (
    <ToggleGroup type="single" aria-label="Formatting" {...(props as object)}>
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </ToggleGroup>
  )
}

const pressed = () => screen.getAllByRole('radio').map((item) => item.getAttribute('aria-checked'))

describe('Ark UI toggle group', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('starts on its default value', () => {
    render(<ComponentUnderTest defaultValue="b" />)

    expect(pressed()).toEqual(['false', 'true', 'false'])
  })

  it('tells onValueChange the item pressed', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ComponentUnderTest onValueChange={onValueChange} />)

    await user.click(screen.getByText('A'))

    expect(onValueChange).toHaveBeenCalledWith('a')
  })

  it('presses several items when multiple', async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup type="multiple" aria-label="Formatting">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )

    await user.click(screen.getByText('A'))
    await user.click(screen.getByText('B'))

    expect(screen.getAllByRole('button').map((item) => item.getAttribute('aria-pressed'))).toEqual(['true', 'true'])
  })

  it('presses nothing while disabled', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest disabled />)

    await user.click(screen.getByText('A'))

    expect(pressed()).toEqual(['false', 'false', 'false'])
  })

  it('loops focus from the last item to the first by default, and stops at the end with loop off', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<ComponentUnderTest />)
    await user.click(screen.getByText('C'))
    await user.keyboard('{ArrowRight}')
    const looped = document.activeElement?.textContent
    unmount()
    render(<ComponentUnderTest loop={false} />)

    await user.click(screen.getByText('C'))
    await user.keyboard('{ArrowRight}')

    expect([looped, document.activeElement?.textContent]).toEqual(['A', 'C'])
  })
})
