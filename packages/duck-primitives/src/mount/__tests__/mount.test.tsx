import { describe, expect, it, spyOn } from 'bun:test'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom, wait } from '../../__tests__/dom'
import { Mount, MountMinimal } from '../index'

freshDom()

const shown = () => screen.queryByText('content') !== null

function transitioning(duration: string, delay = '', property = '') {
  const element = document.createElement('div')
  element.style.transitionDuration = duration
  element.style.transitionDelay = delay
  element.style.transitionProperty = property
  return { current: element }
}

function running(animation: object) {
  const ref = transitioning('0.02s')
  Object.defineProperty(ref.current, 'getAnimations', { value: () => [animation] })
  return ref
}

async function closedAfter(ref: React.RefObject<HTMLElement>, ms: number) {
  const { rerender } = render(
    <MountMinimal open ref={ref}>
      content
    </MountMinimal>,
  )
  rerender(
    <MountMinimal open={false} ref={ref}>
      content
    </MountMinimal>,
  )
  await wait(ms)
  return shown()
}

function Commits({ children, onCommit }: { children: React.ReactNode; onCommit: () => void }) {
  return (
    <React.Profiler id="commits" onRender={onCommit}>
      {children}
    </React.Profiler>
  )
}

describe('MountMinimal', () => {
  it('renders children when open=true', () => {
    const { container } = render(
      <MountMinimal open>
        <div data-testid="content">visible</div>
      </MountMinimal>,
    )
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
  })

  it('does not render children when open=false', () => {
    const { container } = render(
      <MountMinimal open={false}>
        <div data-testid="content">hidden</div>
      </MountMinimal>,
    )
    expect(container.querySelector('[data-testid="content"]')).toBeNull()
  })

  it('renders when forceMount=true and open=true', () => {
    const { container } = render(
      <MountMinimal forceMount open>
        <div data-testid="fm">force mounted</div>
      </MountMinimal>,
    )
    expect(container.querySelector('[data-testid="fm"]')).not.toBeNull()
  })

  it('renders while closed when forceMount=true', () => {
    const { container } = render(
      <MountMinimal forceMount open={false}>
        <div data-testid="fm">force mounted</div>
      </MountMinimal>,
    )
    expect(container.querySelector('[data-testid="fm"]')).not.toBeNull()
  })

  it('renders nothing when open is left out', () => {
    render(<MountMinimal>content</MountMinimal>)

    expect(shown()).toBe(false)
  })

  it('opens in one commit', () => {
    let commits = 0
    const onCommit = () => commits++
    const { rerender } = render(
      <Commits onCommit={onCommit}>
        <MountMinimal open={false}>content</MountMinimal>
      </Commits>,
    )
    commits = 0

    rerender(
      <Commits onCommit={onCommit}>
        <MountMinimal open>content</MountMinimal>
      </Commits>,
    )

    expect(commits).toBe(1)
  })
})

