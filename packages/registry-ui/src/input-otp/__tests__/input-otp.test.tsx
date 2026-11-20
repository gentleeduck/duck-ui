import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../input-otp'
import { MotionInputOTP } from '../motion-input-otp'

afterEach(cleanup)

describe('registry-ui InputOTP', () => {
  test('draws a dot between groups unless the separator is given its own content', () => {
    const { container } = render(
      <InputOTP aria-label="Code" maxLength={2}>
        <InputOTPSlot />
        <InputOTPSeparator />
        <InputOTPSlot />
        <InputOTPSeparator>-</InputOTPSeparator>
      </InputOTP>,
    )
    const [dotted, dashed] = container.querySelectorAll('[data-slot="input-otp-separator"]')

    expect(dotted?.querySelector('svg.lucide-dot')).not.toBeNull()
    expect(dashed?.textContent).toBe('-')
  })
})

describe('registry-ui InputOTPGroup', () => {
  test('lays its slots out in a row, with the class it is handed', () => {
    render(
      <InputOTP aria-label="Code" maxLength={2}>
        <InputOTPGroup className="gap-1" data-testid="group">
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    )

    const group = screen.getByTestId('group')
    expect(group.className.split(' ')).toEqual(['flex', 'items-center', 'gap-1'])
    expect(group.querySelectorAll('input').length).toBe(2)
  })
})

describe('registry-ui MotionInputOTP', () => {
  test('scales in a working field, and reports the code once every slot is filled', () => {
    const onComplete = vi.fn()
    const { container } = render(
      <MotionInputOTP aria-label="Code" maxLength={2} onComplete={onComplete}>
        <InputOTPSlot />
        <InputOTPSlot />
      </MotionInputOTP>,
    )
    const [first, second] = Array.from(container.querySelectorAll('input'))

    fireEvent.keyDown(first as HTMLInputElement, { key: '4' })
    fireEvent.keyDown(second as HTMLInputElement, { key: '2' })

    expect(onComplete.mock.calls).toEqual([['42']])
    expect((container.firstElementChild as HTMLElement).style.transform).toContain('scale(')
  })
})
