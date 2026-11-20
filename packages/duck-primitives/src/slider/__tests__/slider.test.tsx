import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import {
  Slider,
  SliderBubbleInput,
  SliderRange,
  SliderThumb,
  SliderThumbProvider,
  SliderThumbTrigger,
  SliderTrack,
  SliderValue,
} from '../index'

freshDom()

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

function renderVerticalSlider(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  const onValueChange = vi.fn((_value: number[]) => {})
  const onValueCommit = vi.fn((_value: number[]) => {})
  render(
    <Slider
      orientation="vertical"
      defaultValue={[50]}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      data-testid="slider"
      {...props}>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb />
    </Slider>,
  )
  const slider = screen.getByTestId('slider')
  slider.getBoundingClientRect = () => new DOMRect(0, 0, 10, 100)
  slider.setPointerCapture = () => {}
  slider.releasePointerCapture = () => {}
  slider.hasPointerCapture = () => true
  return { slider, thumb: screen.getByRole('slider'), onValueChange, onValueCommit }
}

describe('Slider vertical', () => {
  it('reads a drag from the bottom up', () => {
    const { slider, onValueChange, onValueCommit } = renderVerticalSlider()

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 25 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientY: 60 })
    fireEvent.pointerUp(slider, { pointerId: 1, clientY: 60 })

    expect(onValueChange.mock.calls).toEqual([[[75]], [[40]]])
    expect(onValueCommit.mock.calls).toEqual([[[40]]])
  })

  it('reads a drag from the top down when inverted', () => {
    const { slider, onValueChange } = renderVerticalSlider({ inverted: true })

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 25 })

    expect(onValueChange.mock.calls).toEqual([[[25]]])
  })

  it('steps up on ArrowUp and down on ArrowDown', () => {
    const { thumb, onValueChange } = renderVerticalSlider()

    fireEvent.keyDown(thumb, { key: 'ArrowUp' })
    fireEvent.keyDown(thumb, { key: 'ArrowDown' })

    expect(onValueChange.mock.calls).toEqual([[[51]], [[50]]])
  })

  it('keeps the track where it was when the slide began', () => {
    const { slider, onValueChange } = renderVerticalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 25 })
    slider.getBoundingClientRect = () => new DOMRect(0, 40, 10, 100)

    fireEvent.pointerMove(slider, { pointerId: 1, clientY: 60 })

    expect(onValueChange.mock.calls).toEqual([[[75]], [[40]]])
  })

  it('places the thumb and the range from the top when inverted', () => {
    renderVerticalSlider({ inverted: true, defaultValue: [25] })
    const range = document.querySelector<HTMLElement>('[data-slot="slider-range"]')

    expect([screen.getByRole('slider').parentElement?.style.top, range?.style.top, range?.style.bottom]).toEqual([
      'calc(25% + 0px)',
      '0%',
      '75%',
    ])
  })

  it('steps down on ArrowUp when inverted', () => {
    const { thumb, onValueChange } = renderVerticalSlider({ inverted: true })

    fireEvent.keyDown(thumb, { key: 'ArrowUp' })

    expect(onValueChange.mock.calls).toEqual([[[49]]])
  })
})

describe('Slider Home and End', () => {
  it('jumps to min on Home and to max on End, and claims both keys', () => {
    const { thumb, onValueChange } = renderVerticalSlider({ min: 10, max: 90 })

    expect(fireEvent.keyDown(thumb, { key: 'Home' })).toBe(false)
    expect(fireEvent.keyDown(thumb, { key: 'End' })).toBe(false)

    expect(onValueChange.mock.calls).toEqual([[[10]], [[90]]])
  })
})