describe('Mount', () => {
  it('keeps its children for the exit animation, then drops them', async () => {
    const { rerender } = render(
      <Mount open animationDuration={20}>
        content
      </Mount>,
    )

    rerender(
      <Mount open={false} animationDuration={20}>
        content
      </Mount>,
    )
    expect(shown()).toBe(true)
    await wait(40)

    expect(shown()).toBe(false)
  })

  it('renders nothing while closed', () => {
    render(<Mount open={false}>content</Mount>)

    expect(shown()).toBe(false)
  })

  it('keeps its children 400ms after it closes by default', async () => {
    const { rerender } = render(<Mount open>content</Mount>)

    rerender(<Mount open={false}>content</Mount>)
    await wait(300)
    expect(shown()).toBe(true)
    await wait(150)

    expect(shown()).toBe(false)
  })

  it('sets no exit timer while it starts closed', () => {
    const timeout = spyOn(globalThis, 'setTimeout')
    try {
      render(
        <Mount open={false} animationDuration={12_345}>
          content
        </Mount>,
      )

      expect(timeout.mock.calls.filter(([, ms]) => ms === 12_345)).toEqual([])
    } finally {
      timeout.mockRestore()
    }
  })

  it('shows its children in the commit that opens it', () => {
    let commits = 0
    const onCommit = () => commits++
    const { rerender } = render(
      <Commits onCommit={onCommit}>
        <Mount open={false}>content</Mount>
      </Commits>,
    )
    commits = 0

    rerender(
      <Commits onCommit={onCommit}>
        <Mount open>content</Mount>
      </Commits>,
    )

    expect(commits).toBe(1)
    expect(shown()).toBe(true)
  })

  it('waits out the exit animation after opening from closed', () => {
    const { rerender } = render(
      <Mount open={false} animationDuration={20}>
        content
      </Mount>,
    )
    rerender(
      <Mount open animationDuration={20}>
        content
      </Mount>,
    )

    rerender(
      <Mount open={false} animationDuration={20}>
        content
      </Mount>,
    )

    expect(shown()).toBe(true)
  })

  it('drops the exit timer when it opens again during the exit animation', async () => {
    let commits = 0
    const at = (open: boolean) => (
      <Commits onCommit={() => commits++}>
        <Mount open={open} animationDuration={20}>
          content
        </Mount>
      </Commits>
    )
    const { rerender } = render(at(true))
    rerender(at(false))

    rerender(at(true))
    commits = 0
    await wait(40)

    expect(shown()).toBe(true)
    expect(commits).toBe(0)
  })

  it('stops the exit timer when it unmounts mid-animation', async () => {
    const { rerender, unmount } = render(
      <Mount open animationDuration={20}>
        content
      </Mount>,
    )
    rerender(
      <Mount open={false} animationDuration={20}>
        content
      </Mount>,
    )

    unmount()
    await wait(40)

    expect(shown()).toBe(false)
  })
})

