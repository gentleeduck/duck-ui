// From React Aria, packages/react-aria-components/test/RadioGroup.test.js. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this radio group, its React Aria parts and render props taken
// out. Left out, as Radix behaves otherwise: Enter on a radio submitting its form. Its help text, validation and
// input refs have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { RadioGroup, RadioGroupItem } from '../index'

freshDom()

const nextTick = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))
const checked = () => screen.queryByRole('radio', { checked: true })?.textContent ?? null

describe('React Aria radio group', () => {
  it('moves on each repeat of an arrow key held down', async () => {
    render(
      <RadioGroup aria-label="Pets" defaultValue="dog">
        <RadioGroupItem value="dog">Dog</RadioGroupItem>
        <RadioGroupItem value="cat">Cat</RadioGroupItem>
        <RadioGroupItem value="dragon">Dragon</RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Dog').focus())

    fireEvent.keyDown(screen.getByText('Dog'), { key: 'ArrowDown' })
    await nextTick()
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown', repeat: true })
    await nextTick()

    expect(checked()).toBe('Dragon')
  })

  it('passes over an element in the group that is not a radio on the arrow keys', async () => {
    render(
      <RadioGroup aria-label="Pets" defaultValue="dog">
        <RadioGroupItem value="dog">Dog</RadioGroupItem>
        <a href="#help">Help</a>
        <RadioGroupItem value="cat">Cat</RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Dog').focus())

    fireEvent.keyDown(screen.getByText('Dog'), { key: 'ArrowRight' })
    await nextTick()

    expect([document.activeElement?.textContent, checked()]).toEqual(['Cat', 'Cat'])
  })

  it('fires onFocus once for clicks in turn on one radio, and onBlur as focus moves to another', async () => {
    const user = userEvent.setup()
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(
      <RadioGroup aria-label="Pets">
        <RadioGroupItem value="dog" onFocus={onFocus} onBlur={onBlur}>
          Dog
        </RadioGroupItem>
        <RadioGroupItem value="cat">Cat</RadioGroupItem>
      </RadioGroup>,
    )

    await user.click(screen.getByText('Dog'))
    await user.click(screen.getByText('Dog'))
    await user.click(screen.getByText('Dog'))
    const focused = onFocus.mock.calls.length
    await user.click(screen.getByText('Cat'))

    expect([focused, onBlur.mock.calls.length]).toEqual([1, 1])
  })

  it('takes an aria-describedby given to a radio', () => {
    render(
      <>
        <p id="hint">Pick the one you have.</p>
        <RadioGroup aria-label="Pets">
          <RadioGroupItem value="dog" aria-describedby="hint">
            Dog
          </RadioGroupItem>
        </RadioGroup>
      </>,
    )

    expect(screen.getByRole('radio', { description: 'Pick the one you have.' }).textContent).toBe('Dog')
  })
})
