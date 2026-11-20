// From Ark UI, packages/react/src/components/slider/tests/slider.test.tsx. MIT, see src/__tests__/ark/LICENSE.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { axe } from '../../__tests__/radix/harness'
import { DirectionProvider } from '../../direction'
import { Slider, SliderRange, SliderThumb, SliderTrack } from '../index'

freshDom()

function ComponentUnderTest({ thumbs = 1, ...props }: React.ComponentProps<typeof Slider> & { thumbs?: number }) {
  return (
    <Slider aria-label="Volume" {...props}>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      {Array.from({ length: thumbs }, (_, index) => (
        <SliderThumb key={index} aria-label={`Thumb ${index + 1}`} />
      ))}
    </Slider>
  )
}

const thumb = (index = 0) => screen.getAllByRole('slider')[index] as HTMLElement
const now = (index = 0) => thumb(index).getAttribute('aria-valuenow')
const press = (key: string, init: { shiftKey?: boolean } = {}, index = 0) => {
  act(() => thumb(index).focus())
  fireEvent.keyDown(thumb(index), { key, ...init })
}

describe('Ark UI slider', () => {
  it('has no axe violations', async () => {
    const { container } = render(<ComponentUnderTest defaultValue={[50]} />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('moves with the arrow keys', () => {
    render(<ComponentUnderTest defaultValue={[50]} />)

    const seen: Array<string | null> = []
    for (const key of ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown']) {
      press(key)
      seen.push(now())
    }

    expect(seen).toEqual(['51', '52', '51', '50'])
  })

  // Radix lets the thumbs cross by default, so a gap between them is asked for, as Ark keeps one.
  it('keeps one thumb from passing the other with a gap between them', () => {
    render(<ComponentUnderTest thumbs={2} defaultValue={[40, 42]} minStepsBetweenThumbs={1} />)

    press('ArrowRight', {}, 0)
    press('ArrowRight', {}, 0)

    expect([now(0), now(1)]).toEqual(['41', '42'])
  })

  it('moves the other way with the horizontal arrows in right to left', () => {
    render(
      <DirectionProvider dir="rtl">
        <ComponentUnderTest defaultValue={[50]} />
      </DirectionProvider>,
    )

    press('ArrowRight')
    const right = now()
    press('ArrowLeft')
    press('ArrowLeft')

    expect([right, now()]).toEqual(['49', '51'])
  })

  it('moves up on ArrowUp and down on ArrowDown when vertical', () => {
    render(<ComponentUnderTest orientation="vertical" defaultValue={[50]} />)

    press('ArrowUp')
    const up = now()
    press('ArrowDown')
    press('ArrowDown')

    expect([up, now()]).toEqual(['51', '49'])
  })

  it('stays put while disabled', () => {
    render(<ComponentUnderTest disabled defaultValue={[50]} />)

    press('ArrowRight')

    expect([now(), thumb().hasAttribute('data-disabled')]).toEqual(['50', true])
  })

  it('tells onValueChange each value', () => {
    const onValueChange = vi.fn()
    render(<ComponentUnderTest defaultValue={[50]} onValueChange={onValueChange} />)

    press('ArrowRight')
    press('ArrowRight')

    expect(onValueChange.mock.calls).toEqual([[[51]], [[52]]])
  })

  it('takes ten steps at once on Shift with an arrow and on PageUp and PageDown, or the largeStep it is given', () => {
    const { unmount } = render(<ComponentUnderTest defaultValue={[50]} step={2} />)
    press('ArrowRight', { shiftKey: true })
    const shifted = now()
    press('PageDown')
    const paged = now()
    unmount()
    render(<ComponentUnderTest defaultValue={[50]} largeStep={5} />)

    press('ArrowRight', { shiftKey: true })

    expect([shifted, paged, now()]).toEqual(['70', '50', '55'])
  })
})
