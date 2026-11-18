import { describe, expect, test } from 'bun:test'
import {
  convertValueToPercentage,
  getClosestValueIndex,
  getDecimalCount,
  getLabel,
  getNextSortedValues,
  hasMinStepsBetweenValues,
  linearScale,
  roundValue,
} from '../slider.libs'

describe('slider.libs', () => {
  // --- getNextSortedValues ---
  describe('getNextSortedValues', () => {
    test('inserts value at index and sorts', () => {
      expect(getNextSortedValues([10, 50, 90], 30, 1)).toEqual([10, 30, 90])
    })

    test('handles single value', () => {
      expect(getNextSortedValues([50], 75, 0)).toEqual([75])
    })

    test('sorts after insertion', () => {
      expect(getNextSortedValues([20, 80], 10, 1)).toEqual([10, 20])
    })

    test('handles empty with default', () => {
      expect(getNextSortedValues(undefined, 50, 0)).toEqual([50])
    })
  })

  // --- convertValueToPercentage ---
  describe('convertValueToPercentage', () => {
    test('converts to percentage', () => {
      expect(convertValueToPercentage(50, 0, 100)).toBe(50)
      expect(convertValueToPercentage(0, 0, 100)).toBe(0)
      expect(convertValueToPercentage(100, 0, 100)).toBe(100)
    })

    test('works with custom range', () => {
      expect(convertValueToPercentage(15, 10, 20)).toBe(50)
      expect(convertValueToPercentage(10, 10, 20)).toBe(0)
      expect(convertValueToPercentage(20, 10, 20)).toBe(100)
    })

    test('clamps to 0-100', () => {
      expect(convertValueToPercentage(-10, 0, 100)).toBe(0)
      expect(convertValueToPercentage(200, 0, 100)).toBe(100)
    })
  })

  // --- getLabel ---
  describe('getLabel', () => {
    test('single value returns undefined', () => {
      expect(getLabel(0, 1)).toBeUndefined()
    })

    test('two values return Minimum/Maximum', () => {
      expect(getLabel(0, 2)).toBe('Minimum')
      expect(getLabel(1, 2)).toBe('Maximum')
    })

    test('three+ values return numbered label', () => {
      expect(getLabel(0, 3)).toBe('Value 1 of 3')
      expect(getLabel(1, 3)).toBe('Value 2 of 3')
      expect(getLabel(2, 3)).toBe('Value 3 of 3')
    })
  })

  // --- getClosestValueIndex ---
  describe('getClosestValueIndex', () => {
    test('single value returns 0', () => {
      expect(getClosestValueIndex([50], 75)).toBe(0)
    })

    test('returns closest index', () => {
      expect(getClosestValueIndex([20, 80], 30)).toBe(0)
      expect(getClosestValueIndex([20, 80], 70)).toBe(1)
    })

    test('returns first when equidistant', () => {
      expect(getClosestValueIndex([20, 80], 50)).toBe(0)
    })
  })

  // --- hasMinStepsBetweenValues ---
  describe('hasMinStepsBetweenValues', () => {
    test('returns true when steps meet minimum', () => {
      expect(hasMinStepsBetweenValues([10, 30, 60], 10)).toBe(true)
    })

    test('returns false when steps are too close', () => {
      expect(hasMinStepsBetweenValues([10, 15, 60], 10)).toBe(false)
    })

    test('returns true when minSteps is 0', () => {
      expect(hasMinStepsBetweenValues([10, 10], 0)).toBe(true)
    })
  })

  // --- linearScale ---
  describe('linearScale', () => {
    test('scales linearly', () => {
      const scale = linearScale([0, 100], [0, 1])
      expect(scale(0)).toBe(0)
      expect(scale(50)).toBe(0.5)
      expect(scale(100)).toBe(1)
    })

    test('handles identical input range', () => {
      const scale = linearScale([5, 5], [0, 100])
      expect(scale(5)).toBe(0)
    })

    test('handles inverted ranges', () => {
      const scale = linearScale([0, 100], [100, 0])
      expect(scale(0)).toBe(100)
      expect(scale(100)).toBe(0)
    })
  })

  // --- getDecimalCount ---
  describe('getDecimalCount', () => {
    test('integer has 0 decimals', () => {
      expect(getDecimalCount(5)).toBe(0)
    })

    test('counts decimal places', () => {
      expect(getDecimalCount(5.5)).toBe(1)
      expect(getDecimalCount(5.55)).toBe(2)
      expect(getDecimalCount(5.555)).toBe(3)
    })
  })

  // --- roundValue ---
  describe('roundValue', () => {
    test('rounds to specified decimals', () => {
      expect(roundValue(5.555, 2)).toBe(5.56)
      expect(roundValue(5.555, 1)).toBe(5.6)
      expect(roundValue(5.555, 0)).toBe(6)
    })

    test('no-op for integers', () => {
      expect(roundValue(5, 0)).toBe(5)
    })
  })
})
