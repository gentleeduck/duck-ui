// From Ark UI, packages/react/src/components/accordion/tests/accordion.test.tsx. MIT, see src/__tests__/ark/LICENSE.
// Ark's `lazyMount` is how content mounts here anyway, and `unmountOnExit` is the default; `onFocusChange` is in
// accordion.test.tsx. Left out: a trigger without `aria-controls` until its content mounts, where Radix keeps the
// reference, which axe accepts beside `aria-expanded="false"` and which is right for content kept hidden until found.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '../index'

freshDom()

const FRAMEWORKS = ['React', 'Solid', 'Vue']

function ComponentUnderTest({
  disabledItem,
  ...props
}: React.ComponentProps<typeof Accordion> & { disabledItem?: string }) {
  return (
    <Accordion {...props}>
      {FRAMEWORKS.map((name) => (
        <AccordionItem key={name} value={name} disabled={name === disabledItem}>
          <AccordionHeader>
            <AccordionTrigger>{name} Trigger</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>{name} Content</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

const trigger = (name: string) => screen.getByRole('button', { name: `${name} Trigger` })
const expanded = (name: string) => trigger(name).getAttribute('aria-expanded')

describe('Ark UI accordion', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest type="single" />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('opens no item by default', () => {
    render(<ComponentUnderTest type="single" />)

    expect(expanded('React')).toBe('false')
  })

  it('opens the item defaultValue names', () => {
    render(<ComponentUnderTest type="multiple" defaultValue={['Solid']} />)

    expect(expanded('Solid')).toBe('true')
  })

  it('closes an open item on a click when collapsible', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest type="single" collapsible />)

    await user.click(trigger('React'))
    const opened = expanded('React')
    await user.click(trigger('React'))

    expect([opened, expanded('React')]).toEqual(['true', 'false'])
  })

  it('keeps the open item open on a click when not collapsible', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest type="single" defaultValue="React" />)

    await user.click(trigger('React'))

    expect(expanded('React')).toBe('true')
  })

  it('leaves a disabled item shut on a click', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest type="single" disabledItem="React" />)

    await user.click(trigger('React'))

    expect([expanded('React'), trigger('React').hasAttribute('data-disabled')]).toEqual(['false', true])
  })

  it('disables every item while the accordion is disabled', () => {
    render(<ComponentUnderTest type="single" disabled />)

    expect(FRAMEWORKS.map((name) => trigger(name).hasAttribute('data-disabled'))).toEqual([true, true, true])
  })

  it('opens several items at once when multiple', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest type="multiple" />)

    await user.click(trigger('React'))
    await user.click(trigger('Solid'))

    expect([expanded('React'), expanded('Solid')]).toEqual(['true', 'true'])
  })

  it('tells onValueChange the value an item click opens', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ComponentUnderTest type="single" onValueChange={onValueChange} />)

    await user.click(trigger('React'))

    expect(onValueChange).toHaveBeenCalledWith('React')
  })

  it('writes the direction it is given', () => {
    const { container } = render(<ComponentUnderTest type="single" dir="rtl" />)

    expect(container.querySelector('[data-slot="accordion"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('moves focus to the next and previous trigger on ArrowDown and ArrowUp', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest type="single" />)
    await user.click(trigger('React'))

    await user.keyboard('{ArrowDown}')
    const down = document.activeElement
    await user.keyboard('{ArrowUp}')

    expect([down, document.activeElement]).toEqual([trigger('Solid'), trigger('React')])
  })

  it('moves focus to the first and last trigger on Home and End', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest type="single" />)
    await user.click(trigger('Solid'))

    await user.keyboard('{End}')
    const end = document.activeElement
    await user.keyboard('{Home}')

    expect([end, document.activeElement]).toEqual([trigger('Vue'), trigger('React')])
  })

  it('moves focus to the next trigger on Tab', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest type="single" />)
    await user.click(trigger('React'))

    await user.tab()

    expect(document.activeElement).toBe(trigger('Solid'))
  })

  it('mounts the content of an item only while it is open', async () => {
    const user = userEvent.setup()
    render(<ComponentUnderTest type="single" collapsible />)
    const before = screen.queryByText('React Content')

    await user.click(trigger('React'))
    const opened = screen.queryByText('React Content')
    await user.click(trigger('React'))

    expect([before, opened?.textContent, screen.queryByText('React Content')]).toEqual([null, 'React Content', null])
  })
})