describe('MountMinimal exit', () => {
  it('keeps its children through the exit transition, then drops them', async () => {
    const ref = transitioning('0.02s')
    const { rerender } = render(
      <MountMinimal open ref={ref}>
        content
      </MountMinimal>,
    )

    rerender(
      <MountMinimal open={false} ref={ref}>
        content
      </MountMinimal>,
    )
    await wait(5)
    expect(shown()).toBe(true)
    await wait(40)

    expect(shown()).toBe(false)
  })

  it('waits out the transition after opening from closed', async () => {
    const ref = transitioning('0.02s')
    const { rerender } = render(
      <MountMinimal open={false} ref={ref}>
        content
      </MountMinimal>,
    )
    rerender(
      <MountMinimal open ref={ref}>
        content
      </MountMinimal>,
    )

    rerender(
      <MountMinimal open={false} ref={ref}>
        content
      </MountMinimal>,
    )

    expect(shown()).toBe(true)
  })

  it('drops its children at once when given a callback ref, which it cannot read', () => {
    const ref = () => {}
    const { rerender } = render(
      <MountMinimal open ref={ref}>
        content
      </MountMinimal>,
    )

    rerender(
      <MountMinimal open={false} ref={ref}>
        content
      </MountMinimal>,
    )

    expect(shown()).toBe(false)
  })

  it('drops its children on the next tick when the element has no transition', async () => {
    const ref = transitioning('')
    const { rerender } = render(
      <MountMinimal open ref={ref}>
        content
      </MountMinimal>,
    )

    rerender(
      <MountMinimal open={false} ref={ref}>
        content
      </MountMinimal>,
    )
    await wait(5)

    expect(shown()).toBe(false)
  })

  it('drops its children at once when its transition never starts, as a height going to auto does', () => {
    const ref = transitioning('1s')
    Object.defineProperty(ref.current, 'getAnimations', { value: () => [] })
    const { rerender } = render(
      <MountMinimal open ref={ref}>
        content
      </MountMinimal>,
    )

    rerender(
      <MountMinimal open={false} ref={ref}>
        content
      </MountMinimal>,
    )

    expect(shown()).toBe(false)
  })

  it('waits out a transition the browser started', async () => {
    expect(await closedAfter(running({ transitionProperty: 'opacity' }), 5)).toBe(true)
  })

  it('waits for no animation other than a transition', async () => {
    expect(await closedAfter(running({}), 5)).toBe(false)
  })

  it('drops its children at once when it has no element to wait for', () => {
    const { rerender } = render(<MountMinimal open>content</MountMinimal>)

    rerender(<MountMinimal open={false}>content</MountMinimal>)

    expect(shown()).toBe(false)
  })

  it('drops its children at once when told not to wait', () => {
    const ref = transitioning('1s')
    const { rerender } = render(
      <MountMinimal open skipWaiting ref={ref}>
        content
      </MountMinimal>,
    )

    rerender(
      <MountMinimal open={false} skipWaiting ref={ref}>
        content
      </MountMinimal>,
    )

    expect(shown()).toBe(false)
  })

  it('drops the exit timer when it opens again during the exit transition', async () => {
    const ref = transitioning('0.02s')
    let commits = 0
    const at = (open: boolean) => (
      <Commits onCommit={() => commits++}>
        <MountMinimal open={open} ref={ref}>
          content
        </MountMinimal>
      </Commits>
    )
    const { rerender } = render(at(true))
    rerender(at(false))

    rerender(at(true))
    commits = 0
    await wait(40)

    expect(shown()).toBe(true)
    expect(commits).toBe(0)
  })

  it('reads no style while it starts closed', () => {
    const read = spyOn(globalThis, 'getComputedStyle')
    try {
      render(
        <MountMinimal open={false} ref={transitioning('1s')}>
          content
        </MountMinimal>,
      )

      expect(read).not.toHaveBeenCalled()
    } finally {
      read.mockRestore()
    }
  })

  it('renders nothing before the first open when renderOnce is set', () => {
    render(
      <MountMinimal open={false} renderOnce>
        content
      </MountMinimal>,
    )

    expect(shown()).toBe(false)
  })

  it('keeps its children after closing once renderOnce has shown them', async () => {
    const ref = transitioning('')
    const { rerender } = render(
      <MountMinimal open renderOnce ref={ref}>
        content
      </MountMinimal>,
    )

    rerender(
      <MountMinimal open={false} renderOnce ref={ref}>
        content
      </MountMinimal>,
    )
    await wait(5)

    expect(shown()).toBe(true)
  })

  it('stays mounted after closing once forceMount has mounted it', async () => {
    const ref = transitioning('')
    const { rerender } = render(
      <MountMinimal open forceMount ref={ref}>
        content
      </MountMinimal>,
    )

    rerender(
      <MountMinimal open={false} forceMount ref={ref}>
        content
      </MountMinimal>,
    )
    await wait(5)

    expect(shown()).toBe(true)
  })

  it('waits out the delay before the transition as well as the transition', async () => {
    const ref = transitioning('0.02s', '0.06s')

    expect(await closedAfter(ref, 40)).toBe(true)
    await wait(80)

    expect(shown()).toBe(false)
  })

  it('waits out the longest of several transitions', async () => {
    const ref = transitioning('0.01s, 0.06s', '', 'opacity, height')

    expect(await closedAfter(ref, 40)).toBe(true)
    await wait(60)

    expect(shown()).toBe(false)
  })

  it('pairs each delay with the transition it delays', async () => {
    const ref = transitioning('0.05s, 0.01s', '0s, 0.04s', 'opacity, height')

    expect(await closedAfter(ref, 75)).toBe(false)
  })

  it('repeats a shorter list of durations or delays across the transitions', async () => {
    const ref = transitioning('0.06s', '0s, 0.06s', 'opacity, height')

    expect(await closedAfter(ref, 90)).toBe(true)
    await wait(80)

    expect(shown()).toBe(false)
  })

  it('reads only as many durations as there are transitions', async () => {
    const ref = transitioning('0.01s, 1s', '', 'height')

    expect(await closedAfter(ref, 40)).toBe(false)
  })

  it('waits for nothing while no property transitions', async () => {
    const ref = transitioning('1s', '', 'none')

    expect(await closedAfter(ref, 5)).toBe(false)
  })

  it('counts a negative delay as time the transition has already run', async () => {
    const ref = transitioning('0.08s', '-0.06s')

    expect(await closedAfter(ref, 50)).toBe(false)
  })

  it('waits out the transition of the element its ref is attached to, as collapsible passes it', async () => {
    function Collapsing({ open }: { open: boolean }) {
      const ref = React.useRef<HTMLDivElement>(null)
      return (
        <div ref={ref} style={{ transitionDuration: '0.02s' }}>
          <MountMinimal open={open} ref={ref}>
            content
          </MountMinimal>
        </div>
      )
    }
    const { rerender } = render(<Collapsing open />)

    rerender(<Collapsing open={false} />)
    expect(shown()).toBe(true)
    await wait(40)

    expect(shown()).toBe(false)
  })
})