describe('Slider thumb pointer', () => {
  it('focuses a thumb pressed directly without moving the value', () => {
    const { thumb, onValueChange } = renderVerticalSlider()
    thumb.setPointerCapture = () => {}

    act(() => {
      fireEvent.pointerDown(thumb, { pointerId: 1, clientY: 10 })
    })

    expect(document.activeElement).toBe(thumb)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('focuses a thumb pressed on its own content without moving the value', () => {
    const onValueChange = vi.fn((_value: number[]) => {})
    render(
      <Slider defaultValue={[50]} onValueChange={onValueChange} data-testid="slider">
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb>
          <span data-testid="grip" />
        </SliderThumb>
      </Slider>,
    )
    screen.getByTestId('slider').getBoundingClientRect = () => new DOMRect(0, 0, 100, 10)
    const grip = screen.getByTestId('grip')
    grip.setPointerCapture = () => {}

    act(() => {
      fireEvent.pointerDown(grip, { pointerId: 1, clientX: 70 })
    })

    expect(document.activeElement).toBe(screen.getByRole('slider'))
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Slider presses that do not slide', () => {
  it('reports a drag begun by a press that left the value where it was once per change', () => {
    const { slider, onValueChange } = renderHorizontalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 50 })

    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 60 })

    expect(onValueChange.mock.calls).toEqual([[[60]]])
  })

  it.each([
    ['a right click', { button: 2 }],
    ['a Control click', { button: 0, ctrlKey: true }],
  ])('moves nothing for %s, which opens the context menu', (_, buttons) => {
    const { slider, onValueChange } = renderHorizontalSlider()

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25, ...buttons })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('focuses the closest thumb for a press that leaves the value where it was', () => {
    const { slider, thumb, onValueChange } = renderHorizontalSlider({ step: 10 })

    act(() => {
      fireEvent.pointerDown(slider, { pointerId: 1, clientX: 53 })
    })

    expect(document.activeElement).toBe(thumb)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Slider under StrictMode', () => {
  it('commits a key step once, though StrictMode runs each state update twice', () => {
    const onValueCommit = vi.fn((_value: number[]) => {})
    render(
      <React.StrictMode>
        <Slider defaultValue={[50]} onValueCommit={onValueCommit}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </React.StrictMode>,
    )

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })

    expect(onValueCommit.mock.calls).toEqual([[[51]]])
  })
})

function renderRangeSlider(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  render(
    <Slider defaultValue={[10, 30]} data-testid="slider" {...props}>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb />
      <SliderThumb />
    </Slider>,
  )
  const slider = screen.getByTestId('slider')
  slider.getBoundingClientRect = () => new DOMRect(0, 0, 100, 10)
  slider.setPointerCapture = () => {}
  slider.releasePointerCapture = () => {}
  slider.hasPointerCapture = () => true
  return { slider, thumbs: screen.getAllByRole('slider') }
}

function thumbValues() {
  return screen.getAllByRole('slider').map((thumb) => Number(thumb.getAttribute('aria-valuenow')))
}

describe('Slider range Home and End', () => {
  it('move the focused thumb, as far as its neighbour allows', () => {
    const { thumbs } = renderRangeSlider({
      defaultValue: [20, 80],
      minStepsBetweenThumbs: 10,
      preserveThumbOrder: true,
    })
    const [low, high] = thumbs as [HTMLElement, HTMLElement]

    act(() => high.focus())
    fireEvent.keyDown(high, { key: 'Home' })

    expect(thumbValues()).toEqual([20, 30])

    act(() => low.focus())
    fireEvent.keyDown(low, { key: 'End' })

    expect(thumbValues()).toEqual([20, 30])

    fireEvent.keyDown(low, { key: 'Home' })
    act(() => high.focus())
    fireEvent.keyDown(high, { key: 'End' })

    expect(thumbValues()).toEqual([0, 100])
  })

  it('without preserveThumbOrder, End takes the first thumb past the second, and focus goes with it', () => {
    const { thumbs } = renderRangeSlider({ defaultValue: [20, 80] })
    const [low] = thumbs as [HTMLElement, HTMLElement]

    act(() => low.focus())
    fireEvent.keyDown(low, { key: 'End' })

    expect(thumbValues()).toEqual([80, 100])
    expect(document.activeElement).toBe(screen.getAllByRole('slider')[1] as HTMLElement)
  })
})

