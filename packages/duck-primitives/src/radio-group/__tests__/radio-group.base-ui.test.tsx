// From Base UI, packages/react/src/radio-group/RadioGroup.test.tsx and radio/root/RadioRoot.test.tsx. MIT, see
// src/__tests__/base-ui/LICENSE. Left out, as Radix behaves otherwise: a disabled radio marked aria-disabled rather
// than disabled, and kept as the tab stop while checked; and an arrow key checking a radio with no click, where a
// native radio clicks, and its ancestors hear it. Its `inputRef`, `nativeButton`, cancelable event details, Field and
// Form have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { RadioGroup, RadioGroupItem } from '../index'

freshDom()

const nextTick = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))
const checked = () => screen.queryByRole('radio', { checked: true })?.textContent ?? null

function Group(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup aria-label="Fruit" {...props}>
      <RadioGroupItem value="a">A</RadioGroupItem>
      <RadioGroupItem value="b">B</RadioGroupItem>
      <RadioGroupItem value="c">C</RadioGroupItem>
    </RadioGroup>
  )
}

describe('Base UI radio group keys', () => {
  it('checks a radio on Space, and not on Enter', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Group onValueChange={onValueChange} />)
    act(() => screen.getByText('B').focus())

    await user.keyboard('{Enter}')
    const afterEnter = checked()
    await user.keyboard(' ')

    expect([afterEnter, checked(), onValueChange.mock.calls]).toEqual([null, 'B', [['b']]])
  })
})

describe('Base UI radio group as a whole', () => {
  it('marks itself disabled for assistive technology, and only while disabled', () => {
    const { rerender } = render(<Group disabled />)
    const disabled = screen.getByRole('radiogroup').getAttribute('aria-disabled')

    rerender(<Group />)

    expect([disabled, screen.getByRole('radiogroup').hasAttribute('aria-disabled')]).toEqual(['true', false])
  })

  it('takes no tab stop while disabled', () => {
    render(<Group disabled />)

    expect(screen.getAllByRole('radio').every((radio) => (radio as HTMLButtonElement).disabled)).toBe(true)
  })

  it('lets Tab reach the checked radio once the focused one is removed', async () => {
    const user = userEvent.setup()
    const group = (withB: boolean) => (
      <>
        <button type="button">Before</button>
        <RadioGroup aria-label="Fruit" defaultValue="a">
          <RadioGroupItem value="a">A</RadioGroupItem>
          {withB ? <RadioGroupItem value="b">B</RadioGroupItem> : null}
        </RadioGroup>
      </>
    )
    const { rerender } = render(group(true))
    act(() => screen.getByText('B').focus())
    rerender(group(false))
    await nextTick()
    act(() => screen.getByText('Before').focus())

    await user.tab()

    expect(document.activeElement?.textContent).toBe('A')
  })
})

describe('Base UI radio group with a native label', () => {
  it('checks the radio a label wraps, on a click of the label', () => {
    render(
      <RadioGroup aria-label="Fruit">
        <label>
          <RadioGroupItem value="a" aria-label="A" />
          Apple
        </label>
      </RadioGroup>,
    )

    fireEvent.click(screen.getByText('Apple'))

    expect(screen.getByRole('radio', { name: 'A' }).getAttribute('aria-checked')).toBe('true')
  })

  it('checks the radio a label names by its id, on a click of the label', () => {
    render(
      <RadioGroup aria-label="Fruit">
        <RadioGroupItem value="a" id="apple" />
        <label htmlFor="apple">Apple</label>
      </RadioGroup>,
    )

    fireEvent.click(screen.getByText('Apple'))

    expect(screen.getByRole('radio', { name: 'Apple' }).getAttribute('aria-checked')).toBe('true')
  })
})

describe('Base UI radio group clicks', () => {
  it('hands each click to the elements around it once', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      // biome-ignore lint/a11y/useKeyWithClickEvents: the click only counts what reaches it
      // biome-ignore lint/a11y/noStaticElementInteractions: the click only counts what reaches it
      <div onClick={onClick}>
        <Group />
      </div>,
    )

    await user.click(screen.getByText('B'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('Base UI radio group in a form', () => {
  function Form({ disabledItem, onSubmit }: { disabledItem?: boolean; onSubmit: (value: unknown) => void }) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(new FormData(event.currentTarget).get('fruit'))
        }}>
        <RadioGroup aria-label="Fruit" name="fruit" defaultValue="b">
          <RadioGroupItem value="a">A</RadioGroupItem>
          <RadioGroupItem value="b" disabled={disabledItem}>
            B
          </RadioGroupItem>
        </RadioGroup>
        <button type="submit">Submit</button>
      </form>
    )
  }

  it('submits nothing with no radio checked', () => {
    const onSubmit = vi.fn()
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(new FormData(event.currentTarget).get('fruit'))
        }}>
        <Group name="fruit" />
        <button type="submit">Submit</button>
      </form>,
    )

    fireEvent.click(screen.getByText('Submit'))

    expect(onSubmit.mock.calls).toEqual([[null]])
  })

  it('leaves a disabled checked radio out of what it submits, and puts it back once enabled', () => {
    const onSubmit = vi.fn()
    const { rerender } = render(<Form disabledItem onSubmit={onSubmit} />)
    fireEvent.click(screen.getByText('Submit'))

    rerender(<Form onSubmit={onSubmit} />)
    fireEvent.click(screen.getByText('Submit'))

    expect(onSubmit.mock.calls).toEqual([[null], ['b']])
  })
})
