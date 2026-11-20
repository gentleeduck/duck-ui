import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import { createPopperScope, Popper, PopperAnchor, PopperArrow, PopperContent } from '../index'

freshDom()

describe('Popper', () => {
  it('renders children', () => {
    const { container } = render(
      <Popper>
        <span data-testid="child">inside popper</span>
      </Popper>,
    )
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe('inside popper')
  })

  it('renders anchor with data-slot="popper-anchor"', () => {
    const { container } = render(
      <Popper>
        <PopperAnchor>
          <button>Anchor</button>
        </PopperAnchor>
      </Popper>,
    )
    expect(container.querySelector('[data-slot="popper-anchor"]')).not.toBeNull()
  })

  it('renders anchor as a div by default', () => {
    const { container } = render(
      <Popper>
        <PopperAnchor>anchor content</PopperAnchor>
      </Popper>,
    )
    expect(container.querySelector('div[data-slot="popper-anchor"]')).not.toBeNull()
  })

  it('anchor supports asChild', () => {
    const { container } = render(
      <Popper>
        <PopperAnchor asChild>
          <button>Anchor button</button>
        </PopperAnchor>
      </Popper>,
    )
    expect(container.querySelector('button')?.textContent).toBe('Anchor button')
  })

  it('an asChild anchor leaves the slot to the component it is given, which names its own', () => {
    const Tag = (props: React.ComponentProps<'button'>) => <button data-slot="tag" type="button" {...props} />
    render(
      <Popper>
        <PopperAnchor asChild>
          <Tag>Anchor button</Tag>
        </PopperAnchor>
      </Popper>,
    )

    expect(screen.getByRole('button').getAttribute('data-slot')).toBe('tag')
  })

  it('anchor forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Popper>
        <PopperAnchor ref={ref}>anchor</PopperAnchor>
      </Popper>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('mirrors left and right sides in RTL', () => {
    const renderSide = (dir: 'ltr' | 'rtl', side: 'left' | 'right' | 'top') =>
      render(
        <DirectionProvider dir={dir}>
          <Popper>
            <PopperAnchor>anchor</PopperAnchor>
            <PopperContent dir={dir} side={side}>
              content
            </PopperContent>
          </Popper>
        </DirectionProvider>,
      )
    const cases = [
      ['ltr', 'right', 'right'],
      ['rtl', 'right', 'left'],
      ['rtl', 'left', 'right'],
      ['rtl', 'top', 'top'],
    ] as const
    for (const [dir, side, expected] of cases) {
      const { container, unmount } = renderSide(dir, side)
      expect(container.querySelector('[data-slot="popper-content"]')?.getAttribute('data-side')).toBe(expected)
      unmount()
    }
  })

  it('takes its direction from its own dir over its DirectionProvider', () => {
    const { container } = render(
      <DirectionProvider dir="ltr">
        <Popper>
          <PopperAnchor>anchor</PopperAnchor>
          <PopperContent dir="rtl" side="left">
            content
          </PopperContent>
        </Popper>
      </DirectionProvider>,
    )

    expect(container.querySelector('[data-slot="popper-content"]')?.getAttribute('data-side')).toBe('right')
  })

  it('renders nothing for a virtual anchor', () => {
    const { container } = render(
      <Popper>
        <PopperAnchor virtualRef={{ current: null }}>anchor</PopperAnchor>
      </Popper>,
    )

    expect(container.innerHTML).toBe('')
  })

  it('keeps a popper a component scopes apart from the one around it', () => {
    const usePopperScope = createPopperScope()
    function Inner() {
      const scope = usePopperScope(undefined)
      return (
        <Popper {...scope}>
          <PopperAnchor {...scope} data-testid="inner-anchor" />
          <PopperContent {...scope} side="top">
            <PopperArrow {...scope} />
          </PopperContent>
        </Popper>
      )
    }

    const { getByTestId } = render(
      <Popper>
        <PopperAnchor data-testid="outer-anchor" />
        <Inner />
      </Popper>,
    )

    expect([
      getByTestId('inner-anchor').getAttribute('data-popper-side'),
      getByTestId('outer-anchor').hasAttribute('data-popper-side'),
    ]).toEqual(['top', false])
  })

  it('draws its arrow as a block, keeping the style it was given', () => {
    const { container } = render(
      <Popper>
        <PopperAnchor />
        <PopperContent>
          <PopperArrow style={{ fill: 'red' }} />
        </PopperContent>
      </Popper>,
    )
    const arrow = container.querySelector<SVGElement>('[data-slot="popper-arrow"] > svg')!

    expect([arrow.style.display, arrow.style.fill]).toEqual(['block', 'red'])
  })
})

describe('Popper placement on the anchor', () => {
  it('marks the anchor with the side and align the content was placed at', () => {
    const { getByTestId } = render(
      <Popper>
        <PopperAnchor data-testid="anchor" />
        <PopperContent side="top" align="start">
          Content
        </PopperContent>
      </Popper>,
    )

    expect(getByTestId('anchor').getAttribute('data-popper-side')).toBe('top')
    expect(getByTestId('anchor').getAttribute('data-popper-align')).toBe('start')
  })

  it('marks the child an asChild anchor renders', () => {
    const { getByTestId } = render(
      <Popper>
        <PopperAnchor asChild>
          <button type="button" data-testid="anchor">
            Open
          </button>
        </PopperAnchor>
        <PopperContent>Content</PopperContent>
      </Popper>,
    )

    expect(getByTestId('anchor').tagName).toBe('BUTTON')
    expect(getByTestId('anchor').getAttribute('data-popper-side')).toBe('bottom')
    expect(getByTestId('anchor').getAttribute('data-popper-align')).toBe('center')
  })

  it('follows a change of side and clears the marks once the content is gone', async () => {
    function Case({ side }: { side?: 'left' | 'right' }) {
      return (
        <Popper>
          <PopperAnchor data-testid="anchor" />
          {side && <PopperContent side={side}>Content</PopperContent>}
        </Popper>
      )
    }
    const { getByTestId, rerender } = render(<Case side="left" />)

    rerender(<Case side="right" />)
    await waitFor(() => expect(getByTestId('anchor').getAttribute('data-popper-side')).toBe('right'))

    rerender(<Case />)
    expect(getByTestId('anchor').hasAttribute('data-popper-side')).toBe(false)
    expect(getByTestId('anchor').hasAttribute('data-popper-align')).toBe(false)
  })

  it('marks the anchor without rendering the rest of the popper again', () => {
    let renders = 0
    function Sibling() {
      renders++
      return null
    }
    const { unmount } = render(
      <Popper>
        <PopperAnchor data-testid="anchor" />
        <Sibling />
      </Popper>,
    )
    const alone = renders
    unmount()
    renders = 0

    render(
      <Popper>
        <PopperAnchor data-testid="anchor" />
        <Sibling />
        <PopperContent>Content</PopperContent>
      </Popper>,
    )

    expect(renders).toBe(alone)
  })
})

type Box = [x: number, y: number, width: number, height: number]

// jsdom lays nothing out, so each element reports the box its test id or slot names.
function stubLayout(boxes: Record<string, Box>) {
  const boxOf = (element: Element) =>
    boxes[element.getAttribute('data-testid') ?? element.getAttribute('data-slot') ?? ''] ?? [0, 0, 0, 0]
  const proto = HTMLElement.prototype
  const saved = (['getBoundingClientRect', 'offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight'] as const).map(
    (name) => [name, Object.getOwnPropertyDescriptor(proto, name)] as const,
  )
  Object.defineProperty(proto, 'getBoundingClientRect', {
    configurable: true,
    value(this: Element) {
      return new DOMRect(...boxOf(this))
    },
  })
  // Floating UI sizes the content by its computed width, which happy-dom leaves empty, so offsetWidth stands in for it
  // unrounded. A browser rounds clientWidth.
  for (const [name, side, measure] of [
    ['offsetWidth', 2, Number],
    ['offsetHeight', 3, Number],
    ['clientWidth', 2, Math.round],
    ['clientHeight', 3, Math.round],
  ] as const) {
    Object.defineProperty(proto, name, {
      configurable: true,
      get(this: Element) {
        return measure(boxOf(this)[side])
      },
    })
  }
  Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1000 })
  Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 800 })

  return () => {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(proto, name, descriptor)
      else delete (proto as unknown as Record<string, unknown>)[name]
    }
    delete (document.documentElement as unknown as Record<string, unknown>).clientWidth
    delete (document.documentElement as unknown as Record<string, unknown>).clientHeight
  }
}