describe('Slider preserveThumbOrder', () => {
  it('stops a thumb dragged down past its neighbour at the minimum distance above it', () => {
    const { slider } = renderRangeSlider({ preserveThumbOrder: true, minStepsBetweenThumbs: 5 })

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 30 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 2 })

    expect(thumbValues()).toEqual([10, 15])
  })

  it('stops a thumb dragged up past its neighbour at the minimum distance below it', () => {
    const { slider } = renderRangeSlider({ preserveThumbOrder: true, minStepsBetweenThumbs: 5 })

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 10 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 90 })

    expect(thumbValues()).toEqual([25, 30])
  })

  it('keeps the moved thumb active once it meets its neighbour', () => {
    const { thumbs } = renderRangeSlider({ preserveThumbOrder: true })
    const [, end] = thumbs

    act(() => end!.focus())
    for (let i = 0; i < 25; i++) fireEvent.keyDown(end!, { key: 'ArrowLeft' })

    expect(thumbValues()).toEqual([10, 10])
    expect(document.activeElement).toBe(end!)
  })
})

describe('Slider hidden input', () => {
  it('renders one per thumb on the server, before a thumb can find its form', () => {
    const html = renderToStaticMarkup(
      <form>
        <Slider name="price" defaultValue={[10, 30]}>
          <SliderThumb />
          <SliderThumb />
        </Slider>
      </form>,
    )

    expect(html.split('name="price[]"').length - 1).toBe(2)
  })

  it('names each input by its own thumb, over the root', () => {
    const { container } = render(
      <form>
        <Slider name="price" defaultValue={[10, 30]}>
          <SliderThumb name="low" />
          <SliderThumb name="high" />
        </Slider>
      </form>,
    )

    expect(Array.from(container.querySelectorAll('input'), (input) => input.name)).toEqual(['low', 'high'])
  })

  it('lets through an input event it did not dispatch, after one it stopped', () => {
    const onAncestorInput = vi.fn(() => {})
    function Volume({ value }: { value: number[] }) {
      return (
        <form>
          <div onInput={onAncestorInput}>
            <Slider value={value} name="volume">
              <SliderThumb />
            </Slider>
          </div>
        </form>
      )
    }
    const { container, rerender } = render(<Volume value={[50]} />)
    rerender(<Volume value={[60]} />)

    act(() => {
      container.querySelector('input')?.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(onAncestorInput).toHaveBeenCalledTimes(1)
  })

  it('renders none outside a form', () => {
    const { container } = renderSlider({ name: 'volume' })

    expect(container.querySelector('input')).toBeNull()
  })

  it('renders one for a form named by `form` that does not contain the slider', () => {
    const { container } = render(
      <>
        <form id="settings" />
        <Slider name="volume" form="settings" defaultValue={[20]}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </>,
    )

    const input = container.querySelector('input')!
    expect(input.style.display).toBe('none')
    expect(input.getAttribute('name')).toBe('volume')
    expect(input.getAttribute('form')).toBe('settings')
    expect(input.value).toBe('20')
  })

  it('treats a parent moving back to the last requested value as programmatic', () => {
    const onAncestorInput = vi.fn(() => {})
    let setValue: (value: number[]) => void = () => {}
    function App() {
      const [value, set] = React.useState([50])
      setValue = set
      return (
        <form>
          <div onInput={onAncestorInput}>
            <Slider value={value} onValueChange={set} name="volume">
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </div>
        </form>
      )
    }
    render(<App />)

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onAncestorInput).toHaveBeenCalledTimes(1)

    act(() => setValue([0]))
    act(() => setValue([51]))

    expect(onAncestorInput).toHaveBeenCalledTimes(1)
  })

  it('empties the input of a thumb whose value is gone', () => {
    function Price({ value }: { value: number[] }) {
      return (
        <form>
          <Slider name="price" value={value}>
            <SliderThumb index={0} />
            <SliderThumb index={1} />
          </Slider>
        </form>
      )
    }
    const { container, rerender } = render(<Price value={[10, 30]} />)

    rerender(<Price value={[10]} />)

    expect(Array.from(container.querySelectorAll('input'), (input) => input.value)).toEqual(['10', ''])
  })
})

describe('Slider on the server', () => {
  function serverThumbs(html: string) {
    return Array.from(html.matchAll(/<span[^>]*role="slider"[^>]*>/g), ([thumb]) => [
      /aria-valuenow="([^"]*)"/.exec(thumb)?.[1],
      thumb.includes('display:none'),
    ])
  }
  function serverInputs(html: string) {
    return Array.from(html.matchAll(/<input[^>]*>/g), ([input]) => /value="([^"]*)"/.exec(input)?.[1])
  }

  it('renders a lone thumb where its value puts it, with that value in its input', () => {
    const html = renderToStaticMarkup(
      <form>
        <Slider name="volume" defaultValue={[20]}>
          <SliderThumb />
        </Slider>
      </form>,
    )

    expect([serverThumbs(html), serverInputs(html)]).toEqual([[['20', false]], ['20']])
  })

  it('renders each thumb of a range where its value puts it, once told its index', () => {
    const html = renderToStaticMarkup(
      <form>
        <Slider name="price" defaultValue={[10, 30]}>
          <SliderThumb index={0} />
          <SliderThumb index={1} />
        </Slider>
      </form>,
    )

    expect([serverThumbs(html), serverInputs(html)]).toEqual([
      [
        ['10', false],
        ['30', false],
      ],
      ['10', '30'],
    ])
  })

  it('keeps each thumb of a range hidden on the server when told no index, rather than all at the first value', () => {
    const html = renderToStaticMarkup(
      <Slider defaultValue={[10, 30]}>
        <SliderThumb />
        <SliderThumb />
      </Slider>,
    )

    expect(serverThumbs(html)).toEqual([
      [undefined, true],
      [undefined, true],
    ])
  })

  it('takes the index of a thumb composed from its parts from its provider', () => {
    const html = renderToStaticMarkup(
      <form>
        <Slider name="price" defaultValue={[10, 30]}>
          <SliderThumbProvider index={1}>
            <SliderThumbTrigger />
            <SliderBubbleInput />
          </SliderThumbProvider>
        </Slider>
      </form>,
    )

    expect([serverThumbs(html), serverInputs(html)]).toEqual([[['30', false]], ['30']])
  })
})

