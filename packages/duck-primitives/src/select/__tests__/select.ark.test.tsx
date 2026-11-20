// From Ark UI, packages/react/src/components/select/tests/select.test.tsx. MIT, see src/__tests__/ark/LICENSE.
// Left out: `readOnly`, which has no counterpart, and Ark's Field, whose helper and error text have none either.

import { fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
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

if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}

const ITEMS = ['React', 'Solid', 'Vue']

function ComponentUnderTest(props: Omit<React.ComponentProps<typeof Select>, 'children'>) {
  return (
    <Select {...(props as object)}>
      <SelectTrigger aria-label="Framework">
        <SelectValue placeholder="Select a framework" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectViewport>
            {ITEMS.map((item) => (
              <SelectItem key={item} value={item}>
                <SelectItemText>{item}</SelectItemText>
              </SelectItem>
            ))}
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </Select>
  )
}

// An open select hides the page from assistive technology, its trigger included.
const trigger = () => screen.getByRole('combobox', { name: 'Framework', hidden: true })
const open = async () => {
  fireEvent.pointerDown(trigger(), { button: 0, ctrlKey: false, pointerType: 'mouse' })
  await wait(0)
}

describe('Ark UI select', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows the item picked on its trigger, and closes on the pick', async () => {
    const onValueChange = vi.fn()
    render(<ComponentUnderTest onValueChange={onValueChange} />)
    await open()

    fireEvent.click(screen.getByRole('option', { name: 'Solid' }))

    expect([trigger().textContent, screen.queryByRole('listbox'), onValueChange.mock.calls]).toEqual([
      'Solid',
      null,
      [['Solid']],
    ])
  })

  it('stays shut while disabled', async () => {
    render(<ComponentUnderTest disabled />)

    await open()

    expect([trigger().hasAttribute('disabled'), screen.queryByRole('listbox')]).toEqual([true, null])
  })

  it('picks several items when multiple, staying open', async () => {
    render(<ComponentUnderTest multiple />)
    await open()

    fireEvent.click(screen.getByRole('option', { name: 'React' }))
    fireEvent.click(screen.getByRole('option', { name: 'Vue' }))

    expect([trigger().textContent, screen.queryByRole('listbox') !== null]).toEqual(['React, Vue', true])
  })

  it('opens when its owner tells it to through onOpenChange', async () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <ComponentUnderTest open={open} onOpenChange={setOpen} />
        </>
      )
    }
    render(<Controlled />)

    fireEvent.click(screen.getByText('Open'))
    await wait(0)

    expect(screen.queryByRole('listbox')).not.toBeNull()
  })

  it('mounts its items only while open, and unmounts them on close', async () => {
    render(<ComponentUnderTest />)
    const before = screen.queryByRole('option', { name: 'Solid' })
    await open()
    const opened = screen.queryByRole('option', { name: 'Solid' }) !== null

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })
    await wait(0)

    expect([before, opened, screen.queryByRole('option', { name: 'Solid' })]).toEqual([null, true, null])
  })

  it('marks its trigger required for assistive technology', () => {
    render(<ComponentUnderTest required />)

    expect(trigger().getAttribute('aria-required')).toBe('true')
  })

  it('focuses its trigger on a click of the label naming it', () => {
    render(
      <>
        <label htmlFor="framework">Framework</label>
        <Select>
          <SelectTrigger id="framework">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
        </Select>
      </>,
    )

    fireEvent.click(screen.getByText('Framework'))

    expect(document.activeElement?.id).toBe('framework')
  })
})
