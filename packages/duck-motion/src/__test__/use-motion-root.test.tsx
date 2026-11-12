import { afterEach, describe, expect, mock, test } from 'bun:test'
import { act, cleanup, renderHook } from '@testing-library/react'
import { duckMotionDurationMs } from '../transitions/tweens'
import { useMotionRoot } from '../use-motion-root'

afterEach(cleanup)

const frame = () => act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

function setup() {
  const onOpenChange = mock()
  const hook = renderHook(() => useMotionRoot({ onOpenChange }))
  const change = (...steps: boolean[]) =>
    act(() => {
      for (const next of steps) hook.result.current.rootProps.onOpenChange(next)
    })
  return { change, isOpen: () => hook.result.current.contextValue.isOpen, onOpenChange }
}

describe('useMotionRoot', () => {
  test('a close in the frame an open from closed lands in goes through', () => {
    const { change, isOpen, onOpenChange } = setup()

    change(true, false)

    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
    expect(isOpen()).toBe(false)
  })

  test('an open while the exit plays swallows the one close the leaving content sends with it', async () => {
    const { change, isOpen, onOpenChange } = setup()

    change(true)
    await frame()
    change(false)
    change(true, false)

    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]])
    expect(isOpen()).toBe(true)

    await frame()
    change(false)

    expect(isOpen()).toBe(false)
  })

  test('an open once the exit has finished swallows nothing', async () => {
    const { change, isOpen, onOpenChange } = setup()

    change(true)
    await frame()
    change(false)
    await wait(duckMotionDurationMs.exit + 20)
    change(true, false)

    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]])
    expect(isOpen()).toBe(false)
  })
})
