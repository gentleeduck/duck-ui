// From Ark UI, packages/react/src/components/pin-input/tests/pin-input.test.tsx. MIT, see src/__tests__/ark/LICENSE.
// Ark's PinInput is an input OTP here. Left out: Ark's Field, whose helper and error text have no counterpart.

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../index'

freshDom()

function ComponentUnderTest(props: Omit<React.ComponentProps<typeof InputOTP>, 'maxLength' | 'children'>) {
  return (
    <InputOTP maxLength={3} aria-label="Code" {...props}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  )
}

const slots = () => screen.getAllByRole('textbox') as HTMLInputElement[]

describe('Ark UI pin input', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('labels each slot for assistive technology', () => {
    render(<ComponentUnderTest />)

    expect(slots().every((slot) => (slot.getAttribute('aria-label') ?? '') !== '')).toBe(true)
  })

  it('focuses its first slot with autoFocus', () => {
    render(<ComponentUnderTest autoFocus />)

    expect(document.activeElement).toBe(slots()[0])
  })

  it('moves focus to the next slot as a character is typed', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest />)
    await user.click(slots()[0] as HTMLInputElement)

    await user.keyboard('1')

    expect(document.activeElement).toBe(slots()[1])
  })

  it('clears the slot before on Backspace in an empty one, moving there', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest />)
    await user.click(slots()[0] as HTMLInputElement)
    await user.keyboard('12')

    await user.keyboard('{Backspace}')

    expect([slots().map((slot) => slot.value), document.activeElement]).toEqual([['1', '', ''], slots()[1]])
  })

  it('tells onComplete once every slot is filled, and again once the last is typed over', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ComponentUnderTest onComplete={onComplete} />)
    await user.click(slots()[0] as HTMLInputElement)
    await user.keyboard('123')
    act(() => slots()[2]?.focus())

    await user.keyboard('4')

    expect(onComplete.mock.calls).toEqual([['123'], ['124']])
  })

  it('asks the browser for a one-time code', () => {
    render(<ComponentUnderTest />)

    expect(slots()[0]?.getAttribute('autocomplete')).toBe('one-time-code')
  })

  it('marks its slots disabled and read-only', () => {
    const disabled = render(<ComponentUnderTest disabled />)
    const off = slots().every((slot) => slot.disabled)
    disabled.unmount()
    render(<ComponentUnderTest readOnly />)

    expect([off, slots().every((slot) => slot.readOnly)]).toEqual([true, true])
  })
})
