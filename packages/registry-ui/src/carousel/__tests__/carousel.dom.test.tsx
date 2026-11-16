import { afterAll, afterEach, beforeAll, describe, expect, spyOn, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../carousel'

// jsdom has no layout, no matchMedia, no ResizeObserver and no IntersectionObserver, which embla reads. Three 100px slides sit in a
// 100px track, the first at its right edge in a right-to-left carousel.
const SIZE = 100
const props = ['offsetWidth', 'offsetHeight', 'offsetLeft', 'offsetTop'] as const
const saved = props.map((prop) => [prop, Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop)] as const)

function place(node: HTMLElement) {
  if (node.getAttribute('data-slot') === 'carousel-item') {
    const index = Array.from(node.parentElement?.children ?? []).indexOf(node)
    const rtl = node.closest('[dir]')?.getAttribute('dir') === 'rtl'
    return { size: SIZE, at: (rtl ? -index : index) * SIZE }
  }
  return { size: node.parentElement?.getAttribute('data-slot') === 'carousel-content' ? SIZE : 0, at: 0 }
}

beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.assign(globalThis, { IntersectionObserver: Observer, ResizeObserver: Observer })
  Object.assign(window, {
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  })
  for (const [prop, get] of [
    ['offsetWidth', (node: HTMLElement) => place(node).size],
    ['offsetHeight', (node: HTMLElement) => place(node).size],
    ['offsetLeft', (node: HTMLElement) => place(node).at],
    ['offsetTop', (node: HTMLElement) => place(node).at],
  ] as const) {
    Object.defineProperty(HTMLElement.prototype, prop, {
      configurable: true,
      get() {
        return get(this)
      },
    })
  }
})
afterAll(() => {
  Reflect.deleteProperty(globalThis, 'IntersectionObserver')
  Reflect.deleteProperty(globalThis, 'ResizeObserver')
  Reflect.deleteProperty(window, 'matchMedia')
  for (const [prop, descriptor] of saved) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, prop, descriptor)
  }
})
afterEach(cleanup)

function Ponds({ setApi, orientation }: { setApi?: (api: CarouselApi) => void; orientation?: 'vertical' }) {
  return (
    <Carousel aria-label="Ponds" orientation={orientation} setApi={setApi}>
      <CarouselContent>
        <CarouselItem>Mill</CarouselItem>
        <CarouselItem>Lake</CarouselItem>
        <CarouselItem>Marsh</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

function buttons() {
  return {
    previous: screen.getByRole('button', { name: 'Previous slide' }) as HTMLButtonElement,
    next: screen.getByRole('button', { name: 'Next slide' }) as HTMLButtonElement,
  }
}

describe('registry-ui Carousel in a DOM', () => {
  test('hands its api out, and lets each arrow go only where a slide lies', async () => {
    let api: CarouselApi
    render(
      <Ponds
        setApi={(next) => {
          api = next
        }}
      />,
    )
    await act(async () => {})

    const { previous, next } = buttons()
    expect(api?.scrollSnapList()).toHaveLength(3)
    expect(previous.disabled).toBe(true)
    expect(next.disabled).toBe(false)

    fireEvent.click(next)
    expect(api?.selectedScrollSnap()).toBe(1)
    expect(previous.disabled).toBe(false)

    fireEvent.click(next)
    expect(api?.selectedScrollSnap()).toBe(2)
    expect(next.disabled).toBe(true)

    fireEvent.click(previous)
    expect(api?.selectedScrollSnap()).toBe(1)
  })

  test('takes new options while inactive, when embla hands its listeners no api', async () => {
    const Inactive = ({ loop }: { loop: boolean }) => (
      <Carousel aria-label="Ponds" opts={{ active: false, loop }}>
        <CarouselContent>
          <CarouselItem>Mill</CarouselItem>
          <CarouselItem>Lake</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    const { rerender } = render(<Inactive loop={false} />)
    await act(async () => {})

    rerender(<Inactive loop />)
    await act(async () => {})

    expect(screen.getByText('Lake')).toBeTruthy()
  })

  test('moves with the arrow keys, the way the reading runs', async () => {
    let api: CarouselApi
    render(
      <>
        <Ponds
          setApi={(next) => {
            api = next
          }}
        />
        <input aria-label="Elsewhere" />
      </>,
    )
    await act(async () => {})

    const carousel = screen.getByRole('region', { name: 'Ponds' })
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(api?.selectedScrollSnap()).toBe(1)
    fireEvent.keyDown(buttons().next, { key: 'ArrowLeft' })
    expect(api?.selectedScrollSnap()).toBe(0)
    fireEvent.keyDown(carousel, { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Elsewhere' }), { key: 'ArrowRight' })
    expect(api?.selectedScrollSnap()).toBe(0)
  })

  test('takes the keys the other way round in a right-to-left carousel', async () => {
    let api: CarouselApi
    render(
      <DirectionProvider dir="rtl">
        <Ponds
          setApi={(next) => {
            api = next
          }}
        />
      </DirectionProvider>,
    )
    await act(async () => {})

    const carousel = screen.getByRole('region', { name: 'Ponds' })
    expect(carousel.getAttribute('dir')).toBe('rtl')
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
    expect(api?.selectedScrollSnap()).toBe(1)
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(api?.selectedScrollSnap()).toBe(0)
  })

  test('marks each slide, and stacks them in a vertical carousel', async () => {
    const { unmount } = render(<Ponds />)
    await act(async () => {})

    const mill = screen.getByText('Mill')
    expect(mill.getAttribute('aria-roledescription')).toBe('slide')
    expect(mill.className.split(' ')).toContain('ps-4')
    expect((mill.parentElement as HTMLElement).className.split(' ')).toContain('-ms-4')
    unmount()

    render(<Ponds orientation="vertical" />)
    await act(async () => {})
    const marsh = screen.getByText('Marsh')
    expect(marsh.className.split(' ')).toContain('pt-4')
    expect((marsh.parentElement as HTMLElement).className.split(' ')).toContain('flex-col')
    expect(buttons().next.className.split(' ')).toContain('rotate-90')
  })

  test('refuses a part used outside a carousel', () => {
    const quiet = spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<CarouselItem>Stray</CarouselItem>)).toThrow('useCarousel must be used within a <Carousel />')
    quiet.mockRestore()
  })
})
