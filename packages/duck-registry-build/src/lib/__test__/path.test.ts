import { describe, expect, test } from 'vitest'
import { joinPosix, normalizeSlashes } from '../path'

describe('normalizeSlashes', () => {
  test('replaces backslashes with forward slashes', () => {
    expect(normalizeSlashes('src\\lib\\path.ts')).toBe('src/lib/path.ts')
  })

  test('leaves forward slashes unchanged', () => {
    expect(normalizeSlashes('src/lib/path.ts')).toBe('src/lib/path.ts')
  })

  test('handles mixed slashes', () => {
    expect(normalizeSlashes('src\\lib/path\\file.ts')).toBe('src/lib/path/file.ts')
  })

  test('returns empty string for empty input', () => {
    expect(normalizeSlashes('')).toBe('')
  })

  test('handles consecutive backslashes', () => {
    expect(normalizeSlashes('src\\\\lib')).toBe('src//lib')
  })

  test('handles strings with no slashes', () => {
    expect(normalizeSlashes('file.ts')).toBe('file.ts')
  })
})

describe('joinPosix', () => {
  test('joins multiple path segments with forward slashes', () => {
    expect(joinPosix('src', 'lib', 'path.ts')).toBe('src/lib/path.ts')
  })

  test('normalizes backslashes in segments before joining', () => {
    expect(joinPosix('src\\lib', 'path.ts')).toBe('src/lib/path.ts')
  })

  test('filters out empty segments', () => {
    expect(joinPosix('src', '', 'lib', '', 'path.ts')).toBe('src/lib/path.ts')
  })

  test('handles a single segment', () => {
    expect(joinPosix('src')).toBe('src')
  })

  test('normalizes redundant separators', () => {
    expect(joinPosix('src/', '/lib')).toBe('src/lib')
  })

  test('handles relative path segments', () => {
    expect(joinPosix('src', '..', 'lib')).toBe('lib')
  })

  test('handles dot segments', () => {
    expect(joinPosix('.', 'src', 'lib')).toBe('src/lib')
  })
})
