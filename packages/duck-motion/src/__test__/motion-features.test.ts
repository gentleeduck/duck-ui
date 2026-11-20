import { describe, expect, test } from 'vitest'
import { loadDomAnimation, loadDomMax } from '../motion-features'

describe('loadDomAnimation', () => {
  test('is a function', () => {
    expect(typeof loadDomAnimation).toBe('function')
  })

  test('returns a promise', () => {
    const result = loadDomAnimation()
    expect(result).toBeInstanceOf(Promise)
  })
})

describe('loadDomMax', () => {
  test('is a function', () => {
    expect(typeof loadDomMax).toBe('function')
  })

  test('returns a promise', () => {
    const result = loadDomMax()
    expect(result).toBeInstanceOf(Promise)
  })
})
