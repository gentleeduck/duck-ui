import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { act, render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import { Presence } from '../presence'
import { useHeldOpen } from '../presence.libs'

freshDom()

describe('Presence', () => {
  it('renders children when present=true', () => {
    const { container } = render(
      <Presence present={true}>
        <div data-testid="child">visible</div>
      </Presence>,
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it('does not render children when present=false', () => {
    const { container } = render(
      <Presence present={false}>
        <div data-testid="child">hidden</div>
      </Presence>,
    )
    expect(container.querySelector('[data-testid="child"]')).toBeNull()
  })

  it('supports render function children', () => {
    const { container } = render(
      <Presence present={true}>{({ present }) => <div data-testid="fn">{present ? 'yes' : 'no'}</div>}</Presence>,
    )
    expect(container.querySelector('[data-testid="fn"]')?.textContent).toBe('yes')
  })

  it('render function receives present=false when not present', () => {
    const { container } = render(
      <Presence present={false}>{({ present }) => <div data-testid="fn">{present ? 'yes' : 'no'}</div>}</Presence>,
    )
    // With render function, the child is always mounted (forceMount behavior)
    expect(container.querySelector('[data-testid="fn"]')?.textContent).toBe('no')
  })

  it('toggles visibility on present change', () => {
    const { container, rerender } = render(
      <Presence present={true}>
        <div data-testid="toggle">content</div>
      </Presence>,
    )
    expect(container.querySelector('[data-testid="toggle"]')).not.toBeNull()
    rerender(
      <Presence present={false}>
        <div data-testid="toggle">content</div>
      </Presence>,
    )
    // In jsdom without animations, unmount is immediate
    expect(container.querySelector('[data-testid="toggle"]')).toBeNull()
  })

  it('preserves child element type', () => {
    const { container } = render(
      <Presence present={true}>
        <button>I am a button</button>
      </Presence>,
    )
    expect(container.querySelector('button')?.textContent).toBe('I am a button')
  })

  it('initial present=false does not mount', () => {
    const { container } = render(
      <Presence present={false}>
        <span>never visible</span>
      </Presence>,
    )
    expect(container.querySelector('span')).toBeNull()
  })

  it('render function always mounts (forceMount behavior)', () => {
    const { container } = render(
      <Presence present={false}>
        {({ present }) => <div data-testid="force">{present ? 'visible' : 'hidden'}</div>}
      </Presence>,
    )
    // render function children are always mounted
    expect(container.querySelector('[data-testid="force"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="force"]')?.textContent).toBe('hidden')
  })
})

describe('Presence with a CSS exit animation', () => {
  let animationName = 'none'
  let animations: (Pick<Animation, 'finished' | 'pending' | 'playState'> & { animationName?: string })[] = []
  let styleSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    animationName = 'none'
    animations = []
    styleSpy = spyOn(globalThis, 'getComputedStyle').mockImplementation(
      () =>
        ({
          get animationName() {
            return animationName
          },
        }) as CSSStyleDeclaration,
    )
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', { configurable: true, value: () => animations })
  })

  afterEach(() => {
    styleSpy.mockRestore()
    Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations')
  })

  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

  function animate(name: string, playState: AnimationPlayState = 'running', pending = true) {
    let end = () => {}
    let cancel = () => {}
    const finished = new Promise<Animation>((resolve, reject) => {
      end = () => resolve({} as Animation)
      cancel = () => reject(new DOMException('The animation was cancelled.', 'AbortError'))
    })
    finished.catch(() => {})
    if (playState === 'finished') end()
    animations.push({ animationName: name, finished, pending, playState })
    return { end, cancel }
  }

  async function settle(change: () => void) {
    await act(async () => {
      change()
      await tick()
    })
  }

  function renderContent(present: boolean) {
    return render(
      <Presence present={present}>
        <div data-testid="content" />
      </Presence>,
    )
  }

  function animationEvent(type: 'animationstart' | 'animationcancel', name: string) {
    const event = new Event(type, { bubbles: true })
    Object.defineProperty(event, 'animationName', { value: name })
    act(() => {
      screen.getByTestId('content').dispatchEvent(event)
    })
  }

  function close(rerender: (ui: React.ReactElement) => void, exitAnimation: string) {
    animationName = exitAnimation
    rerender(
      <Presence present={false}>
        <div data-testid="content" />
      </Presence>,
    )
  }

  it('stays mounted until the exit animation ends', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out')

    close(rerender, 'fade-out')
    const shown = [screen.queryByTestId('content') !== null]
    await settle(fadeOut.end)
    shown.push(screen.queryByTestId('content') !== null)

    expect(shown).toEqual([true, false])
  })

  it('waits for every exit animation to end, not the first', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out')
    const slideOut = animate('slide-out')
    close(rerender, 'fade-out, slide-out')

    await settle(fadeOut.end)
    const shown = [screen.queryByTestId('content') !== null]
    await settle(slideOut.end)
    shown.push(screen.queryByTestId('content') !== null)

    expect(shown).toEqual([true, false])
  })

  it('ends the exit when its animation is cancelled', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out')
    close(rerender, 'fade-out')

    await settle(fadeOut.cancel)

    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('keeps exiting when the opening animation it interrupted is cancelled, though the exit name contains its name', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out')
    close(rerender, 'fade-out')

    animationEvent('animationcancel', 'fade')
    const shown = [screen.queryByTestId('content') !== null]
    await settle(fadeOut.end)
    shown.push(screen.queryByTestId('content') !== null)

    expect(shown).toEqual([true, false])
  })

  it('drops the content at once when none of its exit animations runs, as for a name with no keyframes', () => {
    const { rerender } = renderContent(true)
    animate('fade-in', 'finished')

    close(rerender, 'fade-out')

    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('waits for a paused exit animation, which ends once it plays again', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out', 'paused')
    close(rerender, 'fade-out')
    const shown = [screen.queryByTestId('content') !== null]

    await settle(fadeOut.end)
    shown.push(screen.queryByTestId('content') !== null)

    expect(shown).toEqual([true, false])
  })

  it('waits for CSS animations only, not a transition or a script animation running beside them', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out')
    animations.push({ finished: new Promise(() => {}), pending: true, playState: 'running' })
    close(rerender, 'fade-out')

    await settle(fadeOut.end)

    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('unmounts at once when the animation running on close is the one that ran while open', () => {
    const { rerender } = renderContent(true)
    animationName = 'spin'
    animationEvent('animationstart', 'spin')
    animate('spin')

    close(rerender, 'spin')

    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('unmounts at once when the animation it opened with is still in its delay, which sends no animationstart', () => {
    const { rerender } = renderContent(true)
    animate('spin', 'running', false)

    close(rerender, 'spin')

    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('learns the open animation inside a shadow root, which an animation event does not leave', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const container = document.createElement('div')
    host.attachShadow({ mode: 'open' }).append(container)
    const content = (present: boolean) => (
      <Presence present={present}>
        <div data-testid="content" />
      </Presence>
    )
    const { rerender } = render(content(true), { container })
    animationName = 'spin'
    const event = new Event('animationstart', { bubbles: true })
    Object.defineProperty(event, 'animationName', { value: 'spin' })
    act(() => {
      container.querySelector('[data-testid="content"]')?.dispatchEvent(event)
    })
    animate('spin')

    rerender(content(false))

    expect(container.querySelector('[data-testid="content"]')).toBeNull()
    host.remove()
  })

  it('learns the open animation from the content, not from a child animating inside it', () => {
    const content = (present: boolean) => (
      <Presence present={present}>
        <div data-testid="content">
          <span data-testid="child" />
        </div>
      </Presence>
    )
    const { rerender } = render(content(true))
    animationName = 'spin'
    animate('spin')
    const event = new Event('animationstart', { bubbles: true })
    Object.defineProperty(event, 'animationName', { value: 'spin' })
    act(() => {
      screen.getByTestId('child').dispatchEvent(event)
    })

    rerender(content(false))

    expect(screen.queryByTestId('content')).not.toBeNull()
  })

  it('stops learning from an element its child no longer gives it', () => {
    function Moving(props: { moved: boolean; ref?: React.Ref<HTMLDivElement> }) {
      return (
        <div>
          <div data-testid="first" ref={props.moved ? undefined : props.ref} />
          <div data-testid="content" ref={props.moved ? props.ref : undefined} />
        </div>
      )
    }
    const view = (present: boolean) => (
      <Presence present={present}>
        <Moving moved />
      </Presence>
    )
    const { rerender } = render(
      <Presence present>
        <Moving moved={false} />
      </Presence>,
    )
    rerender(view(true))
    animationName = 'spin'
    const event = new Event('animationstart', { bubbles: true })
    Object.defineProperty(event, 'animationName', { value: 'spin' })
    act(() => {
      screen.getByTestId('first').dispatchEvent(event)
    })
    animate('spin')

    rerender(view(false))

    expect(screen.queryByTestId('content')).not.toBeNull()
  })

  it('holds the last frame with a forwards fill until React has unmounted, then puts the fill mode back', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out')
    close(rerender, 'fade-out')
    const content = screen.getByTestId('content')
    const fillModes: string[] = []

    await act(async () => {
      fadeOut.end()
      await tick()
      fillModes.push(content.style.animationFillMode)
      await tick()
      fillModes.push(content.style.animationFillMode)
    })

    expect(fillModes).toEqual(['forwards', ''])
    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('keeps a fill mode set while the unmount waits a frame', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out')
    close(rerender, 'fade-out')
    const content = screen.getByTestId('content')

    await act(async () => {
      fadeOut.end()
      await tick()
      content.style.animationFillMode = 'both'
      await tick()
    })

    expect(content.style.animationFillMode).toBe('both')
  })

  it('finishes the exit of content in a document without a window, and gives back its fill mode', async () => {
    const other = document.implementation.createHTMLDocument('detached')
    const container = other.body.appendChild(other.createElement('div'))
    const content = (present: boolean) => (
      <Presence present={present}>
        <div data-testid="content" />
      </Presence>
    )
    const { rerender } = render(content(true), { container })
    const fadeOut = animate('fade-out')
    animationName = 'fade-out'
    rerender(content(false))
    const node = container.querySelector<HTMLElement>('[data-testid="content"]')

    await act(async () => {
      fadeOut.end()
      await tick()
      await tick()
    })

    expect([container.contains(node), node?.style.animationFillMode]).toEqual([false, ''])
  })

  it('holds its content open for the render that closes it, until the exit starts', () => {
    const held: boolean[] = []
    function Content(props: { open: boolean; ref?: React.Ref<HTMLDivElement> }) {
      held.push(useHeldOpen(props.open))
      return <div data-testid="content" ref={props.ref} />
    }
    const view = (present: boolean) => (
      <Presence present={present}>
        <Content open={present} />
      </Presence>
    )
    const { rerender } = render(view(true))
    animate('fade-out')
    animationName = 'fade-out'

    rerender(view(false))

    expect(held).toEqual([true, true, false])
  })

  it('keeps the content when it reopens during the exit animation, which the reopening cancels', async () => {
    const { rerender } = renderContent(true)
    const fadeOut = animate('fade-out')
    close(rerender, 'fade-out')

    rerender(
      <Presence present>
        <div data-testid="content" />
      </Presence>,
    )
    const content = screen.getByTestId('content')
    let fillMode = ''
    await act(async () => {
      fadeOut.cancel()
      await tick()
      fillMode = content.style.animationFillMode
    })

    expect([fillMode, screen.queryByTestId('content')]).toEqual(['', content])
  })

  it('forgets the animation it opened with once it reopens, so an exit by that name runs after an opening without one', async () => {
    const { rerender } = renderContent(true)
    animationName = 'spin'
    animationEvent('animationstart', 'spin')
    const fadeOut = animate('fade-out')
    close(rerender, 'fade-out')
    await settle(fadeOut.end)
    animationName = 'none'
    rerender(
      <Presence present>
        <div data-testid="content" />
      </Presence>,
    )
    animations = []
    animate('spin')

    close(rerender, 'spin')

    expect(screen.queryByTestId('content')).not.toBeNull()
  })
})

describe('Presence and the child ref', () => {
  it('attaches the child ref once, however often the child renders with a new one', () => {
    const calls: (string | null)[] = []
    function Case({ tick }: { tick: number }) {
      return (
        <Presence present>
          <button type="button" data-tick={tick} ref={(node) => void calls.push(node && node.tagName)} />
        </Presence>
      )
    }
    const { rerender, unmount } = render(<Case tick={0} />)

    rerender(<Case tick={1} />)
    rerender(<Case tick={2} />)
    unmount()

    expect(calls).toEqual(['BUTTON', null])
  })

  it('gives the node to a ref object on the child and takes it back on unmount', () => {
    const ref = React.createRef<HTMLButtonElement>()
    const { unmount } = render(
      <Presence present>
        <button type="button" ref={ref} />
      </Presence>,
    )
    expect(ref.current?.tagName).toBe('BUTTON')

    unmount()

    expect(ref.current).toBeNull()
  })

  it('runs the cleanup a child callback ref returns', () => {
    const cleanups: string[] = []
    const { unmount } = render(
      <Presence present>
        <button type="button" ref={() => () => void cleanups.push('done')} />
      </Presence>,
    )

    unmount()

    expect(cleanups).toEqual(['done'])
  })
})
