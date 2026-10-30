import { describe, expect, it, mock } from 'bun:test'
import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPHiddenInput,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from '../index'

freshDom()

const nextTick = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))

describe('InputOTP', () => {
  it('renders with data-slot="input-otp"', () => {
    const { container } = render(
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelector('[data-slot="input-otp"]')).not.toBeNull()
  })

  it('renders correct number of slots', () => {
    const { container } = render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]').length).toBe(6)
  })

  it('renders a group with data-slot="input-otp-group" and the group role', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelector('[data-slot="input-otp-group"]')?.getAttribute('role')).toBe('group')
  })

  it('slots render input elements', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
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
          <InputOTPSlot />
          <InputOTPSlot />
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
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
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
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(container.querySelector('.my-otp')).not.toBeNull()
  })

  it('defaults to ltr direction', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
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
    expect(fireEvent.keyDown(slots[1]!, { key: 'ArrowRight' })).toBe(false)
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

describe('InputOTP pattern', () => {
  it('refuses a key the pattern does not accept', () => {
    const { container } = render(
      <InputOTP maxLength={2} pattern={REGEXP_ONLY_DIGITS}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    )
    const first = container.querySelector<HTMLInputElement>('input[data-input-otp-slot]')!

    expect(fireEvent.keyDown(first, { key: 'a' })).toBe(false)
    expect(first.value).toBe('')
  })
})

describe('InputOTPSeparator', () => {
  it('is hidden from assistive technology', () => {
    render(<InputOTPSeparator data-testid="separator">-</InputOTPSeparator>)
    const separator = screen.getByTestId('separator')

    expect(separator.getAttribute('role')).toBe('presentation')
    expect(separator.getAttribute('aria-hidden')).toBe('true')
    expect(separator.textContent).toBe('-')
  })
})

describe('InputOTP reporting the code', () => {
  it('reports the whole code as each digit is typed', () => {
    const onValueChange = mock()
    const { container } = render(
      <InputOTP maxLength={3} onValueChange={onValueChange}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    )
    const [first, second] = Array.from(container.querySelectorAll('input'))

    fireEvent.keyDown(first as HTMLInputElement, { key: '4' })
    fireEvent.keyDown(second as HTMLInputElement, { key: '2' })

    expect(onValueChange.mock.calls).toEqual([['4'], ['42']])
  })
})

function Code(props: Omit<React.ComponentProps<typeof InputOTP>, 'children'>) {
  return (
    <InputOTP maxLength={4} {...props}>
      <InputOTPSlot />
      <InputOTPSlot />
      <InputOTPSlot />
      <InputOTPSlot />
    </InputOTP>
  )
}

const slotsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[data-input-otp-slot]'))
const valuesOf = (container: HTMLElement) => slotsOf(container).map((slot) => slot.value)

describe('InputOTP root', () => {
  it('is a group with no label of its own', () => {
    const { container } = render(<Code />)
    const root = container.querySelector('[data-slot="input-otp"]')

    expect(root?.getAttribute('role')).toBe('group')
    expect(root?.hasAttribute('aria-label')).toBe(false)
  })

  it('lets a role and a label passed to it win', () => {
    const { container } = render(<Code role="region" aria-label="Verification code" />)
    const root = container.querySelector('[data-slot="input-otp"]')

    expect(root?.getAttribute('role')).toBe('region')
    expect(root?.getAttribute('aria-label')).toBe('Verification code')
  })
})

describe('InputOTP value', () => {
  it('shows a default value across the slots', () => {
    const { container } = render(<Code defaultValue="12" />)

    expect(valuesOf(container)).toEqual(['1', '2', '', ''])
  })

  it('follows a controlled value', () => {
    const { container, rerender } = render(<Code value="12" />)
    rerender(<Code value="987" />)

    expect(valuesOf(container)).toEqual(['9', '8', '7', ''])
  })

  it('keeps a controlled value the owner does not change', () => {
    const onValueChange = mock()
    const { container } = render(<Code value="1" onValueChange={onValueChange} />)
    const [, second] = slotsOf(container)

    fireEvent.keyDown(second as HTMLInputElement, { key: '2' })

    expect(onValueChange.mock.calls).toEqual([['12']])
    expect(valuesOf(container)).toEqual(['1', '', '', ''])
  })

  it('puts a key typed past the code into the first empty slot', () => {
    const { container } = render(<Code defaultValue="1" />)
    const slots = slotsOf(container)

    fireEvent.keyDown(slots[3] as HTMLInputElement, { key: '2' })

    expect(valuesOf(container)).toEqual(['1', '2', '', ''])
    expect(document.activeElement).toBe(slots[2] as HTMLInputElement)
  })

  it('replaces the character in a filled slot', () => {
    const { container } = render(<Code defaultValue="123" />)
    const slots = slotsOf(container)

    fireEvent.keyDown(slots[1] as HTMLInputElement, { key: '9' })

    expect(valuesOf(container)).toEqual(['1', '9', '3', ''])
    expect(document.activeElement).toBe(slots[2] as HTMLInputElement)
  })

  it('selects the character of a slot that takes focus', () => {
    const { container } = render(<Code defaultValue="12" />)
    const first = slotsOf(container)[0] as HTMLInputElement

    act(() => first.focus())

    expect([first.selectionStart, first.selectionEnd]).toEqual([0, 1])
  })
})

describe('InputOTP deleting', () => {
  it('Backspace in an empty slot removes the character before it and moves there', () => {
    const onValueChange = mock()
    const { container } = render(<Code defaultValue="123" onValueChange={onValueChange} />)
    const slots = slotsOf(container)

    expect(fireEvent.keyDown(slots[3] as HTMLInputElement, { key: 'Backspace' })).toBe(false)

    expect(onValueChange.mock.calls).toEqual([['12']])
    expect(valuesOf(container)).toEqual(['1', '2', '', ''])
    expect(document.activeElement).toBe(slots[2] as HTMLInputElement)
  })

  it('Backspace in a filled slot removes its character and stays', () => {
    const { container } = render(<Code defaultValue="1234" />)
    const slots = slotsOf(container)

    fireEvent.keyDown(slots[3] as HTMLInputElement, { key: 'Backspace' })

    expect(valuesOf(container)).toEqual(['1', '2', '3', ''])
    expect(document.activeElement).toBe(slots[3] as HTMLInputElement)
  })

  it('Backspace with nothing typed changes nothing', () => {
    const onValueChange = mock()
    const { container } = render(<Code onValueChange={onValueChange} />)

    fireEvent.keyDown(slotsOf(container)[0] as HTMLInputElement, { key: 'Backspace' })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('Delete removes the character in the slot and closes the gap', () => {
    const { container } = render(<Code defaultValue="123" />)
    const slots = slotsOf(container)

    fireEvent.keyDown(slots[1] as HTMLInputElement, { key: 'Delete' })

    expect(valuesOf(container)).toEqual(['1', '3', '', ''])
    expect(document.activeElement).toBe(slots[1] as HTMLInputElement)
  })

  it('Delete in an empty slot changes nothing', () => {
    const onValueChange = mock()
    const { container } = render(<Code defaultValue="1" onValueChange={onValueChange} />)

    fireEvent.keyDown(slotsOf(container)[2] as HTMLInputElement, { key: 'Delete' })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('leaves a key with a modifier to the browser', () => {
    const { container } = render(<Code defaultValue="12" />)

    expect(fireEvent.keyDown(slotsOf(container)[1] as HTMLInputElement, { key: 'Backspace', metaKey: true })).toBe(true)
    expect(valuesOf(container)).toEqual(['1', '2', '', ''])
  })
})

describe('InputOTP keys and fields it does not own', () => {
  it('leaves Tab, Enter and the other named keys to the browser', () => {
    const { container } = render(<Code defaultValue="12" />)
    const second = slotsOf(container)[1] as HTMLInputElement

    const handled = ['Tab', 'Enter', 'Shift', 'F5'].map((key) => fireEvent.keyDown(second, { key }))

    expect([handled, valuesOf(container)]).toEqual([
      [true, true, true, true],
      ['1', '2', '', ''],
    ])
  })

  it('leaves a field inside it that is not a slot to itself', () => {
    const onValueChange = mock()
    render(
      <InputOTP maxLength={2} onValueChange={onValueChange}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
        <input aria-label="Note" />
      </InputOTP>,
    )
    const note = screen.getByLabelText('Note') as HTMLInputElement

    fireEvent.input(note, { target: { value: 'x' } })
    const pasteHandled = fireEvent.paste(note, { clipboardData: { getData: () => '12' } })

    expect([note.value, pasteHandled, onValueChange.mock.calls]).toEqual(['x', true, []])
  })

  it('renders through asChild to a component that drops its ref', () => {
    function NoRef({ ref: _ref, ...props }: React.ComponentProps<'div'>) {
      return <div {...props} />
    }
    const { container } = render(
      <InputOTP maxLength={2} asChild>
        <NoRef>
          <InputOTPSlot />
          <InputOTPSlot />
        </NoRef>
      </InputOTP>,
    )

    expect(slotsOf(container).length).toBe(2)
  })
})

describe('InputOTP pasting and autofill', () => {
  it('pastes only the characters the pattern accepts, as far as the slots go, in place of the browser', () => {
    const onComplete = mock()
    const { container } = render(<Code onComplete={onComplete} pattern={REGEXP_ONLY_DIGITS} />)
    const slots = slotsOf(container)

    const pasted = fireEvent.paste(slots[0] as HTMLInputElement, { clipboardData: { getData: () => '1-2-3-4-5' } })

    expect(pasted).toBe(false)
    expect(valuesOf(container)).toEqual(['1', '2', '3', '4'])
    expect(onComplete.mock.calls).toEqual([['1234']])
    expect(document.activeElement).toBe(slots[3] as HTMLInputElement)
  })

  it('pastes from the slot that has focus', () => {
    const { container } = render(<Code defaultValue="12" />)

    fireEvent.paste(slotsOf(container)[1] as HTMLInputElement, { clipboardData: { getData: () => '89' } })

    expect(valuesOf(container)).toEqual(['1', '8', '9', ''])
  })

  it('spreads a code autofilled into one slot across all of them', () => {
    const onValueChange = mock()
    const { container } = render(<Code onValueChange={onValueChange} />)
    const first = slotsOf(container)[0] as HTMLInputElement

    fireEvent.input(first, { target: { value: '4821' } })

    expect(onValueChange.mock.calls).toEqual([['4821']])
    expect(valuesOf(container)).toEqual(['4', '8', '2', '1'])
  })

  it('keeps only the character an on-screen keyboard types beside the one a slot holds', () => {
    const { container } = render(<Code defaultValue="12" />)
    const [first, second] = slotsOf(container)

    fireEvent.input(first as HTMLInputElement, { target: { value: '19' } })
    fireEvent.input(second as HTMLInputElement, { target: { value: '72' } })

    expect(valuesOf(container)).toEqual(['9', '7', '', ''])
  })

  it('takes a character an on-screen keyboard types without a key event', () => {
    const { container } = render(<Code defaultValue="1" />)
    const second = slotsOf(container)[1] as HTMLInputElement

    fireEvent.input(second, { target: { value: '7' } })

    expect(valuesOf(container)).toEqual(['1', '7', '', ''])
  })

  it('undoes a character typed that the pattern refuses', () => {
    const onValueChange = mock()
    const { container } = render(<Code defaultValue="1" pattern={REGEXP_ONLY_DIGITS} onValueChange={onValueChange} />)
    const second = slotsOf(container)[1] as HTMLInputElement

    fireEvent.input(second, { target: { value: 'x' } })

    expect(onValueChange).not.toHaveBeenCalled()
    expect(second.value).toBe('')
  })

  it('removes a character an on-screen keyboard deletes', () => {
    const { container } = render(<Code defaultValue="12" />)

    fireEvent.input(slotsOf(container)[1] as HTMLInputElement, { target: { value: '' } })

    expect(valuesOf(container)).toEqual(['1', '', '', ''])
  })
})

describe('InputOTP onComplete', () => {
  it('reports the code once the last slot is filled', () => {
    const onComplete = mock()
    const { container } = render(<Code defaultValue="123" onComplete={onComplete} />)
    const slots = slotsOf(container)

    fireEvent.keyDown(slots[2] as HTMLInputElement, { key: '9' })
    expect(onComplete).not.toHaveBeenCalled()

    fireEvent.keyDown(slots[3] as HTMLInputElement, { key: '4' })
    expect(onComplete.mock.calls).toEqual([['1294']])
  })

  it('stays quiet when a full code is typed over with the same character', () => {
    const onComplete = mock()
    const { container } = render(<Code defaultValue="1234" onComplete={onComplete} />)

    fireEvent.keyDown(slotsOf(container)[3] as HTMLInputElement, { key: '4' })

    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('InputOTP disabled and read-only', () => {
  it('disables every slot', () => {
    const { container } = render(<Code disabled />)

    expect(slotsOf(container).every((slot) => slot.disabled)).toBe(true)
    expect(container.querySelector('[data-slot="input-otp"]')?.hasAttribute('data-disabled')).toBe(true)
  })

  it('keeps a read-only code as it is but lets focus move', () => {
    const onValueChange = mock()
    const { container } = render(<Code defaultValue="12" readOnly onValueChange={onValueChange} />)
    const slots = slotsOf(container)

    fireEvent.keyDown(slots[2] as HTMLInputElement, { key: '3' })
    fireEvent.keyDown(slots[1] as HTMLInputElement, { key: 'Backspace' })
    fireEvent.paste(slots[0] as HTMLInputElement, { clipboardData: { getData: () => '99' } })
    fireEvent.keyDown(slots[0] as HTMLInputElement, { key: 'ArrowRight' })

    expect(onValueChange).not.toHaveBeenCalled()
    expect(slots.every((slot) => slot.readOnly)).toBe(true)
    expect(document.activeElement).toBe(slots[1] as HTMLInputElement)
  })
})

describe('InputOTP slot disabled or read-only on its own', () => {
  it('disables or makes read-only the slot given the prop, and leaves the others', () => {
    const { container } = render(
      <InputOTP maxLength={3}>
        <InputOTPSlot disabled />
        <InputOTPSlot readOnly />
        <InputOTPSlot />
      </InputOTP>,
    )

    expect(slotsOf(container).map((slot) => [slot.disabled, slot.readOnly])).toEqual([
      [true, false],
      [false, true],
      [false, false],
    ])
  })

  it('keeps a slot read-only on its own from a key and a paste', () => {
    const onValueChange = mock()
    const { container } = render(
      <InputOTP maxLength={3} onValueChange={onValueChange}>
        <InputOTPSlot readOnly />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTP>,
    )
    const slots = slotsOf(container)

    fireEvent.keyDown(slots[0] as HTMLInputElement, { key: '5' })
    fireEvent.paste(slots[0] as HTMLInputElement, { clipboardData: { getData: () => '99' } })

    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('InputOTP slots', () => {
  it('masks every slot when the type is password', () => {
    const { container } = render(<Code type="password" />)

    expect(slotsOf(container).map((slot) => slot.type)).toEqual(['password', 'password', 'password', 'password'])
  })

  it('opens the numeric keyboard for a digits-only code', () => {
    const { container, rerender } = render(<Code pattern={REGEXP_ONLY_DIGITS} />)
    expect(slotsOf(container)[0]?.inputMode).toBe('numeric')

    rerender(<Code />)
    expect(slotsOf(container)[0]?.hasAttribute('inputmode')).toBe(false)
  })

  it('gives Tab one stop, the slot typing goes to, which follows the code', () => {
    const { container, rerender } = render(<Code value="12" />)
    const stops = () => slotsOf(container).map((slot) => slot.tabIndex)
    const before = stops()

    rerender(<Code value="1234" />)

    expect([before, stops()]).toEqual([
      [-1, -1, 0, -1],
      [-1, -1, -1, 0],
    ])
  })

  it('keeps a tab stop a slot was given itself', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPSlot tabIndex={3} />
        <InputOTPSlot />
      </InputOTP>,
    )

    expect(slotsOf(container).map((slot) => slot.tabIndex)).toEqual([3, -1])
  })

  it('numbers the slots without replacing a label of their own', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPSlot aria-label="First" />
        <InputOTPSlot />
      </InputOTP>,
    )

    expect(slotsOf(container).map((slot) => slot.getAttribute('aria-label'))).toEqual(['First', 'Digit 2'])
  })

  it('lets a label given later replace the number', () => {
    const Labelled = ({ label }: { label?: string }) => (
      <InputOTP maxLength={1}>
        <InputOTPSlot aria-label={label} />
      </InputOTP>
    )
    const { container, rerender } = render(<Labelled />)
    rerender(<Labelled label="Code" />)

    expect(slotsOf(container)[0]?.getAttribute('aria-label')).toBe('Code')
  })

  it('renumbers the slots it labelled when one is added before them', () => {
    const Slots = ({ keys }: { keys: string[] }) => (
      <InputOTP>
        {keys.map((key) => (
          <InputOTPSlot key={key} data-key={key} />
        ))}
      </InputOTP>
    )
    const { container, rerender } = render(<Slots keys={['b']} />)
    rerender(<Slots keys={['a', 'b']} />)

    expect(container.querySelector('[data-key="b"]')?.getAttribute('aria-label')).toBe('Digit 2')
  })

  it('leaves slots past maxLength out of the code', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTP>,
    )

    fireEvent.paste(slotsOf(container)[0] as HTMLInputElement, { clipboardData: { getData: () => '1234' } })

    expect(valuesOf(container)).toEqual(['1', '2', ''])
  })
})

describe('InputOTPHiddenInput', () => {
  it('holds the code under the name the root gives it', () => {
    const { container } = render(
      <InputOTP maxLength={2} name="code" defaultValue="4">
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPHiddenInput form="login" />
      </InputOTP>,
    )
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]')

    expect([hidden?.name, hidden?.value, hidden?.getAttribute('form')]).toEqual(['code', '4', 'login'])

    fireEvent.keyDown(slotsOf(container)[1] as HTMLInputElement, { key: '2' })
    expect(hidden?.value).toBe('42')
  })

  it('takes a name of its own over the root', () => {
    const { container } = render(
      <InputOTP name="code">
        <InputOTPHiddenInput name="otp" />
      </InputOTP>,
    )

    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.name).toBe('otp')
  })

  it('is disabled with its root, so a form leaves the code out', () => {
    const { container } = render(
      <InputOTP maxLength={2} name="code" defaultValue="42" disabled>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPHiddenInput />
      </InputOTP>,
    )

    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.disabled).toBe(true)
  })
})

describe('InputOTP patterns', () => {
  it('REGEXP_ONLY_DIGITS_AND_CHARS takes letters and digits and nothing else', () => {
    expect(['a', 'Z', '5'].map((char) => REGEXP_ONLY_DIGITS_AND_CHARS.test(char))).toEqual([true, true, true])
    expect([',', ' ', '-', 'ab'].map((char) => REGEXP_ONLY_DIGITS_AND_CHARS.test(char))).toEqual([
      false,
      false,
      false,
      false,
    ])
  })

  it('REGEXP_ONLY_CHARS takes letters only', () => {
    expect(['a', 'Z', '5', ','].map((char) => REGEXP_ONLY_CHARS.test(char))).toEqual([true, true, false, false])
  })
})

describe('InputOTP autoSubmit', () => {
  function Form({
    autoSubmit,
    onSubmit,
  }: {
    autoSubmit?: boolean
    onSubmit: (code: FormDataEntryValue | null) => void
  }) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          // The runner's global FormData is not the DOM's and reads no fields from a form.
          onSubmit(new window.FormData(event.currentTarget).get('code'))
        }}>
        <InputOTP maxLength={3} name="code" autoSubmit={autoSubmit}>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPHiddenInput />
        </InputOTP>
      </form>
    )
  }

  it('submits its form with the whole code once the last slot is filled', () => {
    const onSubmit = mock()
    const { container } = render(<Form autoSubmit onSubmit={onSubmit} />)
    const slots = slotsOf(container)

    fireEvent.keyDown(slots[0] as HTMLInputElement, { key: '1' })
    fireEvent.keyDown(slots[1] as HTMLInputElement, { key: '2' })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.keyDown(slots[2] as HTMLInputElement, { key: '3' })

    expect(onSubmit.mock.calls).toEqual([['123']])
  })

  it('waits for the code to be complete when its owner refuses the last character', () => {
    const onSubmit = mock()
    const Refusing = () => (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}>
        <InputOTP maxLength={3} value="12" onValueChange={() => {}} autoSubmit>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTP>
      </form>
    )
    const { container, rerender } = render(<Refusing />)

    fireEvent.keyDown(slotsOf(container)[2] as HTMLInputElement, { key: '3' })
    rerender(<Refusing />)

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('leaves the form alone without autoSubmit', () => {
    const onSubmit = mock()
    const { container } = render(<Form onSubmit={onSubmit} />)

    fireEvent.paste(slotsOf(container)[0] as HTMLInputElement, { clipboardData: { getData: () => '123' } })

    expect(valuesOf(container)).toEqual(['1', '2', '3'])
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('InputOTP in a form', () => {
  function Form({
    button,
    defaultValue,
    onReset,
    onSubmit = () => {},
  }: {
    button?: React.ReactNode
    defaultValue?: string
    onReset?: (event: React.FormEvent<HTMLFormElement>) => void
    onSubmit?: (code: FormDataEntryValue | null) => void
  }) {
    return (
      <form
        onReset={onReset}
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(new window.FormData(event.currentTarget).get('code'))
        }}>
        <InputOTP defaultValue={defaultValue} maxLength={3} name="code">
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPHiddenInput />
        </InputOTP>
        {button}
      </form>
    )
  }

  const reset = (container: HTMLElement) => act(() => container.querySelector('form')?.reset())
  const hiddenValue = (container: HTMLElement) =>
    container.querySelector<HTMLInputElement>('[data-slot="input-otp-hidden-input"]')?.value

  it('goes back to its default code when the form is reset', async () => {
    const { container } = render(<Form defaultValue="1" />)
    fireEvent.keyDown(slotsOf(container)[1] as HTMLInputElement, { key: '2' })
    fireEvent.keyDown(slotsOf(container)[2] as HTMLInputElement, { key: '3' })

    reset(container)
    await nextTick()

    expect(valuesOf(container)).toEqual(['1', '', ''])
    expect(hiddenValue(container)).toBe('1')
  })

  it('shows its default code again after a reset that left the code as it was', async () => {
    const { container } = render(<Form defaultValue="12" />)

    reset(container)
    await nextTick()

    expect(valuesOf(container)).toEqual(['1', '2', ''])
  })

  it('reports an empty code to its owner when the form is reset', async () => {
    const onValueChange = mock()
    const { container } = render(
      <form>
        <Code value="12" onValueChange={onValueChange} />
      </form>,
    )

    reset(container)
    await nextTick()

    expect(onValueChange.mock.calls).toEqual([['']])
    expect(valuesOf(container)).toEqual(['1', '2', '', ''])
  })

  it('keeps its code when the reset is cancelled', async () => {
    const { container } = render(<Form defaultValue="1" onReset={(event) => event.preventDefault()} />)
    fireEvent.keyDown(slotsOf(container)[1] as HTMLInputElement, { key: '2' })

    reset(container)
    await nextTick()

    expect(valuesOf(container)).toEqual(['1', '2', ''])
    expect(hiddenValue(container)).toBe('12')
  })

  it('stops listening for the form reset once it unmounts', async () => {
    const onValueChange = mock()
    const { container, rerender } = render(
      <form>
        <Code value="12" onValueChange={onValueChange} />
      </form>,
    )
    rerender(<form />)

    reset(container)
    await nextTick()

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('submits the form on Enter, as the only field of a form with no submit button does', () => {
    const onSubmit = mock()
    const { container } = render(<Form defaultValue="12" onSubmit={onSubmit} />)

    fireEvent.keyDown(slotsOf(container)[2] as HTMLInputElement, { key: 'Enter' })

    expect(onSubmit.mock.calls).toEqual([['12']])
  })

  it('leaves Enter to the browser in a form with a submit button of any kind, which the browser presses', () => {
    const onSubmit = mock()
    const buttons = [
      <button key="submit" type="submit">
        Verify
      </button>,
      // biome-ignore lint/a11y/useButtonType: a button with no type submits, which is the case under test.
      <button key="untyped">Verify</button>,
      <input alt="Verify" key="image" type="image" />,
    ]

    for (const button of buttons) {
      const { container, unmount } = render(<Form button={button} defaultValue="12" onSubmit={onSubmit} />)
      expect(fireEvent.keyDown(slotsOf(container)[2] as HTMLInputElement, { key: 'Enter' })).toBe(true)
      unmount()
    }

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the form on Enter when its only button resets it', () => {
    const onSubmit = mock()
    const { container } = render(
      <Form button={<button type="reset">Clear</button>} defaultValue="12" onSubmit={onSubmit} />,
    )

    fireEvent.keyDown(slotsOf(container)[2] as HTMLInputElement, { key: 'Enter' })

    expect(onSubmit.mock.calls).toEqual([['12']])
  })

  it('does nothing on Enter outside a form', () => {
    const { container } = render(<Code defaultValue="12" />)

    expect(fireEvent.keyDown(slotsOf(container)[1] as HTMLInputElement, { key: 'Enter' })).toBe(true)
  })
})

describe('InputOTP handlers of its own', () => {
  const preventing = (calls: string[], name: string) => (event: React.SyntheticEvent) => {
    calls.push(name)
    event.preventDefault()
  }

  it('calls its own key, input and paste handlers first, and changes nothing when they prevent the default', () => {
    const calls: string[] = []
    const onValueChange = mock()
    const { container } = render(
      <Code
        onInput={preventing(calls, 'input')}
        onKeyDown={preventing(calls, 'keydown')}
        onPaste={preventing(calls, 'paste')}
        onValueChange={onValueChange}
      />,
    )
    const slot = slotsOf(container)[0] as HTMLInputElement

    fireEvent.keyDown(slot, { key: '1' })
    fireEvent.input(slot, { target: { value: '2' } })
    fireEvent.paste(slot, { clipboardData: { getData: () => '34' } })

    expect(calls).toEqual(['keydown', 'input', 'paste'])
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('calls its own focus handler first, and selects nothing when it prevents the default', () => {
    const calls: string[] = []
    const { container } = render(<Code defaultValue="12" onFocus={preventing(calls, 'focus')} />)
    const slot = slotsOf(container)[0] as HTMLInputElement
    slot.setSelectionRange(1, 1)

    act(() => slot.focus())

    expect(calls).toEqual(['focus'])
    expect([slot.selectionStart, slot.selectionEnd]).toEqual([1, 1])
  })

  it('calls its own pointer handlers first, and keeps no press, or forgets none, when they prevent the default', () => {
    const calls: string[] = []
    const { container } = render(
      <Code
        defaultValue="1"
        onPointerCancel={preventing(calls, 'pointercancel')}
        onPointerDown={(event) => {
          calls.push('pointerdown')
          if (event.target === slotsOf(container)[3]) event.preventDefault()
        }}
      />,
    )
    const slots = slotsOf(container)

    fireEvent.pointerDown(slots[3] as HTMLInputElement)
    act(() => (slots[3] as HTMLInputElement).focus())

    expect(document.activeElement).toBe(slots[3] as HTMLInputElement)

    fireEvent.pointerDown(slots[2] as HTMLInputElement)
    fireEvent.pointerCancel(slots[2] as HTMLInputElement)
    act(() => (slots[2] as HTMLInputElement).focus())

    expect(calls).toEqual(['pointerdown', 'pointerdown', 'pointercancel'])
    expect(document.activeElement).toBe(slots[1] as HTMLInputElement)
  })
})

describe('InputOTP pressed', () => {
  it('puts the caret in the first empty slot when a slot past the end of the code is pressed', () => {
    const { container } = render(<Code defaultValue="1" />)
    const slots = slotsOf(container)

    fireEvent.pointerDown(slots[2] as HTMLInputElement)
    act(() => (slots[2] as HTMLInputElement).focus())

    expect(document.activeElement).toBe(slots[1] as HTMLInputElement)
  })

  it('lets an arrow key reach a slot past the end of the code after a press there sent the caret back', () => {
    const { container } = render(<Code defaultValue="1" />)
    const slots = slotsOf(container)
    fireEvent.pointerDown(slots[3] as HTMLInputElement)
    act(() => (slots[3] as HTMLInputElement).focus())

    act(() => (slots[3] as HTMLInputElement).focus())

    expect(document.activeElement).toBe(slots[3] as HTMLInputElement)
  })

  it('lets a press on a filled slot or the first empty one take focus there', () => {
    const { container } = render(<Code defaultValue="12" />)
    const slots = slotsOf(container)

    for (const index of [0, 2]) {
      fireEvent.pointerDown(slots[index] as HTMLInputElement)
      act(() => (slots[index] as HTMLInputElement).focus())

      expect(document.activeElement).toBe(slots[index] as HTMLInputElement)
    }
  })

  it('lets an arrow key reach a slot past the end of the code, after a press there that turned into a scroll', () => {
    const { container } = render(<Code defaultValue="1" />)
    const slots = slotsOf(container)
    fireEvent.pointerDown(slots[3] as HTMLInputElement)
    fireEvent.pointerCancel(slots[3] as HTMLInputElement)

    act(() => (slots[3] as HTMLInputElement).focus())

    expect(document.activeElement).toBe(slots[3] as HTMLInputElement)
  })
})

describe('InputOTP autofill', () => {
  it('offers a code from a message to every slot, and a slot can turn it off', () => {
    const { container } = render(
      <InputOTP maxLength={2}>
        <InputOTPSlot />
        <InputOTPSlot autoComplete="off" />
      </InputOTP>,
    )

    expect(slotsOf(container).map((slot) => slot.getAttribute('autocomplete'))).toEqual(['one-time-code', 'off'])
  })
})
