// From React Aria, packages/react-aria-components/test/Disclosure.test.js. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this accordion, its React Aria parts taken out. React Aria's
// DisclosureGroup is the accordion here. Left out, as Radix behaves otherwise: a repeat of Enter held down leaving
// the item as it was, where a button clicks on each repeat.

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '../index'

freshDom()

const expanded = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-expanded')

describe('React Aria disclosure', () => {
  it('shows a disabled item its controlled value opens', () => {
    render(
      <Accordion type="single" value="one">
        <AccordionItem value="one" disabled>
          <AccordionHeader>
            <AccordionTrigger>One</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>First</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect([expanded('One'), screen.queryByText('First') !== null]).toEqual(['true', true])
  })

  it('leaves its item as it is on a click of a button beside the trigger in its header', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger>One</AccordionTrigger>
            <button type="button">Settings</button>
          </AccordionHeader>
          <AccordionContent>First</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    fireEvent.click(screen.getByText('Settings'))

    expect(expanded('One')).toBe('false')
  })

  it('opens and closes an accordion inside an item without touching the outer one', () => {
    render(
      <Accordion type="single" collapsible defaultValue="outer">
        <AccordionItem value="outer">
          <AccordionHeader>
            <AccordionTrigger>Outer</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="inner">
                <AccordionHeader>
                  <AccordionTrigger>Inner</AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>Nested</AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    fireEvent.click(screen.getByText('Inner'))
    const opened = [expanded('Outer'), expanded('Inner')]
    fireEvent.click(screen.getByText('Inner'))

    expect([opened, [expanded('Outer'), expanded('Inner')]]).toEqual([
      ['true', 'true'],
      ['true', 'false'],
    ])
  })

  it('disables every item while the accordion is disabled', () => {
    render(
      <Accordion type="multiple" disabled>
        {['One', 'Two'].map((name) => (
          <AccordionItem key={name} value={name}>
            <AccordionHeader>
              <AccordionTrigger>{name}</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>{name} body</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>,
    )

    fireEvent.click(screen.getByText('One'))

    expect([
      screen.getAllByRole('button').map((button) => (button as HTMLButtonElement).disabled),
      expanded('One'),
    ]).toEqual([[true, true], 'false'])
  })
})
