import { describe, expect, it } from 'bun:test'
import { act, fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS } from '../index'

const nextTick = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))

describe('InputOTP', () => {
  it('renders with data-slot="input-otp"', () => {
    const { container } = render(
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelector('[data-slot="input-otp"]')).not.toBeNull()
  })

  it('renders correct number of slots', () => {
    const { container } = render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]').length).toBe(6)
  })

  it('renders group with data-slot="input-otp-group"', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelector('[data-slot="input-otp-group"]')).not.toBeNull()
  })

  it('slots render input elements', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelectorAll('input').length).toBeGreaterThan(0)
  })

  it('exports REGEXP_ONLY_DIGITS', () => {
    expect(REGEXP_ONLY_DIGITS).toBeInstanceOf(RegExp)
    expect(REGEXP_ONLY_DIGITS.test('5')).toBe(true)
    expect(REGEXP_ONLY_DIGITS.test('a')).toBe(false)
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <InputOTP ref={ref} maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('REGEXP_ONLY_DIGITS rejects special chars', () => {
    expect(REGEXP_ONLY_DIGITS.test('!')).toBe(false)
    expect(REGEXP_ONLY_DIGITS.test(' ')).toBe(false)
    expect(REGEXP_ONLY_DIGITS.test('')).toBe(false)
  })

  it('REGEXP_ONLY_DIGITS accepts all digits', () => {
    for (let i = 0; i <= 9; i++) {
      expect(REGEXP_ONLY_DIGITS.test(String(i))).toBe(true)
    }
  })

  it('renders correct slot data attributes', () => {
    const { container } = render(
      <InputOTP maxLength={3}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>,
    )
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]')
    expect(slots.length).toBe(3)
  })

  it('passes className to root', () => {
    const { container } = render(
      <InputOTP maxLength={2} className="my-otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelector('.my-otp')).not.toBeNull()
  })

  it('defaults to ltr direction', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelector('[data-slot="input-otp"]')?.getAttribute('dir')).toBe('ltr')
  })

  it('ArrowRight moves to the next slot in LTR', async () => {
    const { container } = render(
      <InputOTP maxLength={3}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    )
    const slots = container.querySelectorAll('input')
    slots[1]!.focus()
    fireEvent.keyDown(slots[1]!, { key: 'ArrowRight' })
    await nextTick()
    expect(document.activeElement).toBe(slots[2]!)
  })

  it('flips arrow navigation under a DirectionProvider without a dir prop', async () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <InputOTP maxLength={3}>
          <InputOTPGroup>
            <InputOTPSlot />
            <InputOTPSlot />
            <InputOTPSlot />
          </InputOTPGroup>
        </InputOTP>
      </DirectionProvider>,
    )
    expect(container.querySelector('[data-slot="input-otp"]')?.getAttribute('dir')).toBe('rtl')
    const slots = container.querySelectorAll('input')
    slots[1]!.focus()
    fireEvent.keyDown(slots[1]!, { key: 'ArrowLeft' })
    await nextTick()
    expect(document.activeElement).toBe(slots[2]!)
    fireEvent.keyDown(slots[2]!, { key: 'ArrowRight' })
    await nextTick()
    expect(document.activeElement).toBe(slots[1]!)
  })
})
