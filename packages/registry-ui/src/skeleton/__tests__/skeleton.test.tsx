import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, render } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import { MotionSkeleton } from '../motion-skeleton'
import { Skeleton } from '../skeleton'

afterEach(cleanup)

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

function skeletons() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-slot="skeleton"]'))
}

describe('registry-ui Skeleton', () => {
  test('is a pulsing block screen readers skip, which stops pulsing under reduced motion', () => {
    render(<Skeleton />)
    const [block] = skeletons()

    expect(block?.tagName).toBe('DIV')
    expect(block?.getAttribute('aria-hidden')).toBe('true')
    expect(block?.className).toBe('animate-pulse rounded-md bg-muted motion-reduce:animate-none')
  })

  test('the class shapes it, and the rest of the props and the ref reach the div', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Skeleton className="size-12 rounded-full" id="avatar" ref={ref} style={{ width: 40 }} />)
    const [block] = skeletons()

    expect(ref.current).toBe(block ?? null)
    expect(block?.id).toBe('avatar')
    expect(block?.style.width).toBe('40px')
    expect(block?.classList.contains('rounded-full')).toBe(true)
    expect(block?.classList.contains('rounded-md')).toBe(false)
  })

  test('the slot stays its own, whatever the props say', () => {
    render(<Skeleton {...{ 'data-slot': 'avatar' }} />)

    expect(skeletons()).toHaveLength(1)
  })

  test('takes its direction from the provider, and an explicit dir wins', () => {
    render(
      <DirectionProvider dir="rtl">
        <Skeleton />
        <Skeleton dir="ltr" />
      </DirectionProvider>,
    )

    expect(skeletons().map((block) => block.dir)).toEqual(['rtl', 'ltr'])
  })
})

describe('registry-ui MotionSkeleton', () => {
  test('wraps a skeleton in an inline-flex wrapper, takes the ref, and keeps index off the DOM', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<MotionSkeleton className="h-4 w-24" index={3} ref={ref} />)
    const [block] = skeletons()

    expect(ref.current).toBe(block ?? null)
    expect(block?.classList.contains('w-24')).toBe(true)
    expect(block?.hasAttribute('index')).toBe(false)
    expect(block?.parentElement?.className).toBe('inline-flex')
  })

  test('each step of index holds the whole entrance back by 50ms, scale included', async () => {
    render(
      <>
        <MotionSkeleton />
        <MotionSkeleton index={20} />
      </>,
    )
    const wrappers = () => skeletons().map((block) => block.parentElement?.style)
    for (let step = 0; step < 4; step++) await wait(100)
    const [first, last] = wrappers()

    expect(Number(first?.opacity)).toBeGreaterThan(0)
    expect(first?.transform).not.toBe('scale(0.95)')
    expect(Number(last?.opacity)).toBe(0)
    expect(last?.transform).toBe('scale(0.95)')

    for (let step = 0; step < 18; step++) await wait(100)

    expect(Number(wrappers()[1]?.opacity)).toBe(1)
    expect(wrappers()[1]?.transform).toBe('none')
  })
})
