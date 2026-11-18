import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { Slider, SliderRange, SliderThumb, SliderTrack } from '../index'

function renderSlider(props: Record<string, unknown> = {}) {
  return render(
    <Slider {...props}>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb />
    </Slider>,
  )
}

describe('Slider', () => {
  it('renders with data-slot="slider"', () => {
    const { container } = renderSlider()
    expect(container.querySelector('[data-slot="slider"]')).not.toBeNull()
  })

  it('renders track with data-slot="slider-track"', () => {
    const { container } = renderSlider()
    expect(container.querySelector('[data-slot="slider-track"]')).not.toBeNull()
  })

  it('renders range with data-slot="slider-range"', () => {
    const { container } = renderSlider()
    expect(container.querySelector('[data-slot="slider-range"]')).not.toBeNull()
  })

  it('renders thumb with role="slider"', () => {
    const { container } = renderSlider()
    expect(container.querySelector('[role="slider"]')).not.toBeNull()
  })

  it('thumb has aria-valuemin, aria-valuemax, aria-valuenow', () => {
    const { container } = renderSlider({ min: 0, max: 100, defaultValue: [50] })
    const thumb = container.querySelector('[role="slider"]')!
    expect(thumb.getAttribute('aria-valuemin')).toBe('0')
    expect(thumb.getAttribute('aria-valuemax')).toBe('100')
    expect(thumb.getAttribute('aria-valuenow')).toBe('50')
  })

  it('defaults to min=0 max=100 value=[0]', () => {
    const { container } = renderSlider()
    const thumb = container.querySelector('[role="slider"]')!
    expect(thumb.getAttribute('aria-valuemin')).toBe('0')
    expect(thumb.getAttribute('aria-valuemax')).toBe('100')
  })

  it('supports horizontal orientation by default', () => {
    const { container } = renderSlider()
    const thumb = container.querySelector('[role="slider"]')!
    expect(thumb.getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('supports vertical orientation', () => {
    const { container } = renderSlider({ orientation: 'vertical' })
    const thumb = container.querySelector('[role="slider"]')!
    expect(thumb.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('disabled slider has data-disabled on all parts', () => {
    const { container } = renderSlider({ disabled: true })
    expect(container.querySelector('[data-slot="slider"]')?.getAttribute('data-disabled')).toBe('')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <Slider ref={ref}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>,
    )
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('custom min/max range', () => {
    const { container } = renderSlider({ min: 10, max: 50, defaultValue: [30] })
    const thumb = container.querySelector('[role="slider"]')!
    expect(thumb.getAttribute('aria-valuemin')).toBe('10')
    expect(thumb.getAttribute('aria-valuemax')).toBe('50')
    expect(thumb.getAttribute('aria-valuenow')).toBe('30')
  })

  it('multiple thumbs render multiple sliders', () => {
    const { container } = render(
      <Slider defaultValue={[25, 75]}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
        <SliderThumb />
      </Slider>,
    )
    const thumbs = container.querySelectorAll('[role="slider"]')
    expect(thumbs.length).toBe(2)
    expect(thumbs[0]!.getAttribute('aria-valuenow')).toBe('25')
    expect(thumbs[1]!.getAttribute('aria-valuenow')).toBe('75')
  })

  it('slider renders as span elements', () => {
    const { container } = renderSlider()
    expect(container.querySelector('span[data-slot="slider"]')).not.toBeNull()
    expect(container.querySelector('span[data-slot="slider-track"]')).not.toBeNull()
  })

  it('passes className', () => {
    const { container } = render(
      <Slider className="custom-slider">
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>,
    )
    expect(container.querySelector('.custom-slider')).not.toBeNull()
  })

  it('sets dir attribute', () => {
    const { container } = renderSlider({ dir: 'rtl' })
    expect(container.querySelector('[data-slot="slider"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('ArrowRight increases and ArrowLeft decreases in LTR', () => {
    const { container } = renderSlider({ defaultValue: [50] })
    const thumb = container.querySelector('[role="slider"]')!
    fireEvent.keyDown(thumb, { key: 'ArrowRight' })
    expect(thumb.getAttribute('aria-valuenow')).toBe('51')
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
    expect(thumb.getAttribute('aria-valuenow')).toBe('49')
  })

  it('flips horizontal arrow keys under a DirectionProvider without a dir prop', () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <Slider defaultValue={[50]}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </DirectionProvider>,
    )
    const thumb = container.querySelector('[role="slider"]')!
    expect(container.querySelector('[data-slot="slider"]')?.getAttribute('dir')).toBe('rtl')
    fireEvent.keyDown(thumb, { key: 'ArrowRight' })
    expect(thumb.getAttribute('aria-valuenow')).toBe('49')
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
    expect(thumb.getAttribute('aria-valuenow')).toBe('51')
    fireEvent.keyDown(thumb, { key: 'ArrowUp' })
    expect(thumb.getAttribute('aria-valuenow')).toBe('52')
  })

  it('anchors the range and thumb to the right edge in RTL', () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <Slider defaultValue={[25]}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </DirectionProvider>,
    )
    const range = container.querySelector('[data-slot="slider-range"]') as HTMLElement
    expect(range.style.right).toBe('0%')
    expect(range.style.left).toBe('75%')
    const thumbWrapper = container.querySelector('[role="slider"]')!.parentElement as HTMLElement
    expect(thumbWrapper.style.right).not.toBe('')
    expect(thumbWrapper.style.left).toBe('')
  })
})