describe('Slider focus after a change', () => {
  it('shows the focus ring only when the keyboard moved the thumb', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    try {
      const { slider, thumbs } = renderRangeSlider()

      fireEvent.keyDown(thumbs[0]!, { key: 'ArrowRight' })
      expect(focus).toHaveBeenLastCalledWith({ preventScroll: true, focusVisible: true })

      fireEvent.pointerDown(slider, { pointerId: 1, clientX: 80 })
      expect(focus).toHaveBeenLastCalledWith({ preventScroll: true, focusVisible: false })
    } finally {
      focus.mockRestore()
    }
  })

  it('hides the focus ring for a press after a key that moved nothing', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    try {
      const { slider, thumb } = renderHorizontalSlider({ defaultValue: [100] })
      fireEvent.keyDown(thumb, { key: 'ArrowRight' })

      fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })

      expect(focus).toHaveBeenLastCalledWith({ preventScroll: true, focusVisible: false })
    } finally {
      focus.mockRestore()
    }
  })

  it('hides the focus ring for a press that leaves the value where it was', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    try {
      const { slider } = renderHorizontalSlider({ defaultValue: [100] })

      fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 })

      expect(focus).toHaveBeenLastCalledWith({ preventScroll: true, focusVisible: false })
    } finally {
      focus.mockRestore()
    }
  })
})