describe('Popper positioning', () => {
  const boxes: Record<string, Box> = {}
  let restoreLayout = () => {}
  beforeAll(() => {
    restoreLayout = stubLayout(boxes)
  })
  afterAll(() => restoreLayout())

  function mount(
    props: React.ComponentProps<typeof PopperContent>,
    {
      anchor = [100, 100, 50, 20] as Box,
      wrapper = [0, 0, 80, 40] as Box,
      arrow = false as boolean | Box,
      scroller = undefined as Box | undefined,
    } = {},
  ) {
    Object.assign(boxes, {
      anchor,
      'popper-content-wrapper': wrapper,
      'popper-arrow': arrow === true ? [0, 0, 10, 5] : arrow,
    })
    if (scroller) boxes.scroller = scroller
    const anchorElement = <PopperAnchor data-testid="anchor" />
    const { container, unmount } = render(
      <Popper>
        {scroller ? (
          <div data-testid="scroller" style={{ overflow: 'auto' }}>
            {anchorElement}
          </div>
        ) : (
          anchorElement
        )}
        <PopperContent {...props}>Content{arrow && <PopperArrow />}</PopperContent>
      </Popper>,
    )
    return {
      wrapper: container.querySelector<HTMLElement>('[data-slot="popper-content-wrapper"]')!,
      content: container.querySelector<HTMLElement>('[data-slot="popper-content"]')!,
      unmount,
    }
  }

  async function place(...args: Parameters<typeof mount>) {
    const { wrapper, content } = mount(...args)
    await waitFor(() => expect(wrapper.style.transform).not.toBe('translate(0, -200%)'))
    const arrow = content.querySelector<HTMLElement>('[data-slot="popper-arrow"]')
    return {
      wrapper,
      content,
      side: content.getAttribute('data-side'),
      position: wrapper.style.transform,
      arrow: arrow && [arrow.style.left, arrow.style.visibility],
      origin: wrapper.style.getPropertyValue('--gentleduck-popper-transform-origin'),
      available: [
        wrapper.style.getPropertyValue('--gentleduck-popper-available-width'),
        wrapper.style.getPropertyValue('--gentleduck-popper-available-height'),
      ],
      hidden: wrapper.style.visibility === 'hidden' && wrapper.style.pointerEvents === 'none',
    }
  }

  function addBoundary(box: Box) {
    boxes.boundary = box
    const boundary = document.createElement('div')
    boundary.setAttribute('data-testid', 'boundary')
    document.body.append(boundary)
    return boundary
  }

  it('shows an arrow that points at the middle of a small anchor once its padding slid the content over', async () => {
    const { position, arrow } = await place(
      { align: 'start', arrowPadding: 12 },
      { anchor: [48, 112, 24, 24], wrapper: [0, 0, 165.047, 38], arrow: [0, 0, 16, 8] },
    )

    expect([position, arrow]).toEqual(['translate(40px, 144px)', ['12px', '']])
  })

  it("keeps inside its own window's viewport, not the one of an anchor from another document", async () => {
    Object.assign(boxes, { anchor: [100, 100, 50, 20], 'popper-content-wrapper': [0, 0, 80, 40] })
    const anchor = document.implementation.createHTMLDocument().createElement('div')
    anchor.setAttribute('data-testid', 'anchor')
    const boundary = addBoundary([0, 0, 1000, 800])

    try {
      const { container } = render(
        <Popper>
          <PopperAnchor virtualRef={{ current: anchor }} />
          <PopperContent collisionBoundary={boundary}>Content</PopperContent>
        </Popper>,
      )
      const wrapper = container.querySelector<HTMLElement>('[data-slot="popper-content-wrapper"]')!

      await waitFor(() => expect(wrapper.style.transform).toBe('translate(85px, 120px)'))
    } finally {
      boundary.remove()
    }
  })

  it('sets its arrow on the side facing the anchor, turned to point at it', async () => {
    const arrows: string[][] = []
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      const { content } = await place({ side }, { arrow: true })
      const { style } = content.querySelector<HTMLElement>('[data-slot="popper-arrow"]')!
      arrows.push([
        style.position,
        style.top,
        style.right,
        style.bottom,
        style.left,
        style.transformOrigin,
        style.transform,
      ])
    }

    expect(arrows).toEqual([
      ['absolute', '', '', '0px', '35px', '', 'translateY(100%)'],
      ['absolute', '17.5px', '', '', '0px', '0 0', 'translateY(50%) rotate(90deg) translateX(-50%)'],
      ['absolute', '0px', '', '', '35px', 'center 0', 'rotate(180deg)'],
      ['absolute', '17.5px', '0px', '', '', '100% 0', 'translateY(50%) rotate(-90deg) translateX(50%)'],
    ])
  })

  it('holds its wrapper off screen until placed, then pins it at least as wide as its content', async () => {
    const { wrapper } = mount({})
    const before = wrapper.style.transform

    await waitFor(() => expect(wrapper.style.transform).not.toBe(before))

    expect([before, wrapper.style.position, wrapper.style.left, wrapper.style.top, wrapper.style.minWidth]).toEqual([
      'translate(0, -200%)',
      'fixed',
      '0px',
      '0px',
      'max-content',
    ])
  })

  it("tells its content the anchor's size", async () => {
    const { wrapper } = await place({})

    expect([
      wrapper.style.getPropertyValue('--gentleduck-popper-anchor-width'),
      wrapper.style.getPropertyValue('--gentleduck-popper-anchor-height'),
    ]).toEqual(['50px', '20px'])
  })

  it('names the side and alignment it was placed at, after a flip', async () => {
    const { content } = await place({ align: 'end' }, { anchor: [100, 770, 50, 20] })

    expect([content.getAttribute('data-side'), content.getAttribute('data-align')]).toEqual(['top', 'end'])
  })

  it('places itself where the host has no ResizeObserver, as a test DOM may not', async () => {
    const original = globalThis.ResizeObserver
    Reflect.deleteProperty(globalThis, 'ResizeObserver')

    try {
      const { position } = await place({})

      expect(position).toBe('translate(85px, 120px)')
    } finally {
      globalThis.ResizeObserver = original
    }
  })

  it('skips a null collision boundary', async () => {
    const alone = await place({ collisionBoundary: null })
    const listed = await place({ collisionBoundary: [null] })

    expect([alone.position, listed.position]).toEqual(['translate(85px, 120px)', 'translate(85px, 120px)'])
  })

  it('keeps its collision padding when it shifts', async () => {
    const { position } = await place({ sticky: 'always', collisionPadding: 20 }, { anchor: [-100, 100, 50, 20] })

    expect(position).toBe('translate(20px, 120px)')
  })

  it("shifts along its side's own axis rather than flipping, when told to", async () => {
    const nearRight: Box = [940, 100, 50, 20]

    const flipped = await place({ side: 'right' }, { anchor: nearRight })
    const shifted = await place({ side: 'right', shiftCrossAxis: true }, { anchor: nearRight })

    expect([flipped.side, flipped.position, shifted.side, shifted.position]).toEqual([
      'left',
      'translate(860px, 90px)',
      'right',
      'translate(920px, 90px)',
    ])
  })

  it('counts an anchor inside its collision padding as out of view when hiding', async () => {
    const nearTop: Box = [100, 5, 50, 20]

    const flush = await place({ hideWhenDetached: true }, { anchor: nearTop })
    const padded = await place({ hideWhenDetached: true, collisionPadding: 30 }, { anchor: nearTop })

    expect([flush.hidden, padded.hidden]).toEqual([false, true])
  })

  it('keeps clear of only the edges a collision padding names', async () => {
    const { available } = await place({ collisionPadding: { bottom: 30, left: 20 } })

    expect(available).toEqual(['980px', '650px'])
  })

  it('takes one element as its collision boundary', async () => {
    const boundary = addBoundary([0, 0, 1000, 400])

    try {
      const { available } = await place({ collisionBoundary: boundary })

      expect(available).toEqual(['1000px', '280px'])
    } finally {
      boundary.remove()
    }
  })

  it('stops shifting at the anchor edge, or keeps shifting when sticky is always', async () => {
    const offLeft: Box = [-100, 100, 50, 20]

    const partial = await place({}, { anchor: offLeft })
    const always = await place({ sticky: 'always' }, { anchor: offLeft })

    expect([partial.position, always.position]).toEqual(['translate(-50px, 120px)', 'translate(0px, 120px)'])
  })

  it('hides itself once its anchor leaves the viewport, when asked', async () => {
    const aboveView: Box = [100, -100, 50, 20]

    const kept = await place({}, { anchor: aboveView })
    const hidden = await place({ hideWhenDetached: true }, { anchor: aboveView })

    expect([kept.hidden, hidden.hidden]).toEqual([false, true])
  })

  it('hides itself once a scroll container clips its anchor, with no boundary given', async () => {
    const { hidden } = await place({ hideWhenDetached: true }, { scroller: [0, 300, 1000, 200] })

    expect(hidden).toBe(true)
  })

  it('hides itself once a scroll container clips its anchor, with only a null boundary given', async () => {
    const { hidden } = await place(
      { hideWhenDetached: true, collisionBoundary: [null] },
      { scroller: [0, 300, 1000, 200] },
    )

    expect(hidden).toBe(true)
  })

  it('hides itself once its anchor leaves the collision boundary', async () => {
    const boundary = addBoundary([0, 500, 1000, 300])

    try {
      const { hidden } = await place({ hideWhenDetached: true, collisionBoundary: [boundary] })

      expect(hidden).toBe(true)
    } finally {
      boundary.remove()
    }
  })

  it('grows from the arrow on every side', async () => {
    const origins: string[] = []
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      origins.push((await place({ side }, { arrow: true })).origin)
    }

    expect(origins).toEqual(['40px 45px', '-5px 20px', '40px -5px', '85px 20px'])
  })

  it('reports once it is placed, and holds its animation until then', async () => {
    const onPlaced = vi.fn()
    const { content } = mount({ onPlaced })
    const before = [onPlaced.mock.calls.length, content.style.animation]

    await waitFor(() => expect(onPlaced).toHaveBeenCalled())

    expect([before, onPlaced.mock.calls.length, content.style.animation]).toEqual([[0, 'none'], 1, ''])
  })

  it('runs an animation given in its style once it is placed', async () => {
    const { wrapper, content } = mount({ style: { animation: 'grow 1s' } })
    const before = content.style.animation

    await waitFor(() => expect(wrapper.style.transform).not.toBe('translate(0, -200%)'))

    expect([before, content.style.animation]).toEqual(['none', 'grow 1s'])
  })

  it('aligns and grows the way its DirectionProvider reads when portalled out of it', async () => {
    Object.assign(boxes, { anchor: [100, 100, 50, 20], 'popper-content-wrapper': [0, 0, 80, 40] })
    render(
      <DirectionProvider dir="rtl">
        <Popper>
          <PopperAnchor data-testid="anchor" />
          {ReactDOM.createPortal(<PopperContent align="start">Content</PopperContent>, document.body)}
        </Popper>
      </DirectionProvider>,
    )
    const wrapper = document.querySelector<HTMLElement>('[data-slot="popper-content-wrapper"]')!

    await waitFor(() => expect(wrapper.style.transform).not.toBe('translate(0, -200%)'))

    expect([wrapper.style.transform, wrapper.style.getPropertyValue('--gentleduck-popper-transform-origin')]).toEqual([
      'translate(70px, 120px)',
      '100% 0px',
    ])
  })

  it('stacks its wrapper at the z-index the content asks for', async () => {
    const { wrapper } = mount({ style: { zIndex: 50 } })

    await waitFor(() => expect(wrapper.style.zIndex).toBe('50'))
  })

  it('follows a moving anchor every frame only when its update strategy is always', async () => {
    const optimized = mount({})
    const always = mount({ updatePositionStrategy: 'always' })
    await waitFor(() => expect(always.wrapper.style.transform).toBe('translate(85px, 120px)'))

    boxes.anchor = [300, 100, 50, 20]
    await waitFor(() => expect(always.wrapper.style.transform).toBe('translate(285px, 120px)'))
    await wait(50)

    expect(optimized.wrapper.style.transform).toBe('translate(85px, 120px)')
  })

  it('places every open content again as the window resizes, and still does once one of them closes', async () => {
    const first = mount({})
    const second = mount({})
    const positions = () => [first.wrapper.style.transform, second.wrapper.style.transform]
    await waitFor(() => expect(positions()).toEqual(['translate(85px, 120px)', 'translate(85px, 120px)']))

    boxes.anchor = [300, 100, 50, 20]
    window.dispatchEvent(new Event('resize'))
    await waitFor(() => expect(positions()).toEqual(['translate(285px, 120px)', 'translate(285px, 120px)']))

    first.unmount()
    boxes.anchor = [200, 100, 50, 20]
    window.dispatchEvent(new Event('resize'))

    await waitFor(() => expect(second.wrapper.style.transform).toBe('translate(185px, 120px)'))
  })

  describe('as sizes change', () => {
    const observers: { report: ResizeObserverCallback; targets: Element[]; connected: boolean }[] = []
    const original = globalThis.ResizeObserver
    beforeAll(() => {
      globalThis.ResizeObserver = class {
        watched: (typeof observers)[number]
        constructor(report: ResizeObserverCallback) {
          this.watched = { report, targets: [], connected: true }
          observers.push(this.watched)
        }
        observe(target: Element) {
          this.watched.targets.push(target)
        }
        unobserve() {}
        disconnect() {
          this.watched.connected = false
        }
      } as never
    })
    afterAll(() => {
      globalThis.ResizeObserver = original
    })

    const report = (target: Element, [, , width, height]: Box) => {
      for (const { report, targets, connected } of observers)
        if (connected && targets.includes(target))
          report([{ target, borderBoxSize: [{ inlineSize: width, blockSize: height }] } as never], null as never)
    }

    it("places itself again for its anchor's new size or its own, and not for a size it was placed at", async () => {
      const { wrapper } = await place({})
      const anchor = screen.getByTestId('anchor')

      // Moved without being resized, so placing it again would show.
      boxes.anchor = [300, 100, 50, 20]
      report(anchor, boxes.anchor)
      report(wrapper, boxes['popper-content-wrapper'])
      await wait(50)
      expect(wrapper.style.transform).toBe('translate(85px, 120px)')

      boxes.anchor = [300, 100, 70, 20]
      report(anchor, boxes.anchor)
      await waitFor(() => expect(wrapper.style.transform).toBe('translate(295px, 120px)'))

      boxes.anchor = [300, 100, 70, 30]
      report(anchor, boxes.anchor)
      await waitFor(() => expect(wrapper.style.transform).toBe('translate(295px, 130px)'))

      boxes['popper-content-wrapper'] = [0, 0, 100, 40]
      report(wrapper, boxes['popper-content-wrapper'])
      await waitFor(() => expect(wrapper.style.transform).toBe('translate(285px, 130px)'))
    })

    it('stops watching sizes, scrolls and resizes once it closes', async () => {
      const added = vi.spyOn(window, 'addEventListener')
      const removed = vi.spyOn(window, 'removeEventListener')
      try {
        const { wrapper, unmount } = mount({})
        await waitFor(() => expect(wrapper.style.transform).toBe('translate(85px, 120px)'))
        const watching = observers.filter(({ targets }) => targets.includes(wrapper))

        unmount()

        const calls = (spy: typeof added) =>
          spy.mock.calls
            .filter(([type]) => type === 'scroll' || type === 'resize')
            .map(([type, listener]) => ({ type, listener }))
        expect(calls(added).length).toBeGreaterThan(0)
        expect([watching.map(({ connected }) => connected), calls(removed)]).toEqual([[false], calls(added)])
      } finally {
        added.mockRestore()
        removed.mockRestore()
      }
    })
  })

  it('flips and shifts away from the edges unless told not to avoid collisions', async () => {
    const nearBottom: Box = [100, 770, 50, 20]
    const offLeft: Box = [-100, 100, 50, 20]

    const avoided = [await place({}, { anchor: nearBottom }), await place({}, { anchor: offLeft })]
    const kept = [
      await place({ avoidCollisions: false }, { anchor: nearBottom }),
      await place({ avoidCollisions: false }, { anchor: offLeft }),
    ]

    expect(avoided.map(({ side, position }) => [side, position])).toEqual([
      ['top', 'translate(85px, 730px)'],
      ['bottom', 'translate(-50px, 120px)'],
    ])
    expect(kept.map(({ side, position }) => [side, position])).toEqual([
      ['bottom', 'translate(85px, 790px)'],
      ['bottom', 'translate(-115px, 120px)'],
    ])
  })

  it('stands off by its side offset and the arrow, and slides by its align offset', async () => {
    const { position } = await place({ sideOffset: 8, align: 'start', alignOffset: 10 }, { arrow: true })

    expect(position).toBe('translate(110px, 133px)')
  })

  it('keeps the arrow its padding from the corner, sliding over so it still points at the anchor', async () => {
    const narrow: Box = [100, 100, 10, 20]

    const flush = await place({ align: 'start' }, { anchor: narrow, arrow: true })
    const padded = await place({ align: 'start', arrowPadding: 8 }, { anchor: narrow, arrow: true })

    expect([flush.position, flush.arrow, padded.position, padded.arrow]).toEqual([
      'translate(100px, 125px)',
      ['0px', ''],
      'translate(92px, 125px)',
      ['8px', ''],
    ])
  })

  it('hides the arrow once a shift leaves it unable to point at the anchor, growing from its edge instead', async () => {
    const atLeftEdge: Box = [0, 100, 10, 20]

    const flush = await place({}, { anchor: atLeftEdge, arrow: true })
    const padded = await place({ arrowPadding: 8 }, { anchor: atLeftEdge, arrow: true })

    expect([flush.arrow, flush.origin, padded.arrow, padded.origin]).toEqual([
      ['0px', ''],
      '5px -5px',
      ['8px', 'hidden'],
      '50% 0px',
    ])
  })

  it('grows from the edge it is aligned to when it has no arrow, mirrored in RTL above and below', async () => {
    const origins: string[] = []
    for (const align of ['start', 'center', 'end'] as const) origins.push((await place({ align })).origin)
    for (const side of ['top', 'right', 'left'] as const) origins.push((await place({ side, align: 'start' })).origin)
    for (const side of ['bottom', 'top', 'right'] as const) {
      origins.push((await place({ side, align: 'start', dir: 'rtl' })).origin)
    }

    expect(origins).toEqual([
      '0% 0px',
      '50% 0px',
      '100% 0px',
      '0% 40px',
      '0px 0%',
      '80px 0%',
      '100% 0px',
      '100% 40px',
      '80px 0%',
    ])
  })
})

describe('Popper anchor from another window', () => {
  it('marks an anchor that lives in an iframe', () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)
    const button = iframe.contentDocument!.createElement('button')
    iframe.contentDocument!.body.append(button)

    try {
      render(
        <Popper>
          <PopperAnchor virtualRef={{ current: button }} />
          <PopperContent side="top">Content</PopperContent>
        </Popper>,
      )

      expect(button.getAttribute('data-popper-side')).toBe('top')
    } finally {
      iframe.remove()
    }
  })
})
