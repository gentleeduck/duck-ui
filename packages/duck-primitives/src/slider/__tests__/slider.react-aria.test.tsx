// From React Aria, packages/react-aria-components/test/Slider.test.js. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this slider, its React Aria parts taken out. Left out: its
// composed NumberField and SliderFill, which have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { Slider, SliderRange, SliderThumb, SliderTrack } from '../index'

freshDom()

function Thumbs({ count, ...props }: React.ComponentProps<typeof Slider> & { count: number }) {
  return (
    <Slider aria-label="Range" {...props}>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      {Array.from({ length: count }, (_, index) => (
        <SliderThumb key={index} aria-label={`Thumb ${index + 1}`} />
      ))}
    </Slider>
  )
}

const values = () => screen.getAllByRole('slider').map((thumb) => thumb.getAttribute('aria-valuenow'))

describe('React Aria slider', () => {
  it('moves each of three thumbs on its own', () => {
    render(<Thumbs count={3} defaultValue={[10, 50, 90]} />)
    const [, middle] = screen.getAllByRole('slider') as HTMLElement[]

    act(() => middle?.focus())
    fireEvent.keyDown(middle as HTMLElement, { key: 'ArrowRight' })

    expect(values()).toEqual(['10', '51', '90'])
  })

  it('moves on each repeat of PageUp and PageDown held down', () => {
    render(<Thumbs count={1} defaultValue={[50]} />)
    const thumb = screen.getByRole('slider')
    act(() => thumb.focus())

    fireEvent.keyDown(thumb, { key: 'PageUp' })
    fireEvent.keyDown(thumb, { key: 'PageUp', repeat: true })
    const up = values()
    fireEvent.keyDown(thumb, { key: 'PageDown', repeat: true })

    expect([up, values()]).toEqual([['70'], ['60']])
  })

  it('hands its hidden inputs the form it names', () => {
    render(
      <>
        <form id="outside" />
        <Thumbs count={1} defaultValue={[50]} name="volume" form="outside" />
      </>,
    )

    expect((document.querySelector('input[name="volume"]') as HTMLInputElement | null)?.form?.id).toBe('outside')
  })
})
