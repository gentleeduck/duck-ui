import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { assertSafeName, assertSafeRelativePath, resolveWithinBase } from '../safe-path'

const base = path.resolve('/tmp/registry-build-test')

describe('assertSafeName', () => {
  test('accepts plain identifiers', () => {
    expect(assertSafeName('button')).toBe('button')
    expect(assertSafeName('my-component-1')).toBe('my-component-1')
    expect(assertSafeName('item_name.v2')).toBe('item_name.v2')
  })

  test('rejects empty string', () => {
    expect(() => assertSafeName('')).toThrow(/non-empty/)
  })

  test('rejects names with slashes', () => {
    expect(() => assertSafeName('foo/bar')).toThrow(/only letters/)
    expect(() => assertSafeName('foo\\bar')).toThrow(/only letters/)
  })

  test('rejects traversal segments', () => {
    expect(() => assertSafeName('..')).toThrow(/traversal/)
    expect(() => assertSafeName('.')).toThrow(/traversal/)
  })

  test('rejects shell metacharacters', () => {
    expect(() => assertSafeName('foo;rm -rf /')).toThrow(/only letters/)
    expect(() => assertSafeName('foo$(echo x)')).toThrow(/only letters/)
    expect(() => assertSafeName('foo bar')).toThrow(/only letters/)
    expect(() => assertSafeName('foo{}')).toThrow(/only letters/)
  })

  test('rejects control characters', () => {
    expect(() => assertSafeName('foo\x00bar')).toThrow(/control/)
    expect(() => assertSafeName('foo\nbar')).toThrow(/control/)
  })
})

describe('assertSafeRelativePath', () => {
  test('accepts nested relative paths', () => {
    expect(assertSafeRelativePath('button/button.tsx')).toBe('button/button.tsx')
    expect(assertSafeRelativePath('a/b/c.ts')).toBe('a/b/c.ts')
  })

  test('rejects empty string', () => {
    expect(() => assertSafeRelativePath('')).toThrow(/non-empty/)
  })

  test('rejects absolute paths', () => {
    expect(() => assertSafeRelativePath('/etc/passwd')).toThrow(/absolute/)
  })

  test('rejects ".." traversal', () => {
    expect(() => assertSafeRelativePath('../foo')).toThrow(/traversal/)
    expect(() => assertSafeRelativePath('foo/../bar')).toThrow(/traversal/)
    expect(() => assertSafeRelativePath('a/b/../../etc/passwd')).toThrow(/traversal/)
  })

  test('rejects shell metacharacters in paths', () => {
    expect(() => assertSafeRelativePath('foo;rm -rf /')).toThrow(/only letters/)
    expect(() => assertSafeRelativePath('foo $(cmd)')).toThrow(/only letters/)
  })

  test('rejects control characters', () => {
    expect(() => assertSafeRelativePath('foo\x00bar')).toThrow(/control/)
  })
})

describe('resolveWithinBase', () => {
  test('resolves nested contained paths', () => {
    const result = resolveWithinBase(base, 'ui/button.tsx')
    expect(result).toBe(path.join(base, 'ui', 'button.tsx'))
  })

  test('rejects ".." traversal even if it stays inside base', () => {
    expect(() => resolveWithinBase(base, 'ui/../button')).toThrow(/traversal/)
  })

  test('rejects an absolute path', () => {
    expect(() => resolveWithinBase(base, '/etc/passwd')).toThrow(/absolute/)
  })

  test('rejects an empty path', () => {
    expect(() => resolveWithinBase(base, '')).toThrow(/non-empty/)
  })

  test('rejects backslash traversal', () => {
    expect(() => resolveWithinBase(base, '..\\..\\etc\\passwd')).toThrow(/traversal|only letters/)
  })
})
