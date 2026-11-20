import { renderHook } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { motionTransition, useDuckReducedMotion } from '../react'

describe('motionTransition', () => {
  test('returns { duration: 0 } when reduced is true', () => {
    const result = motionTransition(true, { duration: 300, easing: 'ease-in' })
    expect(result).toEqual({ duration: 0 })
  })

  test('returns normal config when reduced is false', () => {
    const normal = { duration: 300, easing: 'ease-in' }
    const result = motionTransition(false, normal)
    expect(result).toBe(normal)
  })

  test('reduced result does not contain the normal properties', () => {
    const result = motionTransition(true, { duration: 200, fill: 'forwards' } as Record<string, unknown>)
    expect(result).not.toHaveProperty('fill')
    expect(result).toEqual({ duration: 0 })
  })

  test('returns exact same object reference when not reduced', () => {
    const normal = { duration: 500 }
    expect(motionTransition(false, normal)).toBe(normal)
  })

  test('reduced result always has duration: 0 regardless of input duration', () => {
    const result1 = motionTransition(true, { duration: 1000 })
    const result2 = motionTransition(true, { duration: 0 })
    expect(result1).toEqual({ duration: 0 })
    expect(result2).toEqual({ duration: 0 })
  })

  test('reduced result has exactly one key', () => {
    const result = motionTransition(true, { duration: 300, easing: 'ease', fill: 'both' } as Record<string, unknown>)
    expect(Object.keys(result)).toEqual(['duration'])
  })

  test('works with an empty normal config', () => {
    const normal = {} as Record<string, unknown>
    const result = motionTransition(false, normal)
    expect(result).toBe(normal)
  })

  test('reduced path ignores all custom properties in normal', () => {
    const normal = { duration: 400, delay: 100, iterations: 3 } as Record<string, unknown>
    const result = motionTransition(true, normal)
    expect(result).not.toHaveProperty('delay')
    expect(result).not.toHaveProperty('iterations')
    expect(result).toEqual({ duration: 0 })
  })
})

describe('useDuckReducedMotion', () => {
  test('returns a boolean', () => {
    const { result } = renderHook(() => useDuckReducedMotion())
    expect(typeof result.current).toBe('boolean')
  })

  test('returns false in jsdom test environment (no matchMedia)', () => {
    const { result } = renderHook(() => useDuckReducedMotion())
    expect(result.current).toBe(false)
  })

  test('is stable across re-renders when matchMedia state is unchanged', () => {
    const { result, rerender } = renderHook(() => useDuckReducedMotion())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
