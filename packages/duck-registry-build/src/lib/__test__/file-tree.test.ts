import { describe, expect, test } from 'vitest'
import type { IRegistryFileTreeNode } from '../file-tree'
import { createRegistryFileTree } from '../file-tree'

describe('createRegistryFileTree', () => {
  test('returns empty array for empty input', () => {
    expect(createRegistryFileTree([])).toEqual([])
  })

  test('creates a single file node', () => {
    const result = createRegistryFileTree(['file.ts'])
    expect(result).toEqual([
      {
        name: 'file.ts',
        path: 'file.ts',
        type: 'file',
      },
    ])
  })

  test('creates a folder with a nested file', () => {
    const result = createRegistryFileTree(['src/file.ts'])
    expect(result).toEqual([
      {
        children: [
          {
            name: 'file.ts',
            path: 'src/file.ts',
            type: 'file',
          },
        ],
        name: 'src',
        path: 'src',
        type: 'folder',
      },
    ])
  })

  test('groups files under the same folder', () => {
    const result = createRegistryFileTree(['src/a.ts', 'src/b.ts'])
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('src')
    expect(result[0]?.type).toBe('folder')
    expect(result[0]?.children).toHaveLength(2)
    expect(result[0]?.children?.map((child) => child.name).sort()).toEqual(['a.ts', 'b.ts'])
  })

  test('creates separate top-level entries for different folders', () => {
    const result = createRegistryFileTree(['lib/a.ts', 'src/b.ts'])
    expect(result).toHaveLength(2)
    expect(result.map((node) => node.name).sort()).toEqual(['lib', 'src'])
  })

  test('handles deeply nested paths', () => {
    const result = createRegistryFileTree(['a/b/c/file.ts'])
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('a')
    expect(result[0]?.children?.[0]?.name).toBe('b')
    expect(result[0]?.children?.[0]?.children?.[0]?.name).toBe('c')
    expect(result[0]?.children?.[0]?.children?.[0]?.children?.[0]?.name).toBe('file.ts')
    expect(result[0]?.children?.[0]?.children?.[0]?.children?.[0]?.path).toBe('a/b/c/file.ts')
  })

  test('strips basePath from file paths', () => {
    const result = createRegistryFileTree(['base/dir/src/file.ts'], { basePath: 'base/dir' })
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('src')
    expect(result[0]?.children?.[0]?.name).toBe('file.ts')
    expect(result[0]?.children?.[0]?.path).toBe('base/dir/src/file.ts')
  })

  test('normalizes backslashes in paths', () => {
    const result = createRegistryFileTree(['src\\lib\\file.ts'])
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('src')
    expect(result[0]?.children?.[0]?.name).toBe('lib')
    expect(result[0]?.children?.[0]?.children?.[0]?.name).toBe('file.ts')
  })

  test('normalizes backslashes in basePath', () => {
    const result = createRegistryFileTree(['base\\dir/src/file.ts'], { basePath: 'base\\dir' })
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('src')
  })

  test('handles basePath with trailing slash', () => {
    const result = createRegistryFileTree(['base/src/file.ts'], { basePath: 'base/' })
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('src')
  })

  test('does not strip basePath when file does not start with it', () => {
    const result = createRegistryFileTree(['other/file.ts'], { basePath: 'base' })
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('other')
  })

  test('mixes files and folders at the same level', () => {
    const result = createRegistryFileTree(['index.ts', 'src/file.ts'])
    expect(result).toHaveLength(2)
    const fileNode = result.find((node) => node.type === 'file')
    const folderNode = result.find((node) => node.type === 'folder')
    expect(fileNode?.name).toBe('index.ts')
    expect(folderNode?.name).toBe('src')
    expect(folderNode?.children).toHaveLength(1)
  })

  test('file nodes do not have children property', () => {
    const result = createRegistryFileTree(['file.ts'])
    expect(result[0]).not.toHaveProperty('children')
  })

  test('folder nodes always have children array', () => {
    const result = createRegistryFileTree(['src/file.ts'])
    expect(result[0]?.children).toBeInstanceOf(Array)
  })

  test('handles multiple files in deeply nested shared path', () => {
    const result = createRegistryFileTree(['a/b/one.ts', 'a/b/two.ts', 'a/c/three.ts'])
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('a')
    expect(result[0]?.children).toHaveLength(2)

    const bFolder = result[0]?.children?.find((node) => node.name === 'b')
    expect(bFolder?.children).toHaveLength(2)

    const cFolder = result[0]?.children?.find((node) => node.name === 'c')
    expect(cFolder?.children).toHaveLength(1)
  })
})
