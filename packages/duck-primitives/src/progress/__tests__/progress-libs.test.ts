import { describe, expect, test } from 'bun:test'
import {
  DEFAULT_MAX,
  defaultGetValueLabel,
  getInvalidMaxError,
  getInvalidValueError,
  getProgressState,
  isNumber,
  isValidMaxNumber,
  isValidValueNumber,
} from '../progress.libs'

describe('progress.libs', () => {
  test('DEFAULT_MAX is 100', () => {
    expect(DEFAULT_MAX).toBe(100)
  })

  // --- isNumber ---
  describe('isNumber', () => {
    test('returns true for numbers', () => {
      expect(isNumber(0)).toBe(true)
      expect(isNumber(1)).toBe(true)
      expect(isNumber(-5)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
    })

    test('returns false for non-numbers', () => {
      expect(isNumber('5')).toBe(false)
      expect(isNumber(null)).toBe(false)
      expect(isNumber(undefined)).toBe(false)
      expect(isNumber(true)).toBe(false)
    })
  })

  // --- isValidMaxNumber ---
  describe('isValidMaxNumber', () => {
    test('accepts positive numbers', () => {
      expect(isValidMaxNumber(1)).toBe(true)
      expect(isValidMaxNumber(100)).toBe(true)
      expect(isValidMaxNumber(0.5)).toBe(true)
    })

    test('rejects zero', () => {
      expect(isValidMaxNumber(0)).toBe(false)
    })

    test('rejects negative', () => {
      expect(isValidMaxNumber(-1)).toBe(false)
    })

    test('rejects NaN', () => {
      expect(isValidMaxNumber(Number.NaN)).toBe(false)
    })

    test('rejects non-numbers', () => {
      expect(isValidMaxNumber('100')).toBe(false)
      expect(isValidMaxNumber(null)).toBe(false)
    })
  })

  // --- isValidValueNumber ---
  describe('isValidValueNumber', () => {
    test('accepts values between 0 and max', () => {
      expect(isValidValueNumber(0, 100)).toBe(true)
      expect(isValidValueNumber(50, 100)).toBe(true)
      expect(isValidValueNumber(100, 100)).toBe(true)
    })

    test('rejects negative values', () => {
      expect(isValidValueNumber(-1, 100)).toBe(false)
    })

    test('rejects values above max', () => {
      expect(isValidValueNumber(101, 100)).toBe(false)
    })

    test('rejects NaN', () => {
      expect(isValidValueNumber(Number.NaN, 100)).toBe(false)
    })

    test('rejects non-numbers', () => {
      expect(isValidValueNumber('50', 100)).toBe(false)
    })
  })

  // --- getProgressState ---
  describe('getProgressState', () => {
    test('returns indeterminate for null', () => {
      expect(getProgressState(null, 100)).toBe('indeterminate')
    })

    test('returns indeterminate for undefined', () => {
      expect(getProgressState(undefined, 100)).toBe('indeterminate')
    })

    test('returns complete when value equals max', () => {
      expect(getProgressState(100, 100)).toBe('complete')
      expect(getProgressState(10, 10)).toBe('complete')
    })

    test('returns loading when value is less than max', () => {
      expect(getProgressState(50, 100)).toBe('loading')
      expect(getProgressState(0, 100)).toBe('loading')
      expect(getProgressState(99, 100)).toBe('loading')
    })
  })

  // --- defaultGetValueLabel ---
  describe('defaultGetValueLabel', () => {
    test('returns percentage string', () => {
      expect(defaultGetValueLabel(50, 100)).toBe('50%')
      expect(defaultGetValueLabel(75, 100)).toBe('75%')
      expect(defaultGetValueLabel(0, 100)).toBe('0%')
      expect(defaultGetValueLabel(100, 100)).toBe('100%')
    })

    test('rounds to nearest integer', () => {
      expect(defaultGetValueLabel(1, 3)).toBe('33%')
      expect(defaultGetValueLabel(2, 3)).toBe('67%')
    })

    test('works with custom max', () => {
      expect(defaultGetValueLabel(5, 10)).toBe('50%')
      expect(defaultGetValueLabel(3, 4)).toBe('75%')
    })
  })

  // --- error messages ---
  describe('error messages', () => {
    test('getInvalidMaxError includes prop value and component name', () => {
      const msg = getInvalidMaxError('-5', 'MyProgress')
      expect(msg).toContain('-5')
      expect(msg).toContain('MyProgress')
      expect(msg).toContain(String(DEFAULT_MAX))
    })

    test('getInvalidValueError includes prop value and component name', () => {
      const msg = getInvalidValueError('999', 'MyProgress')
      expect(msg).toContain('999')
      expect(msg).toContain('MyProgress')
    })
  })
})
