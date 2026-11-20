import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion'
import {
  MotionAccordion,
  MotionAccordionContent,
  MotionAccordionItem,
  MotionAccordionTrigger,
} from '../motion-accordion'

interface IFound {
  attributes: Record<string, string>
  text: string
}

function markup(props: { renderOnce?: boolean } = {}) {
  const html = renderToStaticMarkup(
    <Accordion type="single" collapsible defaultValue="one" {...props}>
      <AccordionItem value="one">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>Three to five working days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Free within thirty days.</AccordionContent>
      </AccordionItem>
    </Accordion>,
  )

  const page = document.createElement('div')
  page.innerHTML = html
  return (selector: string): IFound[] =>
    Array.from(page.querySelectorAll(selector), (element) => ({
      attributes: Object.fromEntries(Array.from(element.attributes, ({ name, value }) => [name, value])),
      text: element.textContent ?? '',
    }))
}

describe('registry-ui accordion', () => {
  test('puts each trigger in a heading, with its chevron hidden from assistive technology', () => {
    const $ = markup()

    expect($('h3[data-slot="accordion-header"] > button[data-slot="accordion-trigger"]').length).toBe(2)
    expect($('[data-slot="accordion-icon"]').map((icon) => icon.attributes['aria-hidden'])).toEqual(['true', 'true'])
  })

  test('keeps closed content in the page, hidden until found', () => {
    const [open, closed] = markup()('[data-slot="accordion-content"]')

    expect(open.attributes.hidden).toBeUndefined()
    expect(closed.attributes.hidden).toBe('')
    expect(closed.text).toBe('Free within thirty days.')
  })

  test('animates content height from the size the primitive measures', () => {
    const [content] = markup()('[data-slot="accordion-content"]')
    const classes = content.attributes.class.split(' ')

    expect(classes).toContain('data-[state=open]:animate-accordion-down')
    expect(classes).toContain('data-[state=closed]:animate-accordion-up')
    expect(classes).toContain('[--radix-accordion-content-height:var(--gentleduck-accordion-content-height)]')
  })

  test('mounts content only once its item first opens with renderOnce', () => {
    const contents = markup({ renderOnce: true })('[data-slot="accordion-content"]')

    expect(contents.map((content) => content.text)).toEqual(['Three to five working days.'])
  })

  test('staggers motion items without putting the count on them', () => {
    const html = renderToStaticMarkup(
      <MotionAccordion type="single">
        <MotionAccordionItem value="one">
          <MotionAccordionTrigger>Shipping</MotionAccordionTrigger>
        </MotionAccordionItem>
        <MotionAccordionItem value="two">
          <MotionAccordionTrigger>Returns</MotionAccordionTrigger>
        </MotionAccordionItem>
      </MotionAccordion>,
    )

    expect(html.match(/data-slot="accordion-item"/g)?.length).toBe(2)
    expect(html).not.toContain('total=')
  })

  function motionMarkup(props: { renderOnce?: boolean } = {}) {
    return renderToStaticMarkup(
      <MotionAccordion type="single" defaultValue="one" {...props}>
        <MotionAccordionItem value="one">
          <MotionAccordionTrigger>Shipping</MotionAccordionTrigger>
          <MotionAccordionContent>Three to five working days.</MotionAccordionContent>
        </MotionAccordionItem>
        <MotionAccordionItem value="two">
          <MotionAccordionTrigger>Returns</MotionAccordionTrigger>
          <MotionAccordionContent>Free within thirty days.</MotionAccordionContent>
        </MotionAccordionItem>
      </MotionAccordion>,
    )
  }

  test('keeps closed motion content mounted and inert, for the height to animate from', () => {
    const contents = [...motionMarkup().matchAll(/<div[^>]*data-slot="accordion-content"[^>]*>/g)].map(([tag]) => tag)

    expect(contents.map((tag) => tag.includes('inert'))).toEqual([false, true])
    expect(motionMarkup()).toContain('Free within thirty days.')
  })

  test('mounts motion content only once its item first opens with renderOnce', () => {
    const html = motionMarkup({ renderOnce: true })

    expect([html.includes('Three to five working days.'), html.includes('Free within thirty days.')]).toEqual([
      true,
      false,
    ])
  })
})
