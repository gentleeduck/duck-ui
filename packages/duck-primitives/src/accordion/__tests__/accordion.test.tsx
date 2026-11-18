import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../index'

function renderAccordion(props: Record<string, unknown> = {}) {
  return render(
    <Accordion {...props}>
      <AccordionItem value="one">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
    </Accordion>,
  )
}

describe('Accordion', () => {
  it('renders root with data-slot="accordion"', () => {
    const { container } = renderAccordion()
    expect(container.querySelector('[data-slot="accordion"]')).not.toBeNull()
  })

  it('renders triggers with data-slot="accordion-trigger"', () => {
    const { container } = renderAccordion()
    expect(container.querySelectorAll('[data-slot="accordion-trigger"]').length).toBe(2)
  })

  it('does not render content when closed by default', () => {
    const { container } = renderAccordion()
    expect(container.querySelector('[data-slot="accordion-content"]')).toBeNull()
  })

  it('renders defaultValue content for single accordions', () => {
    const { container } = renderAccordion({ defaultValue: 'one' })
    const trigger = container.querySelector('[data-slot="accordion-trigger"]')!
    const content = container.querySelector('[data-slot="accordion-content"]')!

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(content.textContent).toBe('Content 1')
    expect(content.getAttribute('role')).toBe('region')
  })

  it('toggles a single item open and closed on click', () => {
    const { container } = renderAccordion()
    const trigger = container.querySelector('[data-slot="accordion-trigger"]')!

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('[data-slot="accordion-content"]')?.textContent).toBe('Content 1')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('[data-slot="accordion-content"]')).toBeNull()
  })

  it('keeps force-mounted content in the DOM while closed', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent forceMount>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    const content = container.querySelector('[data-slot="accordion-content"]')!
    expect(content.getAttribute('data-state')).toBe('closed')
    expect(content.getAttribute('aria-hidden')).toBe('true')
  })

  it('calls onValueChange when a single item opens', () => {
    const onValueChange = mock(() => {})
    const { container } = renderAccordion({ onValueChange })

    fireEvent.click(container.querySelector('[data-slot="accordion-trigger"]')!)
    expect(onValueChange).toHaveBeenCalledWith('one')
  })

  it('forwards refs to the trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()

    render(
      <Accordion>
        <AccordionItem value="one">
          <AccordionTrigger ref={ref}>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
