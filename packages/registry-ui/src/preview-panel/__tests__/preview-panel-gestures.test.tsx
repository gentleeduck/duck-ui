import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type * as React from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { MotionPreviewPanel } from '../motion-preview-panel'
import { PreviewPanel } from '../preview-panel'

type IPanelProps = React.ComponentProps<typeof MotionPreviewPanel>

const panels: [string, React.ComponentType<IPanelProps>][] = [
  ['PreviewPanel', PreviewPanel],
  ['MotionPreviewPanel', MotionPreviewPanel],
]

const proto = window.HTMLElement.prototype
const capture = { releasePointerCapture: proto.releasePointerCapture, setPointerCapture: proto.setPointerCapture }

beforeAll(() => {
  proto.setPointerCapture = () => {}
  proto.releasePointerCapture = () => {}
})
afterAll(() => {
  Object.assign(proto, capture)
})
afterEach(cleanup)

const frame = () => act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

function pointer(type: string, pointerId: number, clientX: number, clientY: number, button = 0) {
  const event = new MouseEvent(type, { bubbles: true, button, cancelable: true, clientX, clientY })
  Object.defineProperty(event, 'pointerId', { value: pointerId })
  return event
}

function touch(type: string, ...points: [number, number][]) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', { value: points.map(([clientX, clientY]) => ({ clientX, clientY })) })
  return event
}

function wheel(deltaY: number) {
  return new window.WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY })
}

function parts() {
  const viewport = document.querySelector('[data-slot="preview-panel"]')?.lastElementChild
  const content = viewport?.firstElementChild
  if (!(viewport instanceof HTMLElement) || !(content instanceof HTMLElement)) throw new Error('no preview panel')
  return { content, viewport }
}