describe('Slider form reset', () => {
  it('leaves focus on what has it, though a key moved the thumb last', () => {
    render(
      <form>
        <Slider name="volume" defaultValue={[20]}>
          <SliderThumb />
        </Slider>
        <button type="reset">Reset</button>
      </form>,
    )
    const thumb = screen.getByRole('slider')
    const reset = screen.getByRole<HTMLButtonElement>('button', { name: 'Reset' })
    act(() => thumb.focus())
    fireEvent.keyDown(thumb, { key: 'ArrowRight' })
    act(() => reset.focus())

    act(() => reset.form?.reset())

    expect([thumb.getAttribute('aria-valuenow'), document.activeElement?.textContent]).toEqual(['20', 'Reset'])
  })

  it('restores its value on reset when it renders into another document, such as an iframe', () => {
    const iframe = document.body.appendChild(document.createElement('iframe'))
    const frame = iframe.contentDocument!
    const container = frame.body.appendChild(frame.createElement('div'))
    try {
      render(
        <form>
          <Slider name="volume" defaultValue={[20]}>
            <SliderThumb />
          </Slider>
        </form>,
        { container },
      )
      const thumb = container.querySelector<HTMLElement>('[role="slider"]')!
      fireEvent.keyDown(thumb, { key: 'ArrowRight' })

      act(() => frame.querySelector('form')!.reset())

      expect(thumb.getAttribute('aria-valuenow')).toBe('20')
    } finally {
      iframe.remove()
    }
  })

  it('stops listening to a form it is no longer tied to', () => {
    function Volume({ form }: { form: string }) {
      return (
        <>
          <form id="first" />
          <form id="second" />
          <Slider name="volume" form={form} defaultValue={[20]}>
            <SliderThumb />
          </Slider>
        </>
      )
    }
    const { rerender } = render(<Volume form="first" />)
    const thumb = screen.getByRole('slider')
    fireEvent.keyDown(thumb, { key: 'ArrowRight' })
    rerender(<Volume form="second" />)

    act(() => document.forms.namedItem('first')?.reset())
    const afterFirst = thumb.getAttribute('aria-valuenow')
    act(() => document.forms.namedItem('second')?.reset())

    expect([afterFirst, thumb.getAttribute('aria-valuenow')]).toEqual(['21', '20'])
  })
})

describe('Slider largeStep', () => {
  it('moves a thumb ten steps on Page Up, Page Down and Shift with an arrow when unset', () => {
    renderSlider({ defaultValue: [50], step: 2 })
    const thumb = screen.getByRole('slider')

    fireEvent.keyDown(thumb, { key: 'PageUp' })
    expect(thumb.getAttribute('aria-valuenow')).toBe('70')
    fireEvent.keyDown(thumb, { key: 'ArrowLeft', shiftKey: true })
    expect(thumb.getAttribute('aria-valuenow')).toBe('50')
  })

  it('moves a thumb by largeStep on Page Up, Page Down and Shift with an arrow', () => {
    renderSlider({ defaultValue: [50], step: 5, largeStep: 25 })
    const thumb = screen.getByRole('slider')

    fireEvent.keyDown(thumb, { key: 'PageUp' })
    expect(thumb.getAttribute('aria-valuenow')).toBe('75')
    fireEvent.keyDown(thumb, { key: 'PageDown' })
    fireEvent.keyDown(thumb, { key: 'PageDown' })
    expect(thumb.getAttribute('aria-valuenow')).toBe('25')
    fireEvent.keyDown(thumb, { key: 'ArrowRight', shiftKey: true })
    expect(thumb.getAttribute('aria-valuenow')).toBe('50')
  })

  it('keeps a plain arrow key to one step', () => {
    renderSlider({ defaultValue: [50], step: 5, largeStep: 25 })
    const thumb = screen.getByRole('slider')

    fireEvent.keyDown(thumb, { key: 'ArrowRight' })

    expect(thumb.getAttribute('aria-valuenow')).toBe('55')
  })
})

describe('Slider.Value', () => {
  function renderRange(value: React.ComponentProps<typeof SliderValue>['children'], props: Record<string, unknown>) {
    return render(
      <Slider {...props}>
        <SliderValue data-testid="value">{value}</SliderValue>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
        <SliderThumb />
      </Slider>,
    )
  }

  it('shows the values and follows them as a thumb moves', () => {
    renderRange(undefined, { defaultValue: [20, 80] })
    const output = screen.getByTestId('value')
    expect(output.textContent).toBe('20, 80')

    fireEvent.keyDown(screen.getAllByRole('slider')[0] as HTMLElement, { key: 'ArrowRight' })

    expect(output.textContent).toBe('21, 80')
  })

  it('hands the values to a function child', () => {
    renderRange((values) => `${values[0]} to ${values[1]}`, { defaultValue: [20, 80] })

    expect(screen.getByTestId('value').textContent).toBe('20 to 80')
  })

  it('is hidden from assistive technology and carries the root state', () => {
    renderRange('Price', { defaultValue: [20, 80], disabled: true, orientation: 'vertical' })
    const output = screen.getByTestId('value')

    expect(output.textContent).toBe('Price')
    expect(output.getAttribute('aria-hidden')).toBe('true')
    expect(output.getAttribute('data-slot')).toBe('slider-value')
    expect(output.getAttribute('data-orientation')).toBe('vertical')
    expect(output.hasAttribute('data-disabled')).toBe(true)
  })
})

