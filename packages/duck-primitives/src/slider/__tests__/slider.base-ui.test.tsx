// From Base UI, packages/react/src/slider/{root,thumb}/*.test.tsx. MIT, see src/__tests__/base-ui/LICENSE. Base UI's
// `minStepsBetweenValues` is `minStepsBetweenThumbs` here and `onValueCommitted` is `onValueCommit`. Left out:
// `thumbAlignment`, `thumbCollisionBehavior`, the input each Base UI thumb renders, `format`, `locale`, Field, Form
// and cancelable event details, which have no counterpart; and Home and End on a thumb of a range stopping at the
// other thumb, where Radix lets the thumbs cross.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import { Slider, SliderRange, SliderThumb, SliderTrack } from '../index'

freshDom()

// jsdom has no pointer capture, which a press on the track takes.
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.hasPointerCapture ??= () => false

function Example({ dir, ...props }: React.ComponentProps<typeof Slider> & { dir?: 'ltr' | 'rtl' }) {
  const slider = (
    <Slider aria-label="Volume" {...props}>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb aria-label="Thumb" />
    </Slider>
  )
  return dir ? <DirectionProvider dir={dir}>{slider}</DirectionProvider> : slider
}

const thumb = () => screen.getByRole('slider')
const now = () => Number(thumb().getAttribute('aria-valuenow'))
const press = (key: string, shiftKey = false) => {
  act(() => thumb().focus())
  fireEvent.keyDown(thumb(), { key, shiftKey })
}

for (const [dir, orientation, increment, decrement] of [
  ['ltr', 'horizontal', 'ArrowRight', 'ArrowLeft'],
  ['rtl', 'horizontal', 'ArrowLeft', 'ArrowRight'],
  ['ltr', 'vertical', 'ArrowUp', 'ArrowDown'],
  ['rtl', 'vertical', 'ArrowUp', 'ArrowDown'],
] as const) {
  describe(`Base UI slider keys, ${dir} ${orientation}`, () => {
    const example = (props: React.ComponentProps<typeof Slider>) => (
      <Example dir={dir} orientation={orientation} {...props} />
    )

    it(`steps down on ${decrement}, by ten steps with Shift, and no lower than min`, () => {
      render(example({ defaultValue: [50] }))

      press(decrement)
      const once = now()
      press(decrement, true)
      const shifted = now()
      for (let count = 0; count < 5; count++) press(decrement, true)

      expect([once, shifted, now()]).toEqual([49, 39, 0])
    })

    it(`steps up on ${increment}, by ten steps with Shift, and no higher than max`, () => {
      render(example({ defaultValue: [50] }))

      press(increment)
      const once = now()
      press(increment, true)
      const shifted = now()
      for (let count = 0; count < 5; count++) press(increment, true)

      expect([once, shifted, now()]).toEqual([51, 61, 100])
    })

    it('goes to max on End and to min on Home', () => {
      render(example({ defaultValue: [50] }))

      press('End')
      const end = now()
      press('Home')

      expect([end, now()]).toEqual([100, 0])
    })

    it('steps by ten on PageUp and PageDown, within min and max', () => {
      render(example({ defaultValue: [95] }))

      press('PageUp')
      const capped = now()
      press('PageDown')
      press('PageDown')

      expect([capped, now()]).toEqual([100, 80])
    })

    it('rounds a value off its step onto the step', () => {
      render(example({ defaultValue: [11], step: 5 }))

      press(increment)

      expect(now()).toBe(15)
    })
  })
}

describe('Base UI slider steps', () => {
  it('takes min as the origin of its steps', () => {
    render(<Example min={3} max={30} step={5} defaultValue={[3]} />)

    press('ArrowRight')
    press('ArrowRight')

    expect(now()).toBe(13)
  })

  it('steps by a fraction without a rounding error', () => {
    render(<Example min={0} max={1} step={0.1} defaultValue={[0.2]} />)

    press('ArrowRight')

    expect(thumb().getAttribute('aria-valuenow')).toBe('0.3')
  })
})

describe('Base UI slider wiring', () => {
  it('updates aria-valuenow as its value changes', () => {
    const { rerender } = render(<Example value={[30]} />)

    rerender(<Example value={[60]} />)

    expect(now()).toBe(60)
  })

  it('marks its thumb with its orientation', () => {
    render(<Example orientation="vertical" defaultValue={[30]} />)

    expect(thumb().getAttribute('aria-orientation')).toBe('vertical')
  })
})

describe('Base UI slider commits', () => {
  it('commits a value the keyboard changes, and nothing for a key that changes none', () => {
    const onValueCommit = vi.fn()
    render(<Example defaultValue={[99]} onValueCommit={onValueCommit} />)

    press('ArrowRight')
    press('ArrowRight')
    press('End')

    expect(onValueCommit.mock.calls).toEqual([[[100]]])
  })
})

describe('Base UI slider presses', () => {
  const track = () => document.querySelector('[data-slot="slider-track"]') as HTMLElement

  it('changes nothing on a right press of its track', () => {
    const onValueChange = vi.fn()
    render(<Example defaultValue={[30]} onValueChange={onValueChange} />)

    fireEvent.pointerDown(track(), { button: 2, pointerId: 1, clientX: 80 })

    expect([now(), onValueChange.mock.calls]).toEqual([30, []])
  })

  it('changes nothing on a press of its track while disabled', () => {
    const onValueChange = vi.fn()
    render(<Example disabled defaultValue={[30]} onValueChange={onValueChange} />)

    fireEvent.pointerDown(track(), { button: 0, pointerId: 1, clientX: 80 })

    expect([now(), onValueChange.mock.calls]).toEqual([30, []])
  })
})
