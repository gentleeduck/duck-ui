// From React Aria, packages/react-aria-components/test/Select.test.js. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this select, its React Aria parts taken out. Left out, as Radix
// behaves otherwise: a select with no items refusing to open. Its `shouldCloseOnSelect`, validation and falsy keys
// have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from '../index'

freshDom()

Element.prototype.scrollIntoView ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}

function Fruits({
  fruits = ['Banana', 'Boisenberry', 'Bblackberry', 'Blueberry'],
  ...props
}: Omit<React.ComponentProps<typeof Select>, 'children'> & { fruits?: string[]; autoFocus?: boolean }) {
  const { autoFocus, ...selectProps } = props
  return (
    <Select {...(selectProps as object)}>
      {/* biome-ignore lint/a11y/noAutofocus: autoFocus on the trigger is what one case is about */}
      <SelectTrigger aria-label="Fruit" autoFocus={autoFocus}>
        <SelectValue placeholder="Pick" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectViewport>
            {fruits.map((fruit) => (
              <SelectItem key={fruit} value={fruit.toLowerCase()}>
                <SelectItemText>{fruit}</SelectItemText>
              </SelectItem>
            ))}
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </Select>
  )
}

const trigger = () => screen.getByRole('combobox', { name: 'Fruit', hidden: true })

describe('React Aria select typeahead on the closed trigger', () => {
  it('picks the next item starting with a letter typed twice quickly, not one starting with it twice', async () => {
    const user = userEvent.setup()
    render(<Fruits />)
    await user.tab()

    await user.keyboard('bb')

    expect(trigger().textContent).toBe('Boisenberry')
  })

  it('moves on to the next item on the same letter typed again after a pause', async () => {
    const user = userEvent.setup()
    render(<Fruits />)
    await user.tab()

    await user.keyboard('b')
    await act(() => new Promise((resolve) => setTimeout(resolve, 1100)))
    await user.keyboard('b')

    expect(trigger().textContent).toBe('Boisenberry')
  })

  it('wraps to the first match once no item after the picked one matches', async () => {
    const user = userEvent.setup()
    render(<Fruits defaultValue="blueberry" />)
    await user.tab()

    await user.keyboard('b')

    expect(trigger().textContent).toBe('Banana')
  })
})

describe('React Aria select', () => {
  it('focuses its trigger with autoFocus', () => {
    render(<Fruits autoFocus />)

    expect(document.activeElement).toBe(trigger())
  })

  it('moves on each repeat of an arrow key held down in the open list', async () => {
    render(<Fruits />)
    act(() => trigger().focus())
    fireEvent.keyDown(trigger(), { key: 'Enter' })
    await wait(0)

    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' })
    await wait(0)
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown', repeat: true })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Bblackberry')
  })

  it('disables its native select while disabled', () => {
    render(
      <form>
        <Fruits name="fruit" disabled />
      </form>,
    )

    expect((document.querySelector('select[name="fruit"]') as HTMLSelectElement).disabled).toBe(true)
  })

  it('goes back to its default value on a reset of its form, given no name', async () => {
    render(
      <form data-testid="form">
        <Fruits defaultValue="banana" />
      </form>,
    )
    act(() => trigger().focus())
    fireEvent.keyDown(trigger(), { key: 'Enter' })
    await wait(0)
    fireEvent.click(screen.getByRole('option', { name: 'Blueberry' }))
    const picked = trigger().textContent

    act(() => (screen.getByTestId('form') as HTMLFormElement).reset())
    await wait(0)

    expect([picked, trigger().textContent]).toEqual(['Blueberry', 'Banana'])
  })
})
