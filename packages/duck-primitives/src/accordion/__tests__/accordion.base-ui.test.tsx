// From Base UI, packages/react/src/accordion/{root,item,header,trigger,panel}/*.test.tsx. MIT, see
// src/__tests__/base-ui/LICENSE. Base UI's Panel is the content here and `keepMounted` is `forceMount`. Left out: its
// cancelable event details, `data-index`, `data-panel-open`, non-native triggers and the warning about
// `hiddenUntilFound` beside `keepMounted={false}`, which have no counterpart; and the exit transition of a panel
// closing as another opens, which accordion.e2e.ts covers in a browser.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '../index'

freshDom()

function Single({
  triggerId,
  contentId,
  ...props
}: Partial<React.ComponentProps<typeof Accordion>> & { triggerId?: string; contentId?: string }) {
  return (
    <Accordion type="single" collapsible defaultValue="one" {...(props as object)}>
      <AccordionItem value="one">
        <AccordionHeader>
          <AccordionTrigger id={triggerId}>Trigger 1</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent id={contentId}>Panel 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionHeader>
          <AccordionTrigger>Trigger 2</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Panel 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const trigger = (name: string) => screen.getByRole('button', { name })

describe('Base UI accordion ids', () => {
  it('points its trigger at a content id given to it', () => {
    render(<Single contentId="panel-one" />)

    expect(trigger('Trigger 1').getAttribute('aria-controls')).toBe('panel-one')
  })

  it('names its content by a trigger id given to it', () => {
    render(<Single triggerId="trigger-one" />)

    expect(screen.getByRole('region', { name: 'Trigger 1' }).getAttribute('aria-labelledby')).toBe('trigger-one')
  })

  it('follows a trigger id added or changed later, and goes back to its own once it is taken away', () => {
    const { rerender } = render(<Single />)
    const region = () => screen.getByRole('region').getAttribute('aria-labelledby')
    const own = region()

    rerender(<Single triggerId="first" />)
    const added = region()
    rerender(<Single triggerId="second" />)
    const changed = region()
    rerender(<Single />)

    expect([added, changed, region()]).toEqual(['first', 'second', own])
    expect(document.getElementById(own ?? '')?.textContent).toBe('Trigger 1')
  })
})

describe('Base UI accordion parts', () => {
  let error: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    error = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    error.mockRestore()
  })

  it('throws for an item outside the accordion, and for a header outside an item', () => {
    expect(() => render(<AccordionItem value="one" />)).toThrow('must be used within')
    expect(() =>
      render(
        <Accordion type="single">
          <AccordionHeader />
        </Accordion>,
      ),
    ).toThrow('must be used within')
  })
})

describe('Base UI accordion disabled', () => {
  for (const part of ['accordion', 'item']) {
    it(`neither toggles nor tells onValueChange while the ${part} is disabled`, async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <Accordion type="single" collapsible disabled={part === 'accordion'} onValueChange={onValueChange}>
          <AccordionItem value="one" disabled={part === 'item'}>
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>Panel 1</AccordionContent>
          </AccordionItem>
        </Accordion>,
      )

      await user.click(trigger('Trigger 1'))

      expect([trigger('Trigger 1').getAttribute('aria-expanded'), onValueChange.mock.calls]).toEqual(['false', []])
    })
  }
})

describe('Base UI accordion keys', () => {
  for (const [name, key] of [
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ]) {
    it(`opens and closes an item on ${name}`, async () => {
      const user = userEvent.setup()
      render(<Single defaultValue={undefined} />)
      trigger('Trigger 2').focus()

      await user.keyboard(key)
      const opened = trigger('Trigger 2').getAttribute('aria-expanded')
      await user.keyboard(key)

      expect([opened, trigger('Trigger 2').getAttribute('aria-expanded')]).toEqual(['true', 'false'])
    })
  }
})
