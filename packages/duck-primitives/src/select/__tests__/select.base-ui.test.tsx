// From Base UI, packages/react/src/select/{value,item,trigger}/*.test.tsx. MIT, see src/__tests__/base-ui/LICENSE.
// Base UI's `items` on Value is `items` on the root here. Left out, as Radix behaves otherwise: a disabled item
// taking focus. Its null and object values, `itemToString`, `alignItemWithTrigger`, actionsRef, Field, Form and
// cancelable event details have no counterpart.

import { fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
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

const FRUITS = ['Apple', 'Banana', 'Cherry']

function Fruits({
  valueProps,
  disabledItem,
  onItemClick,
  ...props
}: Omit<React.ComponentProps<typeof Select>, 'children'> & {
  valueProps?: React.ComponentProps<typeof SelectValue>
  disabledItem?: string
  onItemClick?: () => void
}) {
  return (
    <Select {...(props as object)}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" {...valueProps} />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectViewport>
            {FRUITS.map((fruit) => (
              <SelectItem
                key={fruit}
                value={fruit.toLowerCase()}
                disabled={fruit === disabledItem}
                onClick={onItemClick}>
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
const option = (name: string) => screen.getByRole('option', { name })
const isOpen = () => screen.queryByRole('listbox') !== null
const open = async () => {
  fireEvent.pointerDown(trigger(), { button: 0, ctrlKey: false, pointerType: 'mouse' })
  await wait(0)
}

describe('Base UI select value', () => {
  it('shows its placeholder with nothing picked, and the pick once there is one', () => {
    const { rerender } = render(<Fruits />)
    const empty = trigger().textContent

    rerender(<Fruits defaultValue="banana" key="picked" />)

    expect([empty, trigger().textContent]).toEqual(['Pick a fruit', 'Banana'])
  })

  it('shows the children it is given over the label and the placeholder', () => {
    render(<Fruits defaultValue="banana" valueProps={{ children: 'Custom' }} />)

    expect(trigger().textContent).toBe('Custom')
  })

  it('hands a render function the values picked', () => {
    render(
      <Fruits multiple defaultValue={['apple', 'cherry']} valueProps={{ children: (values) => values.join(' + ') }} />,
    )

    expect(trigger().textContent).toBe('apple + cherry')
  })

  it('shows the label items give, and changes it as the value does', () => {
    const items = FRUITS.map((fruit) => ({ value: fruit.toLowerCase(), label: `${fruit} label` }))
    const { rerender } = render(<Fruits items={items} value="apple" />)
    const first = trigger().textContent

    rerender(<Fruits items={items} value="cherry" />)

    expect([first, trigger().textContent]).toEqual(['Apple label', 'Cherry label'])
  })

  it('shows its placeholder with nothing picked when multiple', () => {
    render(<Fruits multiple />)

    expect(trigger().textContent).toBe('Pick a fruit')
  })
})

describe('Base UI select items', () => {
  it('picks an item clicked and closes', async () => {
    const onValueChange = vi.fn()
    render(<Fruits onValueChange={onValueChange} />)
    await open()

    fireEvent.click(option('Cherry'))

    expect([onValueChange.mock.calls, isOpen()]).toEqual([[['cherry']], false])
  })

  it('picks no disabled item, neither on a click nor on Enter', async () => {
    const onValueChange = vi.fn()
    render(<Fruits disabledItem="Banana" onValueChange={onValueChange} />)
    await open()

    fireEvent.click(option('Banana'))
    fireEvent.keyDown(option('Banana'), { key: 'Enter' })

    expect(onValueChange.mock.calls).toEqual([])
  })

  it('takes its disabled state from the root', () => {
    render(<Fruits disabled />)

    expect([(trigger() as HTMLButtonElement).disabled, trigger().hasAttribute('data-disabled')]).toEqual([true, true])
  })

  it('runs the onClick of an item once per click', async () => {
    const onItemClick = vi.fn()
    render(<Fruits onItemClick={onItemClick} />)
    await open()

    fireEvent.click(option('Apple'))

    expect(onItemClick).toHaveBeenCalledTimes(1)
  })

  it('focuses the picked item as it opens', async () => {
    render(<Fruits defaultValue="cherry" />)

    await open()

    expect(document.activeElement).toBe(option('Cherry'))
  })

  it('picks the item a press of the trigger is dragged onto and released over, and no disabled one', async () => {
    const onValueChange = vi.fn()
    render(<Fruits disabledItem="Banana" onValueChange={onValueChange} />)
    fireEvent.pointerDown(trigger(), { button: 0, ctrlKey: false, pointerType: 'mouse', clientX: 10, clientY: 10 })
    await wait(0)

    fireEvent.pointerMove(option('Banana'), { pointerType: 'mouse', clientX: 10, clientY: 60 })
    fireEvent.pointerUp(option('Banana'), { pointerType: 'mouse', clientX: 10, clientY: 60 })
    const afterDisabled = onValueChange.mock.calls.length
    fireEvent.pointerMove(option('Cherry'), { pointerType: 'mouse', clientX: 10, clientY: 90 })
    fireEvent.pointerUp(option('Cherry'), { pointerType: 'mouse', clientX: 10, clientY: 90 })

    expect([afterDisabled, onValueChange.mock.calls]).toEqual([0, [['cherry']]])
  })

  it('picks nothing on a mouse up that follows a touch', async () => {
    const onValueChange = vi.fn()
    render(<Fruits onValueChange={onValueChange} />)
    fireEvent.pointerDown(trigger(), { button: 0, ctrlKey: false, pointerType: 'touch' })
    fireEvent.click(trigger())
    await wait(0)

    fireEvent.pointerUp(option('Cherry'), { pointerType: 'touch' })
    fireEvent.mouseUp(option('Cherry'))

    expect(onValueChange.mock.calls).toEqual([])
  })
})
