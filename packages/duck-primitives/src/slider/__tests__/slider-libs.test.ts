import { describe, expect, test } from 'vitest'
import {
  convertValueToPercentage,
  getClosestValueIndex,
  getDecimalCount,
  getLabel,
  getNextSortedValues,
  getNextStepValue,
  getThumbInBoundsOffset,
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

    test('scales from where the input starts', () => {
      expect(linearScale([10, 20], [0, 100])(15)).toBe(50)
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

    test('counts the exponent of a number printed in scientific notation', () => {
      expect(getDecimalCount(1e-7)).toBe(7)
      expect(getDecimalCount(1.5e-7)).toBe(8)
      expect(getDecimalCount(1e21)).toBe(0)
    })

    test('a non-finite number has 0 decimals', () => {
      expect(getDecimalCount(Number.NaN)).toBe(0)
      expect(getDecimalCount(Number.POSITIVE_INFINITY)).toBe(0)
    })
  })

  describe('getNextStepValue', () => {
    const grid = { min: 1000, step: 5000 }

    test('moves an aligned value by whole steps', () => {
      expect(getNextStepValue(46000, { ...grid, direction: 1, multiplier: 1 })).toBe(51000)
      expect(getNextStepValue(46000, { ...grid, direction: -1, multiplier: 10 })).toBe(-4000)
    })

    test('snaps an off-grid value to the next grid line in the direction of travel', () => {
      expect(getNextStepValue(49000, { ...grid, direction: 1, multiplier: 1 })).toBe(51000)
      expect(getNextStepValue(49000, { ...grid, direction: -1, multiplier: 1 })).toBe(46000)
      expect(getNextStepValue(47000, { ...grid, direction: 1, multiplier: 1 })).toBe(51000)
      expect(getNextStepValue(47000, { ...grid, direction: -1, multiplier: 1 })).toBe(46000)
    })

    test('counts the snap as the first of several steps', () => {
      expect(getNextStepValue(49000, { ...grid, direction: 1, multiplier: 10 })).toBe(96000)
      expect(getNextStepValue(49000, { ...grid, direction: -1, multiplier: 10 })).toBe(1000)
    })

    test('keeps the precision of a fractional step', () => {
      expect(getNextStepValue(0.2, { min: 0, step: 0.1, direction: 1, multiplier: 1 })).toBe(0.3)
      expect(getNextStepValue(1e-7, { min: 0, step: 1e-7, direction: 1, multiplier: 1 })).toBe(2e-7)
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

  describe('getThumbInBoundsOffset', () => {
    test('pulls a 20px thumb half its width inside the track at either end and leaves it centred midway', () => {
      expect([0, 50, 100].map((percent) => getThumbInBoundsOffset(20, percent, 1))).toEqual([10, 0, -10])
    })

    test('keeps a right-to-left thumb inside too, where the -50% translate still pulls it left', () => {
      expect([0, 50, 100].map((percent) => getThumbInBoundsOffset(20, percent, -1))).toEqual([-10, -20, -30])
    })
  })
})
