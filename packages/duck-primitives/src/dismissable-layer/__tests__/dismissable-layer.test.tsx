import { describe, expect, it, mock } from 'bun:test'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import * as React from 'react'
import { flushSync } from 'react-dom'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import { DismissableLayer } from '../dismissable-layer'
import { DismissableLayerBranch, useDismissableLayerSurface } from '../index'

freshDom()

describe('DismissableLayer', () => {
  it('renders children', () => {
    const { container } = render(
      <DismissableLayer>
        <span>inside layer</span>
      </DismissableLayer>,
    )
    expect(container.textContent).toBe('inside layer')
  })

  it('renders as a div', () => {
    const { container } = render(
      <DismissableLayer>
        <span>content</span>
      </DismissableLayer>,
    )
    expect(container.querySelector('div')).not.toBeNull()
  })

  it('calls onEscapeKeyDown when Escape is pressed', () => {
    const handler = mock(() => {})
    render(
      <DismissableLayer onEscapeKeyDown={handler}>
        <span>content</span>
      </DismissableLayer>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss when Escape is pressed', () => {
    const handler = mock(() => {})
    render(
      <DismissableLayer onDismiss={handler}>
        <span>content</span>
      </DismissableLayer>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <DismissableLayer ref={ref}>
        <span>ref test</span>
      </DismissableLayer>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('does not call onDismiss on non-Escape keys', () => {
    const handler = mock(() => {})
    render(
      <DismissableLayer onDismiss={handler}>
        <span>content</span>
      </DismissableLayer>,
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.keyDown(document, { key: 'ArrowDown' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('onEscapeKeyDown receives the keyboard event', () => {
    let receivedEvent: KeyboardEvent | null = null
    render(
      <DismissableLayer
        onEscapeKeyDown={(e) => {
          receivedEvent = e
        }}>
        <span>content</span>
      </DismissableLayer>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(receivedEvent).not.toBeNull()
    expect(receivedEvent!.key).toBe('Escape')
  })

  it('passes className through', () => {
    const { container } = render(
      <DismissableLayer className="my-layer">
        <span>content</span>
      </DismissableLayer>,
    )
    expect(container.querySelector('.my-layer')).not.toBeNull()
  })
})

function Stack({ outer = true, inner = true, modal = false }) {
  const [dismissed, setDismissed] = React.useState<string[]>([])
  const layer = (name: string) => (
    <DismissableLayer
      data-testid={name}
      disableOutsidePointerEvents={modal}
      onDismiss={() => setDismissed((all) => [...all, name])}
    />
  )
  return (
    <>
      {outer && layer('outer')}
      {inner && layer('inner')}
      <output>{dismissed.join(' ')}</output>
    </>
  )
}

describe('DismissableLayer stack', () => {
  it('dismisses only the highest layer on Escape', () => {
    render(<Stack />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.getByRole('status').textContent).toBe('inner')
  })

  it('makes a layer the highest once the one under it is gone', () => {
    const { rerender } = render(<Stack />)
    rerender(<Stack outer={false} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.getByRole('status').textContent).toBe('inner')
  })

  it('finds the highest layer again on each Escape while the layers under it go', () => {
    const { rerender } = render(<Stack />)
    fireEvent.keyDown(document, { key: 'Escape' })
    rerender(<Stack outer={false} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.getByRole('status').textContent).toBe('inner inner')
  })

  it('turns pointer events off on a modal layer while another opens over it, and back on once it closes', () => {
    const { rerender } = render(<Stack modal inner={false} />)
    expect(screen.getByTestId('outer').style.pointerEvents).toBe('auto')

    rerender(<Stack modal />)
    expect(screen.getByTestId('outer').style.pointerEvents).toBe('none')
    expect(screen.getByTestId('inner').style.pointerEvents).toBe('auto')

    rerender(<Stack modal inner={false} />)
    expect(screen.getByTestId('outer').style.pointerEvents).toBe('auto')
  })

  it('leaves a layer opened over a modal one pressable when it blocks nothing itself', () => {
    render(
      <>
        <DismissableLayer data-testid="outer" disableOutsidePointerEvents />
        <DismissableLayer data-testid="inner" />
      </>,
    )

    expect(screen.getByTestId('outer').style.pointerEvents).toBe('auto')
    expect(screen.getByTestId('inner').style.pointerEvents).toBe('auto')
  })

  it('blocks the page from the render that tells it to while open, and gives it back from the one that stops', () => {
    const { rerender } = render(<Stack inner={false} />)
    rerender(<Stack inner={false} modal />)

    expect(document.body.style.pointerEvents).toBe('none')
    expect(screen.getByTestId('outer').style.pointerEvents).toBe('auto')

    rerender(<Stack inner={false} />)

    expect(document.body.style.pointerEvents).toBe('')
    expect(screen.getByTestId('outer').style.pointerEvents).toBe('')
  })

  it('leaves its pointer events to a style that sets them, and takes them back once the style drops them', () => {
    const layer = (style?: React.CSSProperties) => (
      <DismissableLayer data-testid="layer" disableOutsidePointerEvents style={style} />
    )
    const { rerender } = render(layer())
    rerender(layer({ pointerEvents: 'none' }))

    expect(screen.getByTestId('layer').style.pointerEvents).toBe('none')

    rerender(layer())

    expect(screen.getByTestId('layer').style.pointerEvents).toBe('auto')
  })
})

describe('DismissableLayer branch', () => {
  it('stays put when focus moves into one of its branches, and not elsewhere', () => {
    const onDismiss = mock()
    render(
      <>
        <DismissableLayer onDismiss={onDismiss}>
          <button type="button">Inside</button>
        </DismissableLayer>
        <DismissableLayerBranch>
          <button type="button">Branch</button>
        </DismissableLayerBranch>
        <button type="button">Elsewhere</button>
      </>,
    )

    act(() => screen.getByText('Branch').focus())
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => screen.getByText('Elsewhere').focus())
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

describe('DismissableLayer and focus leaving it', () => {
  it('dismisses once focus moves from inside it to an element outside', () => {
    const onDismiss = mock()
    render(
      <>
        <DismissableLayer onDismiss={onDismiss}>
          <button type="button">Inside</button>
        </DismissableLayer>
        <button type="button">Outside</button>
      </>,
    )

    act(() => screen.getByText('Inside').focus())
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => screen.getByText('Outside').focus())
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('stays when onFocusOutside prevents the default', () => {
    const onDismiss = mock()
    render(
      <>
        <DismissableLayer onDismiss={onDismiss} onFocusOutside={(event) => event.preventDefault()} />
        <button type="button">Outside</button>
      </>,
    )

    act(() => screen.getByText('Outside').focus())

    expect(onDismiss).not.toHaveBeenCalled()
  })
})

describe('DismissableLayer branch without a node', () => {
  it('is no branch when its child never takes the ref, and the next focus outside still dismisses', () => {
    const onDismiss = mock()
    function Plain({ children }: { children?: React.ReactNode }) {
      return <button type="button">{children}</button>
    }
    render(
      <>
        <DismissableLayer onDismiss={onDismiss} />
        <DismissableLayerBranch asChild>
          <Plain>Branch</Plain>
        </DismissableLayerBranch>
      </>,
    )

    act(() => screen.getByText('Branch').focus())

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

describe('DismissableLayer in two documents', () => {
  it('locks the body of each document holding a modal layer, and gives each its own back', () => {
    const other = document.implementation.createHTMLDocument('frame')
    const container = other.body.appendChild(other.createElement('div'))
    const bodies: string[][] = []
    const read = () => bodies.push([document.body.style.pointerEvents, other.body.style.pointerEvents])

    const page = render(<DismissableLayer disableOutsidePointerEvents />)
    const frame = render(<DismissableLayer disableOutsidePointerEvents />, { container })
    read()
    page.unmount()
    read()
    frame.unmount()
    read()

    expect(bodies).toEqual([
      ['none', 'none'],
      ['', 'none'],
      ['', ''],
    ])
  })

  function renderInBoth() {
    const other = document.implementation.createHTMLDocument('frame')
    const container = other.body.appendChild(other.createElement('div'))
    const onPageDismiss = mock()
    const onFrameDismiss = mock()
    render(<DismissableLayer onDismiss={onPageDismiss} />)
    render(<DismissableLayer onDismiss={onFrameDismiss} />, { container })
    return { other, onPageDismiss, onFrameDismiss }
  }

  it('hears a press outside only from its own document', async () => {
    const { other, onPageDismiss, onFrameDismiss } = renderInBoth()
    const outside = other.body.appendChild(other.createElement('button'))
    await wait(0)

    outside.dispatchEvent(new window.PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }))

    expect(onFrameDismiss).toHaveBeenCalledTimes(1)
    expect(onPageDismiss).not.toHaveBeenCalled()
  })

  it('leaves Escape to the highest layer only in the document it is pressed in', () => {
    const { other, onPageDismiss, onFrameDismiss } = renderInBoth()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onPageDismiss).not.toHaveBeenCalled()
    expect(onFrameDismiss).not.toHaveBeenCalled()

    other.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onFrameDismiss).toHaveBeenCalledTimes(1)
  })
})

describe('DismissableLayer whose element changes', () => {
  it('keeps the new element interactive over the page it locks, and gives the page back its own value', () => {
    document.body.style.pointerEvents = 'auto'
    const { rerender, unmount } = render(
      <DismissableLayer asChild disableOutsidePointerEvents data-testid="layer">
        <div />
      </DismissableLayer>,
    )
    rerender(
      <DismissableLayer asChild disableOutsidePointerEvents data-testid="layer">
        <section />
      </DismissableLayer>,
    )

    const layer = screen.getByTestId('layer')
    expect(layer.tagName).toBe('SECTION')
    expect(layer.style.pointerEvents).toBe('auto')
    expect(document.body.style.pointerEvents).toBe('none')

    unmount()
    expect(document.body.style.pointerEvents).toBe('auto')
    document.body.style.pointerEvents = ''
  })
})

async function renderLayer(props: React.ComponentProps<typeof DismissableLayer> = {}) {
  render(
    <>
      <DismissableLayer {...props}>
        <button type="button">Inside</button>
      </DismissableLayer>
      <button type="button">Outside</button>
    </>,
  )
  await wait(0)
  return screen.getByText('Outside')
}

describe('DismissableLayer outside a deferred press', () => {
  it('waits for the click after a touch even without deferPointerDownOutside', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })

    fireEvent.pointerDown(outside, { pointerType: 'touch' })
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.click(outside)
    await wait(0)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('leaves the focus that moves during a deferred touch to the click that follows', async () => {
    const onDismiss = mock()
    const onFocusOutside = mock()
    const outside = await renderLayer({ onDismiss, onFocusOutside })

    fireEvent.pointerDown(outside, { pointerType: 'touch' })
    act(() => outside.focus())
    expect(onFocusOutside).not.toHaveBeenCalled()

    fireEvent.click(outside)
    await wait(0)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['a right press', { button: 2 }],
    ['a control press', { button: 0, ctrlKey: true }],
  ])('dismisses at once on %s, even when it defers', async (_, press) => {
    const onDismiss = mock()
    const outside = await renderLayer({ deferPointerDownOutside: true, onDismiss })

    fireEvent.pointerDown(outside, { ...press, pointerType: 'mouse' })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('listens to focus again once a stopped click has settled the press', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ deferPointerDownOutside: true, onDismiss })
    outside.addEventListener('click', (event) => event.stopPropagation())

    fireEvent.pointerDown(outside)
    fireEvent.click(outside)
    await wait(0)
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => outside.focus())
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not dismiss from a click that lands after it unmounted', async () => {
    const onDismiss = mock()
    function Test({ open }: { open: boolean }) {
      return (
        <>
          {open ? (
            <DismissableLayer deferPointerDownOutside onDismiss={onDismiss}>
              <button type="button">Inside</button>
            </DismissableLayer>
          ) : null}
          <button type="button">Outside</button>
        </>
      )
    }
    const { rerender } = render(<Test open />)
    await wait(0)
    const outside = screen.getByText('Outside')

    fireEvent.pointerDown(outside)
    rerender(<Test open={false} />)
    fireEvent.click(outside)
    await wait(0)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does not dismiss when it unmounts between the click and the dismissal', async () => {
    const onDismiss = mock()
    function Test({ open }: { open: boolean }) {
      return (
        <>
          {open ? (
            <DismissableLayer deferPointerDownOutside onDismiss={onDismiss}>
              <button type="button">Inside</button>
            </DismissableLayer>
          ) : null}
          <button type="button">Outside</button>
        </>
      )
    }
    const { rerender } = render(<Test open />)
    await wait(0)
    const outside = screen.getByText('Outside')

    fireEvent.pointerDown(outside)
    fireEvent.click(outside)
    rerender(<Test open={false} />)
    await wait(0)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('reads a press cancelled before its click as over, so the next press decides alone', async () => {
    const onPointerDownOutside = mock()
    render(
      <>
        <DismissableLayer deferPointerDownOutside onPointerDownOutside={onPointerDownOutside}>
          <button type="button">Inside</button>
        </DismissableLayer>
        <button type="button">Dragged</button>
        <button type="button">Tapped</button>
      </>,
    )
    await wait(0)
    const dragged = screen.getByText('Dragged')
    const tapped = screen.getByText('Tapped')
    dragged.addEventListener('mouseup', (event) => event.stopPropagation())

    fireEvent.pointerDown(dragged)
    fireEvent.mouseUp(dragged)
    fireEvent.pointerDown(tapped)
    fireEvent.click(tapped)
    await wait(0)

    expect(onPointerDownOutside).toHaveBeenCalledTimes(1)
    const [event] = onPointerDownOutside.mock.calls[0] as [CustomEvent<{ originalEvent: PointerEvent }>]
    expect(event.detail.originalEvent.target).toBe(tapped)
  })

  it('waits for the click a tap sends a task after it lifts', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })

    fireEvent.pointerDown(outside, { pointerType: 'touch' })
    fireEvent.pointerUp(outside, { pointerType: 'touch' })
    await wait(0)
    fireEvent.click(outside)
    await wait(0)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('keeps a press made before the last one was found clickless, and settles it on its own click', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ deferPointerDownOutside: true, onDismiss })

    fireEvent.pointerDown(outside, { pointerType: 'mouse' })
    fireEvent.pointerUp(outside, { pointerType: 'mouse' })
    fireEvent.pointerDown(outside, { pointerType: 'mouse' })
    await wait(0)
    fireEvent.pointerUp(outside, { pointerType: 'mouse' })
    fireEvent.click(outside)
    await wait(0)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('listens to focus again once the mouse lifts with no click to wait for', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ deferPointerDownOutside: true, onDismiss })

    fireEvent.pointerDown(outside, { pointerType: 'mouse' })
    fireEvent.pointerUp(outside, { pointerType: 'mouse' })
    await wait(0)
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => outside.focus())
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('leaves a click with no press of its own, as Enter on a button sends, to the button', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ deferPointerDownOutside: true, onDismiss })

    fireEvent.pointerDown(outside, { pointerType: 'mouse' })
    fireEvent.pointerUp(outside, { pointerType: 'mouse' })
    await wait(0)
    fireEvent.click(screen.getByText('Inside'))
    await wait(0)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('listens to focus again once a touch turns into a scroll, which sends no click', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })

    fireEvent.pointerDown(outside, { pointerType: 'touch' })
    fireEvent.pointerCancel(outside, { pointerType: 'touch' })
    fireEvent.click(screen.getByText('Inside'))
    await wait(0)
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => outside.focus())
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('closes on a mouse press on a surface that stops its click, as a dialog overlay may', async () => {
    const onDismiss = mock()
    function Surface() {
      return (
        // biome-ignore lint/a11y/noStaticElementInteractions: a backdrop for the pointer, as a dialog's overlay is
        // biome-ignore lint/a11y/useKeyWithClickEvents: a backdrop for the pointer, as a dialog's overlay is
        <div onClick={(event) => event.stopPropagation()} ref={useDismissableLayerSurface()}>
          Surface
        </div>
      )
    }
    render(
      <>
        <DismissableLayer deferPointerDownOutside onDismiss={onDismiss} />
        <Surface />
      </>,
    )
    await wait(0)
    const surface = screen.getByText('Surface')

    fireEvent.pointerDown(surface, { pointerType: 'mouse' })
    fireEvent.pointerUp(surface, { pointerType: 'mouse' })
    fireEvent.click(surface)
    await wait(0)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

// jsdom lays nothing out and does not expand `overflow`. This box is 100px inside a 2px border, less a 15px scrollbar
// on each side when its content overflows, unless its scrollbars are drawn over it and take no room.
interface Layout {
  overflow?: string
  overflowY?: string
  direction?: string
  overflows?: boolean
  room?: boolean
}

function laidOut(
  node: HTMLElement,
  { overflow = 'auto', overflowY = overflow, direction = 'ltr', overflows = true, room = true }: Layout = {},
) {
  node.style.overflowX = overflow
  node.style.overflowY = overflowY
  node.style.direction = direction
  node.style.border = '2px solid'
  const inner = overflows && room ? 85 : 100
  const content = overflows ? 200 : 100
  const sizes = {
    offsetWidth: 104,
    offsetHeight: 104,
    clientWidth: inner,
    clientHeight: inner,
    scrollWidth: content,
    scrollHeight: content,
  }
  for (const [key, value] of Object.entries(sizes)) Object.defineProperty(node, key, { configurable: true, value })
  return () => {
    for (const key of Object.keys(sizes)) delete (node as unknown as Record<string, unknown>)[key]
  }
}

function pressAt(
  target: Element,
  { offsetX = 40, offsetY = 40, clientX = 300, clientY = 300, button = 0, pointerType = 'mouse' } = {},
) {
  const event = new window.PointerEvent('pointerdown', { bubbles: true, button, clientX, clientY, pointerType })
  Object.defineProperties(event, { offsetX: { value: offsetX }, offsetY: { value: offsetY } })
  fireEvent(target, event)
}

describe('DismissableLayer and scrollbars outside it', () => {
  it('stays open when a scrollbar outside it is pressed, and closes on the content beside it', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside)

    pressAt(outside, { offsetX: 90 })
    pressAt(outside, { offsetY: 90 })
    expect(onDismiss).not.toHaveBeenCalled()

    pressAt(outside)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('finds the vertical scrollbar on the left of a right-to-left box', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { direction: 'rtl' })

    pressAt(outside, { offsetX: 10 })
    expect(onDismiss).not.toHaveBeenCalled()

    pressAt(outside, { offsetX: 90 })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('closes where a horizontal scrollbar would be on a box that only scrolls down', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { overflow: 'hidden', overflowY: 'auto' })

    pressAt(outside, { offsetX: 90 })
    expect(onDismiss).not.toHaveBeenCalled()

    pressAt(outside, { offsetY: 90 })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('closes on the border of a box that does not scroll', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { overflow: 'visible' })

    pressAt(outside, { offsetX: 90 })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('closes on the border of a scrolling box whose content fits', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { overflows: false })

    pressAt(outside, { offsetX: 101 })
    pressAt(outside, { offsetY: 101 })

    expect(onDismiss).toHaveBeenCalledTimes(2)
  })

  it('closes on a touch where a scrollbar would be, since a touch scrolls without one', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside)

    pressAt(outside, { offsetX: 90, pointerType: 'touch' })
    fireEvent.click(outside)
    await wait(0)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('stays open when the press on a scrollbar outside it focuses that box, until the pointer lifts', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside)

    pressAt(outside, { offsetX: 90 })
    act(() => outside.focus())
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.pointerUp(outside)
    act(() => outside.blur())
    act(() => outside.focus())
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('closes when focus moves to anything but the box whose scrollbar was pressed', async () => {
    const onDismiss = mock()
    render(
      <>
        <DismissableLayer onDismiss={onDismiss} />
        <div data-testid="box" tabIndex={-1} />
        <button type="button">Outside</button>
      </>,
    )
    await wait(0)
    laidOut(screen.getByTestId('box'))

    pressAt(screen.getByTestId('box'), { offsetX: 90 })
    act(() => screen.getByText('Outside').focus())

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it("stays open when the page's own scrollbar is pressed", async () => {
    const onDismiss = mock()
    await renderLayer({ onDismiss })
    const restore = laidOut(document.documentElement, { overflow: 'visible' })

    try {
      pressAt(document.documentElement, { offsetX: 90 })
      expect(onDismiss).not.toHaveBeenCalled()
    } finally {
      restore()
      document.documentElement.removeAttribute('style')
    }
  })
})

// The page jsdom gives is 1024 by 768, its scrollbars drawn over it unless they take `room`.
function pageLaidOut({ direction = 'ltr', down = true, across = false, room = 0 } = {}) {
  const root = document.documentElement
  root.style.direction = direction
  const sizes = {
    clientWidth: window.innerWidth - room,
    clientHeight: window.innerHeight - room,
    scrollWidth: across ? 2000 : window.innerWidth - room,
    scrollHeight: down ? 2000 : window.innerHeight - room,
  }
  for (const [key, value] of Object.entries(sizes)) Object.defineProperty(root, key, { configurable: true, value })
  return () => {
    for (const key of Object.keys(sizes)) delete (root as unknown as Record<string, unknown>)[key]
    root.removeAttribute('style')
  }
}

const lift = (target: Element) => fireEvent.pointerUp(target, { pointerType: 'mouse' })

describe('DismissableLayer and scrollbars drawn over a box outside it', () => {
  it('stays open on a press at the edge of a box whose scrollbars take no room, since a scrollbar sends no click', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { room: false })

    pressAt(outside, { offsetX: 90 })
    lift(outside)
    await wait(0)
    pressAt(outside, { offsetY: 90 })
    lift(outside)
    await wait(0)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('closes on the click that follows a press at that edge, which only a press on the box sends', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { room: false })

    pressAt(outside, { offsetX: 90 })
    expect(onDismiss).not.toHaveBeenCalled()

    lift(outside)
    fireEvent.click(outside)
    await wait(0)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('finds that edge on the left of a right-to-left box', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { room: false, direction: 'rtl' })

    pressAt(outside, { offsetX: 10 })
    expect(onDismiss).not.toHaveBeenCalled()

    pressAt(outside, { offsetX: 90 })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('closes at once on a press away from that edge, or at the edge of a side that does not scroll', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { room: false, overflow: 'hidden', overflowY: 'auto' })

    pressAt(outside, { offsetX: 70 })
    pressAt(outside, { offsetY: 90 })

    expect(onDismiss).toHaveBeenCalledTimes(2)
  })

  it('closes at once at the edge of a box whose content fits', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { room: false, overflows: false })

    pressAt(outside, { offsetX: 90 })
    pressAt(outside, { offsetY: 90 })

    expect(onDismiss).toHaveBeenCalledTimes(2)
  })

  it('closes at once on a press beside a scrollbar that takes room', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside)

    pressAt(outside, { offsetX: 80 })
    pressAt(outside, { offsetY: 80 })

    expect(onDismiss).toHaveBeenCalledTimes(2)
  })

  it('closes at once on a right press at that edge, which sends no click to wait for', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    laidOut(outside, { room: false })

    pressAt(outside, { offsetX: 90, button: 2 })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it("stays open on a press at the edge of a page whose scrollbars take no room, and closes on the page's content", async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    const restore = pageLaidOut()

    try {
      pressAt(outside, { clientX: window.innerWidth - 10 })
      lift(outside)
      await wait(0)
      expect(onDismiss).not.toHaveBeenCalled()

      pressAt(outside, { clientX: window.innerWidth - 30 })
      expect(onDismiss).toHaveBeenCalledTimes(1)
    } finally {
      restore()
    }
  })

  it("finds the page's edge on the left of a right-to-left page, whatever the direction under the press", async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    const restore = pageLaidOut({ direction: 'rtl', across: true })
    outside.style.direction = 'ltr'

    try {
      pressAt(outside, { clientX: 10 })
      lift(outside)
      await wait(0)
      pressAt(outside, { clientY: window.innerHeight - 10 })
      lift(outside)
      await wait(0)
      expect(onDismiss).not.toHaveBeenCalled()

      pressAt(outside, { clientX: window.innerWidth - 10 })
      expect(onDismiss).toHaveBeenCalledTimes(1)
    } finally {
      restore()
    }
  })

  it('measures the page of the frame it is in, not the window around the frame', async () => {
    const onDismiss = mock()
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDocument = frame.contentDocument as Document
    const container = frameDocument.body.appendChild(frameDocument.createElement('div'))
    const { unmount } = render(
      <>
        <DismissableLayer onDismiss={onDismiss} />
        <button type="button">Outside</button>
      </>,
      { container },
    )
    await wait(0)
    const sizes = { innerWidth: 300, innerHeight: 150 }
    for (const [key, value] of Object.entries(sizes)) {
      Object.defineProperty(frame.contentWindow, key, { configurable: true, value })
    }
    for (const [key, value] of Object.entries({
      clientWidth: 300,
      clientHeight: 150,
      scrollWidth: 300,
      scrollHeight: 900,
    })) {
      Object.defineProperty(frameDocument.documentElement, key, { configurable: true, value })
    }

    pressAt(within(container).getByText('Outside'), { clientX: 290, clientY: 50 })

    expect(onDismiss).not.toHaveBeenCalled()
    unmount()
    frame.remove()
  })

  it('closes at once at the edge of a page that does not scroll, or whose scrollbars take room', async () => {
    const onDismiss = mock()
    const outside = await renderLayer({ onDismiss })
    let restore = pageLaidOut({ down: false })

    try {
      pressAt(outside, { clientX: window.innerWidth - 10 })
      pressAt(outside, { clientY: window.innerHeight - 10 })
      restore()
      restore = pageLaidOut({ across: true, room: 15 })
      pressAt(outside, { clientX: window.innerWidth - 25 })
      pressAt(outside, { clientY: window.innerHeight - 25 })
      expect(onDismiss).toHaveBeenCalledTimes(4)
    } finally {
      restore()
    }
  })
})

describe('DismissableLayer closed by the press it hears', () => {
  it('hears no more of a press outside once the layer under it has closed it', async () => {
    const onUpperOutside = mock()
    function Pair() {
      const [open, setOpen] = React.useState(true)
      return open ? (
        <>
          <DismissableLayer onDismiss={() => setOpen(false)} />
          <DismissableLayer onPointerDownOutside={onUpperOutside} />
        </>
      ) : null
    }
    render(
      <>
        <Pair />
        <button type="button">Outside</button>
      </>,
    )
    await wait(0)

    fireEvent.pointerDown(screen.getByText('Outside'))

    expect(document.querySelector('[data-slot="dismissable-layer"]')).toBeNull()
    expect(onUpperOutside).not.toHaveBeenCalled()
  })
})

describe('DismissableLayer and the press around its mount', () => {
  it('leaves alone the press that opened it, which reaches the document after it mounts', () => {
    const onDismiss = mock()
    function Opener() {
      const [open, setOpen] = React.useState(false)
      const ref = React.useRef<HTMLButtonElement>(null)
      React.useEffect(() => {
        const button = ref.current as HTMLButtonElement
        const handleDown = () => flushSync(() => setOpen(true))
        button.addEventListener('pointerdown', handleDown)
        return () => button.removeEventListener('pointerdown', handleDown)
      }, [])
      return (
        <>
          <button ref={ref} type="button">
            Open
          </button>
          {open && <DismissableLayer onDismiss={onDismiss}>Layer</DismissableLayer>}
        </>
      )
    }
    render(<Opener />)
    const opener = screen.getByText('Open')

    act(
      () => void opener.dispatchEvent(new window.PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })),
    )

    expect(screen.getByText('Layer')).toBeTruthy()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('hears a press outside made after it mounted, without waiting for the task that mounted it to end', () => {
    const onDismiss = mock()
    render(<DismissableLayer onDismiss={onDismiss}>Layer</DismissableLayer>)
    const outside = document.body.appendChild(document.createElement('button'))
    // A busy page runs queued input before timers; the press is stamped on a later millisecond than the mount.
    const mountedAt = new window.Event('').timeStamp
    while (new window.Event('').timeStamp <= mountedAt) {}

    outside.dispatchEvent(new window.PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
    outside.remove()
  })
})

function inShadowRoot() {
  const host = document.createElement('div')
  document.body.append(host)
  const container = document.createElement('div')
  host.attachShadow({ mode: 'open' }).append(container)
  return container
}

describe('DismissableLayer inside a shadow root', () => {
  async function renderInShadow(props: React.ComponentProps<typeof DismissableLayer>) {
    const container = inShadowRoot()
    render(
      <>
        <DismissableLayer {...props}>
          <button type="button">Inside</button>
        </DismissableLayer>
        <DismissableLayerBranch>
          <input aria-label="Branch field" />
        </DismissableLayerBranch>
        <button type="button">Outside</button>
      </>,
      { container },
    )
    await wait(0)
    return within(container)
  }

  it('stays open on a press or focus in a branch inside the shadow root', async () => {
    const onDismiss = mock()
    const shadow = await renderInShadow({ onDismiss })

    fireEvent.pointerDown(shadow.getByLabelText('Branch field'))
    act(() => shadow.getByLabelText('Branch field').focus())

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('closes once focus moves from inside it to an element outside it in the same shadow root', async () => {
    const onDismiss = mock()
    const shadow = await renderInShadow({ onDismiss })

    act(() => shadow.getByText('Inside').focus())
    act(() => shadow.getByText('Outside').focus())

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('keeps hearing focus in the shadow root while another layer there stays open', () => {
    const onDismiss = mock()
    const container = inShadowRoot()
    const Two = ({ first }: { first: boolean }) => (
      <>
        {first ? <DismissableLayer /> : null}
        <DismissableLayer onDismiss={onDismiss}>
          <button type="button">Inside</button>
        </DismissableLayer>
        <button type="button">Outside</button>
      </>
    )
    const { rerender } = render(<Two first />, { container })
    rerender(<Two first={false} />)

    act(() => within(container).getByText('Inside').focus())
    act(() => within(container).getByText('Outside').focus())

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('stops hearing focus in the shadow root once its last layer there closes', () => {
    const onFocusOutside = mock()
    render(<DismissableLayer onFocusOutside={onFocusOutside} />)
    const container = inShadowRoot()
    const [first, second] = [document.createElement('button'), document.createElement('button')]
    container.after(first, second)
    render(<DismissableLayer />, { container }).unmount()

    act(() => first.focus())
    act(() => second.focus())

    expect(onFocusOutside).toHaveBeenCalledTimes(1)
  })

  it('hears focus moving into the shadow root once, though the shadow root and the document both hear it', async () => {
    const onFocusOutside = mock()
    const shadow = await renderInShadow({ onFocusOutside })

    act(() => shadow.getByText('Outside').focus())

    expect(onFocusOutside).toHaveBeenCalledTimes(1)
  })

  it.each([false, true])(
    'hands a press outside the element pressed, not the shadow host, when deferring is %p',
    async (deferPointerDownOutside) => {
      const pressed: (EventTarget | null)[] = []
      const onDismiss = mock()
      const shadow = await renderInShadow({
        deferPointerDownOutside,
        onDismiss,
        onPointerDownOutside: (event) => pressed.push(event.target),
      })
      const outside = shadow.getByText('Outside')

      await clickOutside(outside)

      expect(onDismiss).toHaveBeenCalledTimes(1)
      expect(pressed).toEqual([outside])
    },
  )

  it('closes on a press on a surface inside the shadow root, though the surface stops its click', async () => {
    const onDismiss = mock()
    function Surface() {
      return (
        // biome-ignore lint/a11y/noStaticElementInteractions: a backdrop for the pointer, as a dialog's overlay is
        // biome-ignore lint/a11y/useKeyWithClickEvents: a backdrop for the pointer, as a dialog's overlay is
        <div onClick={(event) => event.stopPropagation()} ref={useDismissableLayerSurface()}>
          Surface
        </div>
      )
    }
    const container = inShadowRoot()
    render(
      <>
        <DismissableLayer deferPointerDownOutside onDismiss={onDismiss} />
        <Surface />
      </>,
      { container },
    )
    await wait(0)

    await clickOutside(within(container).getByText('Surface'))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
