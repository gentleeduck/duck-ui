import { act, renderHook } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

// ─── debounce (standalone) ──────────────────────────────────────────────────
import { debounce, useDebounce } from '../use-debounce'

describe('debounce', () => {
  test('calls callback after specified delay', async () => {
    const fn = vi.fn(() => {})
    const debounced = debounce(fn, 50)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('passes arguments to callback', async () => {
    const fn = vi.fn((_a: string, _b: number) => {})
    const debounced = debounce(fn, 30)

    debounced('hello', 42)
    await new Promise((r) => setTimeout(r, 60))
    expect(fn).toHaveBeenCalledWith('hello', 42)
  })

  test('resets timer on subsequent calls', async () => {
    const fn = vi.fn(() => {})
    const debounced = debounce(fn, 50)

    debounced()
    await new Promise((r) => setTimeout(r, 30))
    debounced() // reset
    await new Promise((r) => setTimeout(r, 30))
    expect(fn).not.toHaveBeenCalled()

    await new Promise((r) => setTimeout(r, 40))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('only invokes the last call when called multiple times rapidly', async () => {
    const fn = vi.fn((_v: string) => {})
    const debounced = debounce(fn, 50)

    debounced('a')
    debounced('b')
    debounced('c')

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })
})

// ─── useDebounce (real React hook) ──────────────────────────────────────────

describe('useDebounce', () => {
  test('returns a debounced function that fires after the delay', async () => {
    const fn = vi.fn(() => {})
    const { result } = renderHook(() => useDebounce(fn, 50))

    act(() => {
      result.current()
    })
    expect(fn).not.toHaveBeenCalled()

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('returned function identity is stable across renders', () => {
    const fn = vi.fn(() => {})
    const { result, rerender } = renderHook(({ delay }) => useDebounce(fn, delay), {
      initialProps: { delay: 50 },
    })

    const first = result.current
    rerender({ delay: 50 })
    rerender({ delay: 200 })
    expect(result.current).toBe(first)
  })

  test('always invokes the latest callback (no stale closure)', async () => {
    const a = vi.fn(() => {})
    const b = vi.fn(() => {})

    const { result, rerender } = renderHook(({ cb }) => useDebounce(cb, 30), {
      initialProps: { cb: a },
    })

    rerender({ cb: b })
    act(() => {
      result.current()
    })

    await new Promise((r) => setTimeout(r, 60))
    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalledTimes(1)
  })

  test('cancels pending invocation on unmount (no setState-after-unmount)', async () => {
    const fn = vi.fn(() => {})
    const { result, unmount } = renderHook(() => useDebounce(fn, 50))

    act(() => {
      result.current()
    })
    unmount()

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).not.toHaveBeenCalled()
  })

  test('rapid calls only fire once with the last argument', async () => {
    const fn = vi.fn((_v: string) => {})
    const { result } = renderHook(() => useDebounce(fn, 40))

    act(() => {
      result.current('a')
      result.current('b')
      result.current('c')
    })

    await new Promise((r) => setTimeout(r, 70))
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })

  test('works when delay is undefined', async () => {
    const fn = vi.fn(() => {})
    const { result } = renderHook(() => useDebounce(fn))

    act(() => {
      result.current()
    })
    await new Promise((r) => setTimeout(r, 20))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('accepts typed callbacks without casting', () => {
    // Compile-time check: typed callbacks must satisfy the generic constraint.
    const typed = (_s: string, _n: number): void => {}
    const { result } = renderHook(() => useDebounce(typed, 10))
    expect(typeof result.current).toBe('function')
  })
})

// ─── composeRefs / setRef ───────────────────────────────────────────────────
import { composeRefs } from '../use-composed-refs'

describe('composeRefs', () => {
  test('sets value on callback refs', () => {
    const values: unknown[] = []
    const ref1 = (v: unknown) => {
      values.push(v)
    }
    const ref2 = (v: unknown) => {
      values.push(v)
    }

    const composed = composeRefs(ref1 as any, ref2 as any)
    composed('node')

    expect(values).toEqual(['node', 'node'])
  })

  test('sets value on RefObject-like objects', () => {
    const ref1 = { current: null as unknown }
    const ref2 = { current: null as unknown }

    const composed = composeRefs(ref1 as any, ref2 as any)
    composed('element')

    expect(ref1.current).toBe('element')
    expect(ref2.current).toBe('element')
  })

  test('handles mix of callback refs and RefObjects', () => {
    let callbackValue: unknown = null
    const callbackRef = (v: unknown) => {
      callbackValue = v
    }
    const objRef = { current: null as unknown }

    const composed = composeRefs(callbackRef as any, objRef as any)
    composed('mixed')

    expect(callbackValue).toBe('mixed')
    expect(objRef.current).toBe('mixed')
  })

  test('ignores undefined refs', () => {
    const ref1 = { current: null as unknown }

    const composed = composeRefs(undefined, ref1 as any, undefined)
    composed('value')

    expect(ref1.current).toBe('value')
  })

  test('ignores null refs', () => {
    const ref1 = { current: null as unknown }

    const composed = composeRefs(null, ref1 as any)
    composed('value')

    expect(ref1.current).toBe('value')
  })

  test('does not write `.current` on non-object truthy values', () => {
    // Defensive: even if a caller passes a string (legacy ref form) the
    // runtime check should swallow it, not crash, and not write `.current`.
    const stringRef = 'legacy-ref' as unknown
    const objRef = { current: null as unknown }
    const composed = composeRefs(stringRef as any, objRef as any)
    expect(() => composed('node')).not.toThrow()
    expect(objRef.current).toBe('node')
  })
})

// ─── scheduleTransitionTimeout ──────────────────────────────────────────────
import { scheduleTransitionTimeout } from '../schedule-transition-timeout'

describe('scheduleTransitionTimeout', () => {
  test('calls callback after default timeout when element is null', async () => {
    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(null, fn)

    expect(fn).not.toHaveBeenCalled()
    await new Promise((r) => setTimeout(r, 350))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('calls callback after custom timeout when element is null', async () => {
    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(null, fn, 50)

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('returns a cleanup function that cancels the timeout', async () => {
    const fn = vi.fn(() => {})
    const cleanup = scheduleTransitionTimeout(null, fn, 50)

    cleanup()
    await new Promise((r) => setTimeout(r, 80))
    expect(fn).not.toHaveBeenCalled()
  })

  test('uses computed transition duration from element', async () => {
    const mockElement = {
      isConnected: true,
      style: { transitionDuration: '0.1s' },
    } as unknown as HTMLElement

    const originalGetComputedStyle = globalThis.getComputedStyle
    globalThis.getComputedStyle = (() => ({
      transitionDuration: '0.05s',
    })) as any

    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(mockElement, fn)

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).toHaveBeenCalledTimes(1)

    globalThis.getComputedStyle = originalGetComputedStyle
  })

  test('falls back to default timeout when transitionDuration is 0s', async () => {
    const mockElement = {
      isConnected: true,
      style: { transitionDuration: '0s' },
    } as unknown as HTMLElement

    const originalGetComputedStyle = globalThis.getComputedStyle
    globalThis.getComputedStyle = (() => ({
      transitionDuration: '0s',
    })) as any

    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(mockElement, fn, 50)

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).toHaveBeenCalledTimes(1)

    globalThis.getComputedStyle = originalGetComputedStyle
  })

  test('falls back to default timeout when element is not connected', async () => {
    const mockElement = {
      isConnected: false,
      style: { transitionDuration: '0.5s' },
    } as unknown as HTMLElement

    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(mockElement, fn, 50)

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

// ─── useStableId ────────────────────────────────────────────────────────────
import { useStableId } from '../use-stable-id'

describe('useStableId', () => {
  test('returns a non-empty string', () => {
    const { result } = renderHook(() => useStableId())
    expect(typeof result.current).toBe('string')
    expect(result.current.length).toBeGreaterThan(0)
  })

  test('default prefix is `id-`', () => {
    const { result } = renderHook(() => useStableId())
    expect(result.current.startsWith('id-')).toBe(true)
  })

  test('custom prefix is honoured', () => {
    const { result } = renderHook(() => useStableId('label'))
    expect(result.current.startsWith('label-')).toBe(true)
  })

  test('id is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useStableId('x'))
    const first = result.current
    rerender()
    rerender()
    expect(result.current).toBe(first)
  })

  test('two distinct hook instances produce distinct ids', () => {
    const { result: a } = renderHook(() => useStableId('shared'))
    const { result: b } = renderHook(() => useStableId('shared'))
    expect(a.current).not.toBe(b.current)
  })

  test('different prefixes never collide', () => {
    const { result: a } = renderHook(() => useStableId('alpha'))
    const { result: b } = renderHook(() => useStableId('beta'))
    expect(a.current).not.toBe(b.current)
  })
})

// ─── Edge Cases: debounce ───────────────────────────────────────────────────

describe('debounce (edge cases)', () => {
  test('calls immediately when delay is 0', async () => {
    const fn = vi.fn(() => {})
    const debounced = debounce(fn, 0)

    debounced()
    await new Promise((r) => setTimeout(r, 10))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('works when delay is undefined (uses default setTimeout behavior)', async () => {
    const fn = vi.fn(() => {})
    const debounced = debounce(fn)

    debounced()
    await new Promise((r) => setTimeout(r, 20))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('handles callback that takes no arguments', async () => {
    let called = false
    const fn = vi.fn(() => {
      called = true
    })
    const debounced = debounce(fn, 20)

    debounced()
    await new Promise((r) => setTimeout(r, 50))
    expect(called).toBe(true)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('multiple independent debounced functions do not interfere', async () => {
    const fn1 = vi.fn(() => {})
    const fn2 = vi.fn(() => {})
    const debounced1 = debounce(fn1, 30)
    const debounced2 = debounce(fn2, 30)

    debounced1()
    debounced2()

    await new Promise((r) => setTimeout(r, 60))
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  test('calling debounced function many times in a tight loop only fires once', async () => {
    const fn = vi.fn((_v: number) => {})
    const debounced = debounce(fn, 30)

    for (let i = 0; i < 100; i++) {
      debounced(i)
    }

    await new Promise((r) => setTimeout(r, 60))
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(99)
  })

  test('can be called again after the first debounce fires', async () => {
    const fn = vi.fn((_v: string) => {})
    const debounced = debounce(fn, 20)

    debounced('first')
    await new Promise((r) => setTimeout(r, 50))
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('first')

    debounced('second')
    await new Promise((r) => setTimeout(r, 50))
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('second')
  })
})

// ─── Edge Cases: composeRefs ────────────────────────────────────────────────

describe('composeRefs (edge cases)', () => {
  test('works with zero refs (empty arguments)', () => {
    const composed = composeRefs()
    expect(() => composed('node')).not.toThrow()
  })

  test('works when all refs are undefined', () => {
    const composed = composeRefs(undefined, undefined, undefined)
    expect(() => composed('node')).not.toThrow()
  })

  test('works when all refs are null', () => {
    const composed = composeRefs(null, null)
    expect(() => composed('node')).not.toThrow()
  })

  test('sets null value (simulating unmount/cleanup)', () => {
    const ref1 = { current: 'old-value' as unknown }
    const callbackValues: unknown[] = []
    const callbackRef = (v: unknown) => callbackValues.push(v)

    const composed = composeRefs(ref1 as any, callbackRef as any)
    composed(null)

    expect(ref1.current).toBe(null)
    expect(callbackValues).toEqual([null])
  })

  test('handles many refs at once', () => {
    const refs = Array.from({ length: 20 }, () => ({ current: null as unknown }))
    const composed = composeRefs(...(refs as any[]))
    composed('bulk-node')

    for (const ref of refs) {
      expect(ref.current).toBe('bulk-node')
    }
  })

  test('callback ref returning a cleanup function does not break compose', () => {
    const cleanupFn = vi.fn(() => {})
    const callbackRef = (_v: unknown) => cleanupFn
    const objRef = { current: null as unknown }

    const composed = composeRefs(callbackRef as any, objRef as any)
    expect(() => composed('node')).not.toThrow()
    expect(objRef.current).toBe('node')
  })

  test('sets the same node to all refs when called multiple times', () => {
    const ref1 = { current: null as unknown }
    const ref2 = { current: null as unknown }

    const composed = composeRefs(ref1 as any, ref2 as any)
    composed('first')
    expect(ref1.current).toBe('first')
    expect(ref2.current).toBe('first')

    composed('second')
    expect(ref1.current).toBe('second')
    expect(ref2.current).toBe('second')
  })
})

// ─── Edge Cases: scheduleTransitionTimeout ──────────────────────────────────

describe('scheduleTransitionTimeout (edge cases)', () => {
  test('multiple rapid calls each produce independent cleanups', async () => {
    const fn1 = vi.fn(() => {})
    const fn2 = vi.fn(() => {})
    const cleanup1 = scheduleTransitionTimeout(null, fn1, 30)
    const cleanup2 = scheduleTransitionTimeout(null, fn2, 30)

    cleanup1()

    await new Promise((r) => setTimeout(r, 60))
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalledTimes(1)
    // Cleanup the second one too so vitest does not see a leaked timer.
    cleanup2()
  })

  test('handles element with transitionDuration in ms format (parseFloat quirk)', async () => {
    const mockElement = {
      isConnected: true,
      style: { transitionDuration: '50ms' },
    } as unknown as HTMLElement

    const originalGetComputedStyle = globalThis.getComputedStyle
    globalThis.getComputedStyle = (() => ({
      transitionDuration: '50ms',
    })) as any

    const fn = vi.fn(() => {})
    const cleanup = scheduleTransitionTimeout(mockElement, fn)

    // parseFloat('50ms') = 50, then 50 * 1000 = 50000ms — known quirk.
    await new Promise((r) => setTimeout(r, 80))
    expect(fn).not.toHaveBeenCalled()

    cleanup()
    globalThis.getComputedStyle = originalGetComputedStyle
  })

  test('handles element with transitionDuration as empty string', async () => {
    const mockElement = {
      isConnected: true,
      style: { transitionDuration: '' },
    } as unknown as HTMLElement

    const originalGetComputedStyle = globalThis.getComputedStyle
    globalThis.getComputedStyle = (() => ({
      transitionDuration: '',
    })) as any

    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(mockElement, fn, 30)

    await new Promise((r) => setTimeout(r, 60))
    expect(fn).toHaveBeenCalledTimes(1)

    globalThis.getComputedStyle = originalGetComputedStyle
  })

  test('handles element where transitionDuration parses to NaN', async () => {
    const mockElement = {
      isConnected: true,
      style: { transitionDuration: 'invalid' },
    } as unknown as HTMLElement

    const originalGetComputedStyle = globalThis.getComputedStyle
    globalThis.getComputedStyle = (() => ({
      transitionDuration: 'invalid',
    })) as any

    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(mockElement, fn, 30)

    await new Promise((r) => setTimeout(r, 60))
    expect(fn).toHaveBeenCalledTimes(1)

    globalThis.getComputedStyle = originalGetComputedStyle
  })

  test('cleanup called multiple times does not throw', async () => {
    const fn = vi.fn(() => {})
    const cleanup = scheduleTransitionTimeout(null, fn, 30)

    cleanup()
    expect(() => cleanup()).not.toThrow()

    await new Promise((r) => setTimeout(r, 60))
    expect(fn).not.toHaveBeenCalled()
  })

  test('callback is only invoked once per call (not duplicated)', async () => {
    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(null, fn, 20)

    await new Promise((r) => setTimeout(r, 80))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('handles very small computed transition duration', async () => {
    const mockElement = {
      isConnected: true,
      style: { transitionDuration: '0.001s' },
    } as unknown as HTMLElement

    const originalGetComputedStyle = globalThis.getComputedStyle
    globalThis.getComputedStyle = (() => ({
      transitionDuration: '0.001s',
    })) as any

    const fn = vi.fn(() => {})
    scheduleTransitionTimeout(mockElement, fn)

    await new Promise((r) => setTimeout(r, 30))
    expect(fn).toHaveBeenCalledTimes(1)

    globalThis.getComputedStyle = originalGetComputedStyle
  })
})

// ─── useCopyToClipboard ────────────────────────────────────────────────────

describe('useCopyToClipboard', () => {
  test('hook is exported as a function', async () => {
    const mod = await import('../use-copy-to-clipboard')
    expect(typeof mod.useCopyToClipboard).toBe('function')
  })

  test('returns { copyToClipboard, isCopied } shape', async () => {
    const { useCopyToClipboard } = await import('../use-copy-to-clipboard')
    const { result } = renderHook(() => useCopyToClipboard())
    expect(typeof result.current.copyToClipboard).toBe('function')
    expect(typeof result.current.isCopied).toBe('boolean')
  })

  test('writes to clipboard and flips isCopied', async () => {
    const writtenValues: string[] = []
    const originalClipboard = navigator.clipboard

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: (text: string) => {
          writtenValues.push(text)
          return Promise.resolve()
        },
      },
      writable: true,
      configurable: true,
    })

    const { useCopyToClipboard } = await import('../use-copy-to-clipboard')
    const { result } = renderHook(() => useCopyToClipboard({ timeout: 50 }))

    await act(async () => {
      result.current.copyToClipboard('hello clipboard')
      // Let the promise microtask resolve.
      await Promise.resolve()
    })

    expect(writtenValues).toEqual(['hello clipboard'])
    expect(result.current.isCopied).toBe(true)

    // Wait for the auto-reset timeout.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 80))
    })
    expect(result.current.isCopied).toBe(false)

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  test('does not throw when navigator.clipboard is undefined', async () => {
    const originalClipboard = navigator.clipboard

    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const { useCopyToClipboard } = await import('../use-copy-to-clipboard')
    const { result } = renderHook(() => useCopyToClipboard())

    expect(() => result.current.copyToClipboard('x')).not.toThrow()
    expect(result.current.isCopied).toBe(false)

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  test('does not copy empty string', async () => {
    const writtenValues: string[] = []
    const originalClipboard = navigator.clipboard

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: (text: string) => {
          writtenValues.push(text)
          return Promise.resolve()
        },
      },
      writable: true,
      configurable: true,
    })

    const { useCopyToClipboard } = await import('../use-copy-to-clipboard')
    const { result } = renderHook(() => useCopyToClipboard())

    act(() => {
      result.current.copyToClipboard('')
    })
    expect(writtenValues).toEqual([])

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  test('onCopy callback fires after a successful copy', async () => {
    const onCopy = vi.fn(() => {})
    const originalClipboard = navigator.clipboard

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: (_text: string) => Promise.resolve(),
      },
      writable: true,
      configurable: true,
    })

    const { useCopyToClipboard } = await import('../use-copy-to-clipboard')
    const { result } = renderHook(() => useCopyToClipboard({ onCopy }))

    await act(async () => {
      result.current.copyToClipboard('test')
      await Promise.resolve()
    })

    expect(onCopy).toHaveBeenCalledTimes(1)

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  test('cancels reset timer on unmount (no setState-after-unmount)', async () => {
    const originalClipboard = navigator.clipboard

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: (_text: string) => Promise.resolve(),
      },
      writable: true,
      configurable: true,
    })

    const { useCopyToClipboard } = await import('../use-copy-to-clipboard')
    const { result, unmount } = renderHook(() => useCopyToClipboard({ timeout: 50 }))

    await act(async () => {
      result.current.copyToClipboard('hello')
      await Promise.resolve()
    })
    expect(result.current.isCopied).toBe(true)

    // Spy on console.error to surface any React "setState on unmounted" warnings.
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {})
    unmount()

    await new Promise((r) => setTimeout(r, 100))

    // No React update-after-unmount warnings should have been emitted.
    const warned = consoleErr.mock.calls.some((args) =>
      args.some(
        (a) => typeof a === 'string' && (a.includes("Can't perform a React state update") || a.includes('unmounted')),
      ),
    )
    expect(warned).toBe(false)
    consoleErr.mockRestore()

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  test('rapid double-copy clears the previous reset timer', async () => {
    const originalClipboard = navigator.clipboard

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: (_text: string) => Promise.resolve(),
      },
      writable: true,
      configurable: true,
    })

    const { useCopyToClipboard } = await import('../use-copy-to-clipboard')
    const { result } = renderHook(() => useCopyToClipboard({ timeout: 60 }))

    // First copy schedules a reset for ~60ms.
    await act(async () => {
      result.current.copyToClipboard('first')
      await Promise.resolve()
    })
    expect(result.current.isCopied).toBe(true)

    // Wait part of the timeout, then trigger another copy — the prior reset
    // timer should be cleared so isCopied stays true for a full fresh window.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40))
    })
    await act(async () => {
      result.current.copyToClipboard('second')
      await Promise.resolve()
    })
    expect(result.current.isCopied).toBe(true)

    // After the original reset window (which would have fired by now) it should
    // still be true because the timer was reset on the second copy.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40))
    })
    expect(result.current.isCopied).toBe(true)

    // After the full new window has elapsed, it should flip back to false.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(result.current.isCopied).toBe(false)

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  test('onError callback fires when writeText rejects', async () => {
    const onError = vi.fn((_err: unknown) => {})
    const originalClipboard = navigator.clipboard
    const rejection = new Error('permission denied')

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: (_text: string) => Promise.reject(rejection),
      },
      writable: true,
      configurable: true,
    })

    const { useCopyToClipboard } = await import('../use-copy-to-clipboard')
    const { result } = renderHook(() => useCopyToClipboard({ onError }))

    await act(async () => {
      result.current.copyToClipboard('boom')
      // Let the promise rejection settle.
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(onError).toHaveBeenCalledWith(rejection)
    expect(result.current.isCopied).toBe(false)

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })
})

// ─── useIsMobile / useMediaQuery ───────────────────────────────────────────

describe('useMediaQuery + useIsMobile', () => {
  function installMatchMedia(matches: boolean) {
    const listeners: Array<(e: MediaQueryListEvent) => void> = []
    const mql = {
      matches,
      addEventListener: (_type: string, fn: (e: MediaQueryListEvent) => void) => {
        listeners.push(fn)
      },
      removeEventListener: (_type: string, fn: (e: MediaQueryListEvent) => void) => {
        const i = listeners.indexOf(fn)
        if (i !== -1) listeners.splice(i, 1)
      },
    }
    const original = globalThis.matchMedia
    globalThis.matchMedia = ((_q: string) => mql) as any
    return {
      restore: () => {
        globalThis.matchMedia = original
      },
      fire: (next: boolean) => {
        mql.matches = next
        for (const l of listeners) l({ matches: next } as MediaQueryListEvent)
      },
    }
  }

  test('useMediaQuery returns current match state on mount', async () => {
    const harness = installMatchMedia(true)
    const { useMediaQuery } = await import('../use-media-query')

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(true)

    harness.restore()
  })

  test('useMediaQuery updates when matchMedia fires a change event', async () => {
    const harness = installMatchMedia(false)
    const { useMediaQuery } = await import('../use-media-query')

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(false)

    await act(async () => {
      harness.fire(true)
    })
    expect(result.current).toBe(true)

    harness.restore()
  })

  test('useIsMobile delegates to useMediaQuery', async () => {
    const harness = installMatchMedia(true)
    const { useIsMobile } = await import('../use-is-mobile')

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    harness.restore()
  })

  test('useMediaQuery initial state reflects the actual match (lazy init, no flash)', async () => {
    // Install matchMedia with `matches: true` BEFORE the hook mounts. The lazy
    // initializer must read this value on the very first render, not flip to
    // it in an effect.
    const harness = installMatchMedia(true)
    const { useMediaQuery } = await import('../use-media-query')

    const seen: boolean[] = []
    renderHook(() => {
      const v = useMediaQuery('(min-width: 1024px)')
      seen.push(v)
      return v
    })

    // The first observed render must already be true — no `false → true` flash.
    expect(seen[0]).toBe(true)

    harness.restore()
  })

  test('useMediaQuery answers false where there is no matchMedia, as in a test DOM', async () => {
    const original = globalThis.matchMedia
    Reflect.deleteProperty(globalThis, 'matchMedia')
    const { useMediaQuery } = await import('../use-media-query')

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))

    expect(result.current).toBe(false)
    globalThis.matchMedia = original
  })
})

// ─── useOnOpenChange ───────────────────────────────────────────────────────

describe('useOnOpenChange', () => {
  test('hook is exported as a function', async () => {
    const mod = await import('../use-on-open-change')
    expect(typeof mod.useOnOpenChange).toBe('function')
  })

  test('return shape is { onOpenChange, open, ref }', async () => {
    const { useOnOpenChange } = await import('../use-on-open-change')
    const ref = { current: null as HTMLElement | null }
    const { result } = renderHook(() => useOnOpenChange(ref))

    expect(typeof result.current.onOpenChange).toBe('function')
    expect(typeof result.current.open).toBe('boolean')
    expect(result.current.ref).toBe(ref)
  })

  test('controlled openProp drives state', async () => {
    const { useOnOpenChange } = await import('../use-on-open-change')
    const el = document.createElement('div')
    document.body.appendChild(el)
    const ref = { current: el as HTMLElement | null }

    const { result, rerender } = renderHook(({ open }) => useOnOpenChange(ref, open), {
      initialProps: { open: false },
    })
    expect(result.current.open).toBe(false)

    rerender({ open: true })
    // Adding the scroll-lock class is synchronous; the setOpen state update is
    // gated behind OPEN_DELAY_MS (100), so wait a bit longer.
    expect(document.body.classList.contains('scroll-locked')).toBe(true)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 200))
    })
    expect(result.current.open).toBe(true)

    document.body.removeChild(el)
    document.body.classList.remove('scroll-locked')
  })

  test('handleOpenChange is a no-op when ref.current is null', async () => {
    const { useOnOpenChange } = await import('../use-on-open-change')
    const onOpenChange = vi.fn(() => {})
    const ref = { current: null as HTMLElement | null }
    const { result } = renderHook(() => useOnOpenChange(ref, undefined, onOpenChange))

    act(() => {
      result.current.onOpenChange(true)
    })
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('controlled openProp effect skips re-toggling when value did not change', async () => {
    const { useOnOpenChange } = await import('../use-on-open-change')
    const onOpenChange = vi.fn(() => {})
    const el = document.createElement('div')
    document.body.appendChild(el)
    const ref = { current: el as HTMLElement | null }

    const { rerender } = renderHook(({ open }) => useOnOpenChange(ref, open, onOpenChange), {
      initialProps: { open: true },
    })

    // Wait past OPEN_DELAY_MS so the initial open settles and fires once.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200))
    })
    const initialCalls = onOpenChange.mock.calls.length
    expect(initialCalls).toBeGreaterThanOrEqual(1)

    // Rerender with the same value — controlled-prop effect should NOT
    // re-invoke handleOpenChange.
    rerender({ open: true })
    rerender({ open: true })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 200))
    })
    expect(onOpenChange.mock.calls.length).toBe(initialCalls)

    document.body.removeChild(el)
    document.body.classList.remove('scroll-locked')
  })

  test('cancels the pending open delay on unmount', async () => {
    const { useOnOpenChange } = await import('../use-on-open-change')
    const onOpenChange = vi.fn(() => {})
    const el = document.createElement('div')
    document.body.appendChild(el)
    const ref = { current: el as HTMLElement | null }

    const { result, unmount } = renderHook(() => useOnOpenChange(ref, undefined, onOpenChange))

    act(() => {
      result.current.onOpenChange(true)
    })
    unmount()

    await new Promise((r) => setTimeout(r, 150))
    expect(onOpenChange).not.toHaveBeenCalled()

    document.body.removeChild(el)
  })
})
