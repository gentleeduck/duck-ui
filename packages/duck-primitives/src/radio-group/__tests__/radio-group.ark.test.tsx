// From Ark UI, packages/react/src/components/radio-group/tests/radio-group.test.tsx. MIT, see src/__tests__/ark/LICENSE.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { RadioGroup, RadioGroupItem } from '../index'

freshDom()

function ComponentUnderTest(props: { onValueChange?: (value: string) => void }) {
  return (
    <RadioGroup aria-label="Framework" {...props}>
      <RadioGroupItem value="react">React</RadioGroupItem>
      <RadioGroupItem value="solid">Solid</RadioGroupItem>
      <RadioGroupItem value="svelte" disabled>
        Svelte
      </RadioGroupItem>
    </RadioGroup>
  )
}

describe('Ark UI radio group', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('tells onValueChange the value picked, and nothing for a disabled radio', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ComponentUnderTest onValueChange={onValueChange} />)

    await user.click(screen.getByText('Solid'))
    await user.click(screen.getByText('Svelte'))

    expect(onValueChange.mock.calls).toEqual([['solid']])
  })
})