function renderHorizontalSlider(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  const onValueChange = vi.fn((_value: number[]) => {})
  const onValueCommit = vi.fn((_value: number[]) => {})
  render(
    <Slider
      defaultValue={[50]}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      data-testid="slider"
      {...props}>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb />
    </Slider>,
  )
  const slider = screen.getByTestId('slider')
  slider.getBoundingClientRect = () => new DOMRect(0, 0, 100, 10)
  slider.setPointerCapture = () => {}
  slider.releasePointerCapture = () => {}
  slider.hasPointerCapture = () => true
  return { slider, thumb: screen.getByRole('slider'), onValueChange, onValueCommit }
}

describe('Slider right to left', () => {
  it('reads a press from the right edge', () => {
    const { slider, onValueChange } = renderHorizontalSlider({ dir: 'rtl' })

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })

    expect(onValueChange.mock.calls).toEqual([[[75]]])
  })
})

describe('Slider pointer capture', () => {
  it('moves nothing for a pointer passing over it unpressed', () => {
    const { slider, onValueChange } = renderHorizontalSlider()
    slider.hasPointerCapture = () => false

    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 25 })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('commits nothing on a release once it no longer holds the pointer', () => {
    const { slider, onValueChange, onValueCommit } = renderHorizontalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    slider.hasPointerCapture = () => false

    fireEvent.pointerUp(slider, { pointerId: 1, clientX: 25 })

    expect([onValueChange.mock.calls, onValueCommit.mock.calls]).toEqual([[[[25]]], []])
  })

  it('ends a slide the browser cancels as a release, committing it and measuring the track again next time', () => {
    const { slider, onValueChange, onValueCommit } = renderHorizontalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 40 })
    fireEvent.pointerCancel(slider, { pointerId: 1 })
    slider.getBoundingClientRect = () => new DOMRect(50, 0, 100, 10)

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 })

    expect([onValueChange.mock.calls, onValueCommit.mock.calls]).toEqual([[[[25]], [[40]], [[50]]], [[[40]]]])
  })

  it('stops a drag past either end of the track at min or max', () => {
    const { slider, onValueChange } = renderHorizontalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 40 })

    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 140 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: -40 })

    expect(onValueChange.mock.calls).toEqual([[[40]], [[100]], [[0]]])
  })

  it('commits nothing for a second slide that ends where it began', () => {
    const { slider, onValueCommit } = renderHorizontalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    fireEvent.pointerUp(slider, { pointerId: 1, clientX: 25 })

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    fireEvent.pointerUp(slider, { pointerId: 1, clientX: 25 })

    expect(onValueCommit.mock.calls).toEqual([[[25]]])
  })

  it('commits the last move when the release lands before that move renders', () => {
    const { slider, onValueCommit } = renderHorizontalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })

    act(() => {
      fireEvent.pointerMove(slider, { pointerId: 1, clientX: 40 })
      fireEvent.pointerUp(slider, { pointerId: 1, clientX: 40 })
    })

    expect(onValueCommit.mock.calls).toEqual([[[40]]])
  })

  it('commits the last move of a controlled slider when the release lands before that move renders', () => {
    const onValueCommit = vi.fn((_value: number[]) => {})
    function Volume() {
      const [value, setValue] = React.useState([50])
      return (
        <Slider value={value} onValueChange={setValue} onValueCommit={onValueCommit} data-testid="slider">
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      )
    }
    render(<Volume />)
    const slider = screen.getByTestId('slider')
    slider.getBoundingClientRect = () => new DOMRect(0, 0, 100, 10)
    slider.setPointerCapture = () => {}
    slider.releasePointerCapture = () => {}
    slider.hasPointerCapture = () => true
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })

    act(() => {
      fireEvent.pointerMove(slider, { pointerId: 1, clientX: 40 })
      fireEvent.pointerUp(slider, { pointerId: 1, clientX: 40 })
    })

    expect(onValueCommit.mock.calls).toEqual([[[40]]])
  })
})

