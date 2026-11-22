import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion'
import {
  MotionAccordion,
  MotionAccordionContent,
  MotionAccordionItem,
  MotionAccordionTrigger,
} from '../motion-accordion'

afterEach(cleanup)

describe('registry-ui accordion in the page', () => {
  test('with renderOnce, mounts closed content once its item first opens and keeps it after', () => {
    render(
      <Accordion type="single" collapsible renderOnce>
        <AccordionItem value="one">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent>Three to five working days.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    expect(screen.queryByText('Three to five working days.')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Shipping' }))
    fireEvent.click(screen.getByRole('button', { name: 'Shipping' }))

    expect(screen.getByText('Three to five working days.', { selector: 'div' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('aria-expanded')).toBe('false')
  })

  test('with renderOnce, mounts motion content once its item first opens and keeps it after', () => {
    render(
      <MotionAccordion type="single" collapsible renderOnce>
        <MotionAccordionItem value="one">
          <MotionAccordionTrigger>Shipping</MotionAccordionTrigger>
          <MotionAccordionContent>Three to five working days.</MotionAccordionContent>
        </MotionAccordionItem>
      </MotionAccordion>,
    )
    expect(screen.queryByText('Three to five working days.')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Shipping' }))
    fireEvent.click(screen.getByRole('button', { name: 'Shipping' }))

    expect(screen.getByText('Three to five working days.')).toBeTruthy()
  })

  test('passes a child that is not a motion item through as it is', () => {
    render(
      <MotionAccordion type="single">
        <p>Questions</p>
        <MotionAccordionItem value="one">
          <MotionAccordionTrigger>Shipping</MotionAccordionTrigger>
          <MotionAccordionContent>Three to five working days.</MotionAccordionContent>
        </MotionAccordionItem>
      </MotionAccordion>,
    )

    expect(screen.getByText('Questions').tagName).toBe('P')
  })
})
