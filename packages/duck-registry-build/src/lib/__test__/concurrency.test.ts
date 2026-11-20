import { describe, expect, test } from 'vitest'
import { mapConcurrently } from '../concurrency'

describe('mapConcurrently', () => {
  test('returns empty array for empty input', async () => {
    const result = await mapConcurrently([], 2, async (value) => value)
    expect(result).toEqual([])
  })

  test('maps all values through the mapper function', async () => {
    const result = await mapConcurrently([1, 2, 3], 2, async (value) => value * 2)
    expect(result).toEqual([2, 4, 6])
  })

  test('preserves input order in results', async () => {
    const delays = [30, 10, 20]
    const result = await mapConcurrently(delays, 3, async (ms, index) => {
      await new Promise((resolve) => setTimeout(resolve, ms))
      return index
    })
    expect(result).toEqual([0, 1, 2])
  })

  test('passes correct index to mapper', async () => {
    const indices: number[] = []
    await mapConcurrently(['a', 'b', 'c'], 2, async (_value, index) => {
      indices.push(index)
    })
    expect(indices.sort()).toEqual([0, 1, 2])
  })

  test('respects concurrency limit', async () => {
    let activeTasks = 0
    let maxConcurrent = 0
    const concurrencyLimit = 2

    await mapConcurrently([1, 2, 3, 4, 5, 6], concurrencyLimit, async (value) => {
      activeTasks += 1
      maxConcurrent = Math.max(maxConcurrent, activeTasks)
      await new Promise((resolve) => setTimeout(resolve, 20))
      activeTasks -= 1
      return value
    })

    expect(maxConcurrent).toBeLessThanOrEqual(concurrencyLimit)
    expect(maxConcurrent).toBeGreaterThan(0)
  })

  test('treats concurrency of 0 as 1', async () => {
    let activeTasks = 0
    let maxConcurrent = 0

    await mapConcurrently([1, 2, 3], 0, async (value) => {
      activeTasks += 1
      maxConcurrent = Math.max(maxConcurrent, activeTasks)
      await new Promise((resolve) => setTimeout(resolve, 10))
      activeTasks -= 1
      return value
    })

    expect(maxConcurrent).toBe(1)
  })

  test('treats negative concurrency as 1', async () => {
    let activeTasks = 0
    let maxConcurrent = 0

    await mapConcurrently([1, 2, 3], -5, async (value) => {
      activeTasks += 1
      maxConcurrent = Math.max(maxConcurrent, activeTasks)
      await new Promise((resolve) => setTimeout(resolve, 10))
      activeTasks -= 1
      return value
    })

    expect(maxConcurrent).toBe(1)
  })

  test('handles a single item', async () => {
    const result = await mapConcurrently([42], 5, async (value) => value + 1)
    expect(result).toEqual([43])
  })

  test('does not spawn more workers than items', async () => {
    let activeTasks = 0
    let maxConcurrent = 0

    await mapConcurrently([1, 2], 10, async (value) => {
      activeTasks += 1
      maxConcurrent = Math.max(maxConcurrent, activeTasks)
      await new Promise((resolve) => setTimeout(resolve, 20))
      activeTasks -= 1
      return value
    })

    expect(maxConcurrent).toBeLessThanOrEqual(2)
  })

  test('propagates mapper errors', async () => {
    await expect(
      mapConcurrently([1, 2, 3], 2, async (value) => {
        if (value === 2) {
          throw new Error('mapper error')
        }
        return value
      }),
    ).rejects.toThrow('mapper error')
  })

  test('handles large number of items', async () => {
    const items = Array.from({ length: 100 }, (_, index) => index)
    const result = await mapConcurrently(items, 5, async (value) => value * 2)
    expect(result).toHaveLength(100)
    expect(result[0]).toBe(0)
    expect(result[99]).toBe(198)
  })
})