describe('Slider keys it steps with', () => {
  it('claims each arrow and page key, so the page does not scroll as the thumb moves', () => {
    const { thumb } = renderHorizontalSlider()

    expect(['ArrowRight', 'ArrowDown', 'PageUp'].map((key) => fireEvent.keyDown(thumb, { key }))).toEqual([
      false,
      false,
      false,
    ])
  })
})

describe('Slider keys it does not use', () => {
  it('leaves a key that is not a step, Home or End to the page', () => {
    const { thumb, onValueChange } = renderHorizontalSlider()

    expect(fireEvent.keyDown(thumb, { key: 'a' })).toBe(true)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Slider disabled', () => {
  it('moves nothing for a drag while disabled', () => {
    const { slider, onValueChange } = renderHorizontalSlider({ disabled: true })

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 75 })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('commits nothing for a release while disabled, though its parent changed the value during the press', () => {
    const onValueCommit = vi.fn((_value: number[]) => {})
    function Volume({ value }: { value: number[] }) {
      return (
        <Slider disabled value={value} onValueCommit={onValueCommit} data-testid="slider">
          <SliderThumb />
        </Slider>
      )
    }
    const { rerender } = render(<Volume value={[50]} />)
    const slider = screen.getByTestId('slider')
    slider.setPointerCapture = () => {}
    slider.releasePointerCapture = () => {}
    slider.hasPointerCapture = () => true
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    rerender(<Volume value={[60]} />)

    fireEvent.pointerUp(slider, { pointerId: 1, clientX: 25 })

    expect(onValueCommit).not.toHaveBeenCalled()
  })

  it('marks a root given the group role disabled, as registry-ui gives a range', () => {
    renderRangeSlider({ disabled: true, role: 'group', 'aria-label': 'Price' })

    expect(screen.getByRole('group', { name: 'Price' }).getAttribute('aria-disabled')).toBe('true')
  })

  it('moves for no key while disabled', () => {
    const { thumb, onValueChange } = renderHorizontalSlider({ disabled: true })

    for (const key of ['Home', 'End', 'ArrowRight']) fireEvent.keyDown(thumb, { key })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it.each([
    ['a disabled', true, ['true', 'true']],
    ['an enabled', false, [null, null]],
  ])(
    'tells assistive technology whether each thumb of %s slider is disabled, which the root alone does not',
    (_, disabled, expected) => {
      renderRangeSlider({ disabled })

      expect(screen.getAllByRole('slider').map((thumb) => thumb.getAttribute('aria-disabled'))).toEqual(expected)
    },
  )
})

describe('Slider minimum distance', () => {
  it('counts the minimum in steps', () => {
    const onValueChange = vi.fn((_value: number[]) => {})
    const { slider } = renderRangeSlider({ defaultValue: [10, 30], step: 5, minStepsBetweenThumbs: 2, onValueChange })

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 20 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 15 })

    expect([thumbValues(), onValueChange.mock.calls]).toEqual([
      [10, 20],
      [[[10, 25]], [[10, 20]]],
    ])
  })

  it('refuses a drag that would bring two thumbs closer than the minimum, even when they may swap', () => {
    const onValueChange = vi.fn((_value: number[]) => {})
    const { slider } = renderRangeSlider({ defaultValue: [10, 20], minStepsBetweenThumbs: 5, onValueChange })

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 10 })
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 17 })

    expect([thumbValues(), onValueChange.mock.calls]).toEqual([[10, 20], []])
  })
})

