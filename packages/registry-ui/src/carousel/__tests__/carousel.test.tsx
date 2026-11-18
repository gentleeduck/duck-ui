import { describe, expect, test } from 'bun:test'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DirectionProvider } from '../../direction'
import { Carousel, CarouselNext, CarouselPrevious } from '../carousel'

describe('registry-ui carousel', () => {
  test('CarouselPrevious prefers a provided icon over the default arrow icon', () => {
    const html = renderToStaticMarkup(
      <Carousel>
        <CarouselPrevious icon={<span data-icon="custom-prev">P</span>} />
      </Carousel>,
    )

    expect(html).toContain('data-icon="custom-prev"')
    expect(html).not.toContain('lucide-arrow-left')
  })

  test('CarouselNext still renders the default arrow icon when no icon is provided', () => {
    const html = renderToStaticMarkup(
      <Carousel>
        <CarouselNext />
      </Carousel>,
    )

    expect(html).toContain('lucide-arrow-right')
  })

  test('Carousel follows the surrounding direction and mirrors horizontal arrows', () => {
    const html = renderToStaticMarkup(
      <DirectionProvider dir="rtl">
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      </DirectionProvider>,
    )

    expect(html).toContain('dir="rtl"')
    expect(html).toContain('rtl:rotate-180')
  })

  test('vertical arrows are not mirrored, so they keep pointing up and down in RTL', () => {
    const html = renderToStaticMarkup(
      <DirectionProvider dir="rtl">
        <Carousel orientation="vertical">
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </DirectionProvider>,
    )

    expect(html).not.toContain('rtl:rotate-180')
  })
})
