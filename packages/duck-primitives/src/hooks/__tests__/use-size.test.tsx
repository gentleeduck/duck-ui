import { act, cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSize } from '../use-size'

class Observer {
  static all: Observer[] = []
  targets = new Set<Element>()
  constructor(readonly callback: (entries: unknown[]) => void) {
    Observer.all.push(this)
  }
  observe(target: Element) {
    this.targets.add(target)
  }
  unobserve(target: Element) {
    this.targets.delete(target)
  }
  disconnect() {
    this.targets.clear()
  }
  report(width: number, height: number) {
    this.callback([{ borderBoxSize: [{ inlineSize: width, blockSize: height }] }])
  }
}

const RealObserver = globalThis.ResizeObserver
const nextFrame = () => act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))

let renders = 0
function Probe({ element }: { element: HTMLElement | null }) {
  const size = useSize(element)
  renders++
  return <output>{size ? `${size.width}x${size.height}` : 'none'}</output>
}

function Measured({ which = 'a' }: { which?: 'a' | 'b' | 'none' }) {
  const [a, setA] = React.useState<HTMLElement | null>(null)
  const [b, setB] = React.useState<HTMLElement | null>(null)
  return (
    <>
      <div ref={setA} data-testid="a" />
      <div ref={setB} data-testid="b" />
      <Probe element={which === 'a' ? a : which === 'b' ? b : null} />
    </>
  )
}

const shown = () => screen.getByRole('status').textContent

describe('useSize', () => {
  beforeEach(() => {
    Observer.all = []
    renders = 0
    Object.assign(globalThis, { ResizeObserver: Observer })
  })

  afterEach(() => {
    cleanup()
    Object.assign(globalThis, { ResizeObserver: RealObserver })
  })

  it('applies a reported size on the next frame, not inside the observer callback', async () => {
    render(<Measured />)

    act(() => Observer.all[0]?.report(300, 200))
    expect(shown()).toBe('0x0')

    await nextFrame()
    expect(shown()).toBe('300x200')
  })

  it('applies only the last of several reports in one frame', async () => {
    render(<Measured />)

    act(() => {
      Observer.all[0]?.report(1, 1)
      Observer.all[0]?.report(2, 2)
      Observer.all[0]?.report(3, 3)
    })
    const before = renders
    await nextFrame()

    expect(shown()).toBe('3x3')
    expect(renders).toBe(before + 1)
  })

  it('does not render again when a report repeats the size it already has', async () => {
    render(<Measured />)
    act(() => Observer.all[0]?.report(40, 20))
    await nextFrame()
    const before = renders

    act(() => Observer.all[0]?.report(40, 20))
    await nextFrame()

    expect(renders).toBe(before)
  })

  it('does not render for the first report when it matches the offset size', async () => {
    render(<Measured />)
    const before = renders

    act(() => Observer.all[0]?.report(0, 0))
    await nextFrame()

    expect(shown()).toBe('0x0')
    expect(renders).toBe(before)
  })

  it('applies a change of height alone', async () => {
    render(<Measured />)
    act(() => Observer.all[0]?.report(40, 20))
    await nextFrame()

    act(() => Observer.all[0]?.report(40, 30))
    await nextFrame()

    expect(shown()).toBe('40x30')
  })

  it('measures the offset size when a report carries no border box', async () => {
    render(<Measured />)
    const box = screen.getByTestId('a')
    Object.defineProperties(box, { offsetWidth: { value: 90 }, offsetHeight: { value: 45 } })

    act(() => Observer.all[0]?.callback([{}]))
    await nextFrame()

    expect(shown()).toBe('90x45')
  })

  it('ignores a report with no entries', async () => {
    const errors: unknown[] = []
    const record = (event: ErrorEvent) => errors.push(event.error)
    window.addEventListener('error', record)
    render(<Measured />)

    act(() => Observer.all[0]?.callback([]))
    await nextFrame()

    window.removeEventListener('error', record)
    expect(errors).toEqual([])
    expect(shown()).toBe('0x0')
  })

  it('stops observing and drops a pending report on unmount', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { unmount } = render(<Measured />)
    const observer = Observer.all[0]

    act(() => observer?.report(500, 500))
    unmount()
    await nextFrame()

    expect(observer?.targets.size).toBe(0)
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })

  it('moves to a new element and drops a report still pending for the old one', async () => {
    const { rerender } = render(<Measured />)
    const first = Observer.all[0]

    act(() => first?.report(70, 70))
    rerender(<Measured which="b" />)
    await nextFrame()

    expect(first?.targets.size).toBe(0)
    expect(Observer.all[1]?.targets.has(screen.getByTestId('b'))).toBe(true)
    expect(shown()).toBe('0x0')
  })

  it('returns undefined once the element is gone', () => {
    const { rerender } = render(<Measured />)
    expect(shown()).toBe('0x0')

    rerender(<Measured which="none" />)

    expect(shown()).toBe('none')
  })
})