describe('Slider with no value given', () => {
  it('starts with one thumb at min', () => {
    renderSlider({ min: 10 })

    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('10')
  })

  it('hides a thumb beyond the values it has', () => {
    render(
      <Slider defaultValue={[50]}>
        <SliderThumb />
        <SliderThumb />
      </Slider>,
    )

    expect(
      Array.from(document.querySelectorAll<HTMLElement>('[role="slider"]'), (thumb) => thumb.style.display),
    ).toEqual(['', 'none'])
  })
})

describe('Slider parts', () => {
  it('marks every part with its slot, orientation and disabled state', () => {
    render(
      <Slider orientation="vertical" disabled defaultValue={[50]}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
        <SliderValue />
      </Slider>,
    )
    const parts = ['slider', 'slider-track', 'slider-range', 'slider-thumb', 'slider-value'].map((slot) =>
      document.querySelector(`[data-slot="${slot}"]`),
    )

    expect(parts.map((part) => [part?.getAttribute('data-orientation'), part?.getAttribute('data-disabled')])).toEqual(
      Array(5).fill(['vertical', '']),
    )
  })

  it('writes its direction on the root alone, which every part inherits', () => {
    const { container } = render(
      <Slider dir="rtl" defaultValue={[50]}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>,
    )

    expect(Array.from(container.querySelectorAll('[dir]'), (element) => element.getAttribute('data-slot'))).toEqual([
      'slider',
    ])
  })

  it('fills the range between two thumbs', () => {
    renderRangeSlider()
    const range = document.querySelector<HTMLElement>('[data-slot="slider-range"]')

    expect([range?.style.left, range?.style.right]).toEqual(['10%', '70%'])
  })
})

describe('Slider with no values', () => {
  it('steps nothing for a key from a focusable element inside it', () => {
    const onValueChange = vi.fn((_value: number[]) => {})
    render(
      <Slider defaultValue={[]} onValueChange={onValueChange}>
        <SliderTrack>
          <button type="button">Inside</button>
        </SliderTrack>
      </Slider>,
    )

    fireEvent.keyDown(screen.getByText('Inside'), { key: 'ArrowRight' })

    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Slider thumb in bounds', () => {
  it('keeps a measured thumb inside the track by half its width at the start edge', () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get(this: HTMLElement) {
        return this.getAttribute('role') === 'slider' ? 20 : 0
      },
    })
    try {
      renderHorizontalSlider({ defaultValue: [25] })

      expect(screen.getByRole('slider').parentElement?.style.left).toBe('calc(25% + 5px)')
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', original)
    }
  })
})

describe('Slider track position', () => {
  it('reads a press against where the track starts', () => {
    const { slider, onValueChange } = renderHorizontalSlider()
    slider.getBoundingClientRect = () => new DOMRect(50, 0, 100, 10)

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 75 })

    expect(onValueChange.mock.calls).toEqual([[[25]]])
  })

  it('reads a vertical press against where the track starts', () => {
    const { slider, onValueChange } = renderVerticalSlider()
    slider.getBoundingClientRect = () => new DOMRect(0, 40, 10, 100)

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 60 })

    expect(onValueChange.mock.calls).toEqual([[[80]]])
  })

  it('keeps the track where it was when the slide began', () => {
    const { slider, onValueChange } = renderHorizontalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    slider.getBoundingClientRect = () => new DOMRect(50, 0, 100, 10)

    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 75 })

    expect(onValueChange.mock.calls).toEqual([[[25]], [[75]]])
  })

  it('measures the track again on the next slide', () => {
    const { slider, onValueChange } = renderHorizontalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 25 })
    fireEvent.pointerUp(slider, { pointerId: 1, clientX: 25 })
    slider.getBoundingClientRect = () => new DOMRect(50, 0, 100, 10)

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 90 })

    expect(onValueChange.mock.calls).toEqual([[[25]], [[40]]])
  })

  it('measures a vertical track again on the next slide', () => {
    const { slider, onValueChange } = renderVerticalSlider()
    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 25 })
    fireEvent.pointerUp(slider, { pointerId: 1, clientY: 25 })
    slider.getBoundingClientRect = () => new DOMRect(0, 40, 10, 100)

    fireEvent.pointerDown(slider, { pointerId: 1, clientY: 60 })

    expect(onValueChange.mock.calls).toEqual([[[75]], [[80]]])
  })
})