describe.each(panels)('registry-ui %s gestures', (_, Panel) => {
  test('the zoom buttons step by a quarter, stop at the limits, and reset to the initial zoom', () => {
    const onStateChange = vi.fn()
    render(<Panel initialZoom={1.5} maxZoom={2} minZoom={1} onStateChange={onStateChange} />)
    const { content } = parts()
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' })
    const zoomOut = screen.getByRole('button', { name: 'Zoom out' })

    for (let step = 0; step < 3; step++) fireEvent.click(zoomIn)

    expect(screen.getByText('200%')).toBeTruthy()
    expect(content.style.transform).toBe('translate3d(0px,0px,0) scale(2)')
    expect(content.style.transition).toBe('transform 0.15s ease-out')
    expect(onStateChange).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 1.75 })

    for (let step = 0; step < 5; step++) fireEvent.click(zoomOut)

    expect(screen.getByText('100%')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }))

    expect(screen.getByText('150%')).toBeTruthy()
    expect(onStateChange).toHaveBeenLastCalledWith({ x: 0, y: 0, zoom: 1.5 })
  })

  test('the lock button names the action it takes, with no pressed state to contradict the name', () => {
    render(<Panel />)
    const { viewport } = parts()
    const unlock = screen.getByRole('button', { name: 'Unlock the view' })

    expect(unlock.getAttribute('aria-pressed')).toBeNull()

    fireEvent.click(unlock)

    expect(screen.getByRole('button', { name: 'Lock the view' }).getAttribute('aria-pressed')).toBeNull()
    expect(viewport.style.cursor).toBe('grab')
    expect(viewport.style.touchAction).toBe('none')
  })

  test('a locked view leaves the wheel, a drag and a pinch to the page', async () => {
    const onStateChange = vi.fn()
    render(<Panel onStateChange={onStateChange} />)
    const { content, viewport } = parts()
    const scroll = wheel(100)
    const pinch = touch('touchstart', [0, 0], [100, 0])

    fireEvent(viewport, scroll)
    fireEvent(viewport, pointer('pointerdown', 1, 0, 0))
    fireEvent(viewport, pointer('pointermove', 1, 50, 50))
    fireEvent(viewport, pinch)
    fireEvent(viewport, touch('touchmove', [0, 0], [200, 0]))
    await frame()

    expect(scroll.defaultPrevented).toBe(false)
    expect(pinch.defaultPrevented).toBe(false)
    expect(viewport.style.cursor).toBe('default')
    expect(content.style.transform).toBe('')
    expect(screen.getByText('100%')).toBeTruthy()
    expect(onStateChange).not.toHaveBeenCalled()
  })

  test('unlocked, the wheel zooms by a tenth up to the limit, keeps the page still, and emits once a frame', async () => {
    const onStateChange = vi.fn()
    render(<Panel defaultLocked={false} maxZoom={1.1} onStateChange={onStateChange} />)
    const { content, viewport } = parts()
    const scroll = wheel(-100)

    fireEvent(viewport, scroll)
    fireEvent(viewport, wheel(-100))

    expect(scroll.defaultPrevented).toBe(true)
    expect(screen.getByText('110%')).toBeTruthy()

    await frame()

    expect(content.style.transform).toBe('translate3d(0px,0px,0) scale(1.1)')
    expect(content.style.transition).toBe('none')
    expect(onStateChange).toHaveBeenCalledTimes(1)
    expect(onStateChange).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 1.1 })

    fireEvent(viewport, wheel(100))

    expect(screen.getByText('100%')).toBeTruthy()
  })

  test('a button pressed between a wheel turn and its frame sends the state once, with the frame sending nothing more', async () => {
    const onStateChange = vi.fn()
    render(<Panel defaultLocked={false} onStateChange={onStateChange} />)
    const { viewport } = parts()

    fireEvent(viewport, wheel(-100))
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await frame()

    expect(onStateChange.mock.calls).toEqual([[{ x: 0, y: 0, zoom: 1.35 }]])
  })

  test('unlocked, a drag pans the content from where the last one ended', async () => {
    const onStateChange = vi.fn()
    render(<Panel defaultLocked={false} onStateChange={onStateChange} />)
    const { content, viewport } = parts()

    fireEvent(viewport, pointer('pointerdown', 1, 10, 10))

    expect(viewport.style.cursor).toBe('grabbing')

    fireEvent(viewport, pointer('pointermove', 1, 40, 30))
    await frame()

    expect(content.style.transform).toBe('translate3d(30px,20px,0) scale(1)')
    expect(onStateChange).toHaveBeenLastCalledWith({ x: 30, y: 20, zoom: 1 })

    fireEvent(viewport, pointer('pointerup', 1, 40, 30))
    fireEvent(viewport, pointer('pointermove', 1, 90, 90))
    await frame()

    expect(viewport.style.cursor).toBe('grab')
    expect(content.style.transform).toBe('translate3d(30px,20px,0) scale(1)')

    fireEvent(viewport, pointer('pointerdown', 1, 0, 0))
    fireEvent(viewport, pointer('pointermove', 1, 5, 5))
    await frame()

    expect(content.style.transform).toBe('translate3d(35px,25px,0) scale(1)')
  })

  test('the pointer leaving ends a drag, and a button other than the main one never starts one', async () => {
    render(<Panel defaultLocked={false} />)
    const { content, viewport } = parts()

    fireEvent(viewport, pointer('pointerdown', 1, 0, 0))
    fireEvent(viewport, pointer('pointerleave', 1, 0, 0))
    fireEvent(viewport, pointer('pointermove', 1, 50, 50))
    fireEvent(viewport, pointer('pointerleave', 1, 50, 50))
    fireEvent(viewport, pointer('pointerdown', 1, 0, 0, 2))
    fireEvent(viewport, pointer('pointermove', 1, 50, 50))
    await frame()

    expect(viewport.style.cursor).toBe('grab')
    expect(content.style.transform).toBe('')
  })

  test('a second finger landing, or lifting and leaving, does not take the drag over from the first', async () => {
    render(<Panel defaultLocked={false} />)
    const { content, viewport } = parts()

    fireEvent(viewport, pointer('pointerdown', 1, 0, 0))
    fireEvent(viewport, pointer('pointerdown', 2, 100, 0))
    fireEvent(viewport, pointer('pointermove', 1, 10, 0))
    fireEvent(viewport, pointer('pointermove', 2, 130, 0))
    fireEvent(viewport, pointer('pointerup', 2, 130, 0))
    await frame()

    expect(content.style.transform).toBe('translate3d(10px,0px,0) scale(1)')
    expect(viewport.style.cursor).toBe('grabbing')

    fireEvent(viewport, pointer('pointerleave', 2, 130, 0))
    fireEvent(viewport, pointer('pointermove', 1, 20, 0))
    await frame()

    expect(content.style.transform).toBe('translate3d(20px,0px,0) scale(1)')
  })

  test('unlocked, a pinch zooms by how far the two fingers spread, up to the limit', async () => {
    render(<Panel defaultLocked={false} maxZoom={3} />)
    const { content, viewport } = parts()
    const start = touch('touchstart', [0, 0], [100, 0])
    const spread = touch('touchmove', [0, 0], [250, 0])

    fireEvent(viewport, start)
    fireEvent(viewport, spread)

    expect(start.defaultPrevented).toBe(true)
    expect(spread.defaultPrevented).toBe(true)
    expect(screen.getByText('250%')).toBeTruthy()

    fireEvent(viewport, touch('touchmove', [0, 0], [400, 0]))
    fireEvent(viewport, touch('touchstart', [10, 0]))
    fireEvent(viewport, touch('touchmove', [90, 0]))
    await frame()

    expect(screen.getByText('300%')).toBeTruthy()
    expect(content.style.transform).toBe('translate3d(0px,0px,0) scale(3)')
  })

  test('syncState moves the view with an animation, and leaves alone a state it already shows', async () => {
    const { rerender } = render(<Panel defaultLocked={false} syncState={{ x: 5, y: 6, zoom: 2 }} />)
    const { content, viewport } = parts()

    expect(screen.getByText('200%')).toBeTruthy()
    expect(content.style.transform).toBe('translate3d(5px,6px,0) scale(2)')
    expect(content.style.transition).toBe('transform 0.15s ease-out')

    fireEvent(viewport, wheel(-100))
    await frame()
    rerender(<Panel defaultLocked={false} syncState={{ x: 5, y: 6, zoom: 2.1 }} />)

    expect(content.style.transition).toBe('none')

    rerender(<Panel defaultLocked={false} syncState={{ x: 0, y: 0, zoom: 1 }} />)

    expect(screen.getByText('100%')).toBeTruthy()
    expect(content.style.transform).toBe('translate3d(0px,0px,0) scale(1)')
    expect(content.style.transition).toBe('transform 0.15s ease-out')
  })

  test('will-change holds through a drag and drops once the view settles', async () => {
    render(<Panel defaultLocked={false} />)
    const { content, viewport } = parts()

    fireEvent(viewport, pointer('pointerdown', 1, 0, 0))
    fireEvent(viewport, pointer('pointermove', 1, 20, 0))
    await frame()
    await wait(250)

    expect(content.style.willChange).toBe('transform')

    fireEvent(viewport, pointer('pointerup', 1, 20, 0))
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await wait(250)

    expect(content.style.willChange).toBe('auto')
  })

  test('unmounting drops the frame a gesture left pending', async () => {
    const onStateChange = vi.fn()
    const { unmount } = render(<Panel defaultLocked={false} onStateChange={onStateChange} />)

    fireEvent(parts().viewport, wheel(-100))
    unmount()
    await frame()

    expect(onStateChange).not.toHaveBeenCalled()
  })
})

describe.each(panels)('registry-ui %s unsafeHtml', (name, Panel) => {
  test('warns once in development when the markup carries a script or an inline handler', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(<Panel unsafeHtml="<b>safe</b>" />)

    expect(warn).not.toHaveBeenCalled()

    render(<Panel unsafeHtml={'<b onclick="steal()">bold</b>'} />)
    render(<Panel unsafeHtml="<script>steal()</script>" />)

    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toMatch(new RegExp(`^\\[${name}\\] \`unsafeHtml\` contains`))
    warn.mockRestore()
  })
})
