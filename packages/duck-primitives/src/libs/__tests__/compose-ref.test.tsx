import { render } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { composeRefs, useComposedRefs } from '../compose-ref'

freshDom()

describe('composeRefs', () => {
  it('sets every ref and hands back nothing when no ref has a cleanup', () => {
    const objectRef = React.createRef<HTMLDivElement>()
    const callbackRef = vi.fn((_node: HTMLDivElement | null) => {})
    const node = document.createElement('div')

    expect(composeRefs(objectRef, callbackRef, undefined)(node)).toBeUndefined()
    expect(objectRef.current).toBe(node)
    expect(callbackRef.mock.calls).toEqual([[node]])
  })

  it('hands back one cleanup that runs the callback cleanup and nulls the other refs', () => {
    const cleanup = vi.fn(() => {})
    const objectRef = React.createRef<HTMLDivElement>()
    const callbackRef = vi.fn((_node: HTMLDivElement | null) => {})
    const node = document.createElement('div')

    const dispose = composeRefs<HTMLDivElement>(() => cleanup, objectRef, callbackRef)(node)
    dispose?.()

    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(objectRef.current).toBeNull()
    expect(callbackRef.mock.calls).toEqual([[node], [null]])
  })
})

describe('useComposedRefs', () => {
  function Box({ refs }: { refs: React.Ref<HTMLDivElement>[] }) {
    return <div ref={useComposedRefs(...refs)} />
  }

  it('runs a callback ref cleanup on unmount and nulls the object ref beside it', () => {
    const cleanup = vi.fn(() => {})
    const objectRef = React.createRef<HTMLDivElement>()
    const { unmount } = render(<Box refs={[() => cleanup, objectRef]} />)

    expect(objectRef.current).toBeInstanceOf(HTMLDivElement)

    unmount()

    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(objectRef.current).toBeNull()
  })

  it('keeps one callback while its refs stay the same, and hands the node to a ref that replaces one', () => {
    const callbacks = new Set<unknown>()
    function Recorder({ objectRef }: { objectRef: React.RefObject<HTMLDivElement | null> }) {
      const ref = useComposedRefs(objectRef)
      callbacks.add(ref)
      return <div ref={ref} />
    }
    const first = React.createRef<HTMLDivElement>()
    const second = React.createRef<HTMLDivElement>()
    const { rerender } = render(<Recorder objectRef={first} />)

    rerender(<Recorder objectRef={first} />)

    expect(callbacks.size).toBe(1)

    rerender(<Recorder objectRef={second} />)

    expect([callbacks.size, first.current, second.current]).toEqual([2, null, expect.any(HTMLDivElement)])
  })
})
