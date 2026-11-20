import { describe, expect, test } from 'vitest'
import type { IDuckMotion } from '../presets/types'
import {
  duckMotionCssVar,
  duckMotionDuration,
  duckMotionDurationMs,
  duckMotionEasing,
  duckMotionEasingCss,
} from '../transitions/tweens'

describe('duckMotionEasing', () => {
  test('standard is a 4-element array [0.4, 0, 0.2, 1]', () => {
    expect(duckMotionEasing.standard).toHaveLength(4)
    expect(duckMotionEasing.standard).toEqual([0.4, 0, 0.2, 1])
  })

  test('exit is a 4-element array [0.4, 0, 1, 1]', () => {
    expect(duckMotionEasing.exit).toEqual([0.4, 0, 1, 1])
  })

  test('expo is [0.16, 1, 0.3, 1]', () => {
    expect(duckMotionEasing.expo).toEqual([0.16, 1, 0.3, 1])
  })

  test('easeOut is [0, 0, 0.2, 1]', () => {
    expect(duckMotionEasing.easeOut).toEqual([0, 0, 0.2, 1])
  })

  test('spring is a 4-element array with overshoot y-values', () => {
    expect(duckMotionEasing.spring).toHaveLength(4)
    const y2 = duckMotionEasing.spring[3]
    expect(y2).toBeGreaterThan(1)
  })
})

describe('duckMotionEasingCss', () => {
  test('standard is cubic-bezier string', () => {
    expect(duckMotionEasingCss.standard).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
  })

  test('spring is cubic-bezier string with overshoot', () => {
    expect(duckMotionEasingCss.spring).toBe('cubic-bezier(1, 0.23995, 0, 1.65)')
  })

  test('exit, expo, easeOut are cubic-bezier strings', () => {
    expect(duckMotionEasingCss.exit).toBe('cubic-bezier(0.4, 0, 1, 1)')
    expect(duckMotionEasingCss.expo).toBe('cubic-bezier(0.16, 1, 0.3, 1)')
    expect(duckMotionEasingCss.easeOut).toBe('cubic-bezier(0, 0, 0.2, 1)')
  })
})

describe('duckMotionDurationMs (ms source of truth)', () => {
  test('all values are non-negative integers', () => {
    for (const [, value] of Object.entries(duckMotionDurationMs)) {
      expect(typeof value).toBe('number')
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
    }
  })

  test('instant is 0', () => expect(duckMotionDurationMs.instant).toBe(0))
  test('fast is 150', () => expect(duckMotionDurationMs.fast).toBe(150))
  test('normal is 200', () => expect(duckMotionDurationMs.normal).toBe(200))
  test('exit is 180', () => expect(duckMotionDurationMs.exit).toBe(180))
  test('slow is 300', () => expect(duckMotionDurationMs.slow).toBe(300))

  test('durations are ordered: instant < fast < exit < normal < slow', () => {
    expect(duckMotionDurationMs.instant).toBeLessThan(duckMotionDurationMs.fast)
    expect(duckMotionDurationMs.fast).toBeLessThan(duckMotionDurationMs.exit)
    expect(duckMotionDurationMs.exit).toBeLessThan(duckMotionDurationMs.normal)
    expect(duckMotionDurationMs.normal).toBeLessThan(duckMotionDurationMs.slow)
  })
})

describe('duckMotionDuration (seconds, derived)', () => {
  test('derives from duckMotionDurationMs (ms / 1000)', () => {
    expect(duckMotionDuration.fast).toBe(duckMotionDurationMs.fast / 1000)
    expect(duckMotionDuration.normal).toBe(duckMotionDurationMs.normal / 1000)
    expect(duckMotionDuration.slow).toBe(duckMotionDurationMs.slow / 1000)
    expect(duckMotionDuration.instant).toBe(0)
  })

  test('values approximate seconds', () => {
    expect(duckMotionDuration.fast).toBeCloseTo(0.15)
    expect(duckMotionDuration.normal).toBeCloseTo(0.2)
    expect(duckMotionDuration.slow).toBeCloseTo(0.3)
  })
})

describe('duckMotionCssVar', () => {
  test('duration uses a CSS var() with fallback', () => {
    expect(duckMotionCssVar.duration).toMatch(/^var\(--[\w-]+,\s*.+\)$/)
  })

  test('easing uses a CSS var() with fallback', () => {
    expect(duckMotionCssVar.easing).toMatch(/^var\(--[\w-]+,\s*.+\)$/)
  })

  test('duration is exactly var(--gentleduck-motion-dur, 150ms)', () => {
    expect(duckMotionCssVar.duration).toBe('var(--gentleduck-motion-dur, 150ms)')
  })

  test('easing is var(--gentleduck-motion-ease, cubic-bezier(0.4, 0, 0.2, 1))', () => {
    expect(duckMotionCssVar.easing).toBe('var(--gentleduck-motion-ease, cubic-bezier(0.4, 0, 0.2, 1))')
  })

  test('duration fallback derives from duckMotionDurationMs.fast', () => {
    const fallback = duckMotionCssVar.duration.match(/,\s*(\d+)ms\)$/)?.[1]
    expect(Number(fallback)).toBe(duckMotionDurationMs.fast)
  })

  test('easing fallback matches duckMotionEasingCss.standard', () => {
    const fallback = duckMotionCssVar.easing.match(/,\s*(.+)\)$/)?.[1]
    expect(fallback).toBe(duckMotionEasingCss.standard)
  })
})

describe('IDuckMotion namespace', () => {
  test('exists as a type namespace export (compile-time check)', () => {
    type _check = IDuckMotion.IPreset
    expect(true).toBe(true)
  })
})
