import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { listFilesRecursively, pathExists, removeStaleFiles, writeFileIfChanged, writeJsonIfChanged } from '../fs'

const tempDirs: string[] = []

async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'registry-build-fs-'))
  tempDirs.push(tempDir)
  return tempDir
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { force: true, recursive: true })))
})

describe('pathExists', () => {
  test('returns true for an existing file', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'file.txt')
    await fs.writeFile(filePath, 'content', 'utf8')

    expect(await pathExists(filePath)).toBe(true)
  })

  test('returns true for an existing directory', async () => {
    const tempDir = await createTempDir()

    expect(await pathExists(tempDir)).toBe(true)
  })

  test('returns false for a non-existent path', async () => {
    const tempDir = await createTempDir()

    expect(await pathExists(path.join(tempDir, 'nonexistent'))).toBe(false)
  })
})

describe('writeFileIfChanged', () => {
  test('writes a new file and returns true', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'new-file.txt')

    const written = await writeFileIfChanged(filePath, 'hello')

    expect(written).toBe(true)
    expect(await fs.readFile(filePath, 'utf8')).toBe('hello')
  })

  test('creates nested directories as needed', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'a', 'b', 'c', 'file.txt')

    const written = await writeFileIfChanged(filePath, 'deep')

    expect(written).toBe(true)
    expect(await fs.readFile(filePath, 'utf8')).toBe('deep')
  })

  test('returns false when content has not changed', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'file.txt')
    await fs.writeFile(filePath, 'same', 'utf8')

    const written = await writeFileIfChanged(filePath, 'same')

    expect(written).toBe(false)
  })

  test('overwrites when content differs and returns true', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'file.txt')
    await fs.writeFile(filePath, 'old', 'utf8')

    const written = await writeFileIfChanged(filePath, 'new')

    expect(written).toBe(true)
    expect(await fs.readFile(filePath, 'utf8')).toBe('new')
  })
})

describe('writeJsonIfChanged', () => {
  test('writes JSON-serialized value to file', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'data.json')

    await writeJsonIfChanged(filePath, { key: 'value' })

    const content = await fs.readFile(filePath, 'utf8')
    expect(JSON.parse(content)).toEqual({ key: 'value' })
  })

  test('returns false when JSON content has not changed', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'data.json')
    const value = { a: 1, b: 2 }

    await writeJsonIfChanged(filePath, value)
    const written = await writeJsonIfChanged(filePath, value)

    expect(written).toBe(false)
  })
})

describe('listFilesRecursively', () => {
  test('returns empty array for non-existent path', async () => {
    const tempDir = await createTempDir()

    expect(await listFilesRecursively(path.join(tempDir, 'nonexistent'))).toEqual([])
  })

  test('lists files in a flat directory', async () => {
    const tempDir = await createTempDir()
    await fs.writeFile(path.join(tempDir, 'a.txt'), '', 'utf8')
    await fs.writeFile(path.join(tempDir, 'b.txt'), '', 'utf8')

    const result = await listFilesRecursively(tempDir)

    expect(result).toEqual([path.join(tempDir, 'a.txt'), path.join(tempDir, 'b.txt')])
  })

  test('lists files recursively and sorts them', async () => {
    const tempDir = await createTempDir()
    await fs.mkdir(path.join(tempDir, 'sub'), { recursive: true })
    await fs.writeFile(path.join(tempDir, 'z.txt'), '', 'utf8')
    await fs.writeFile(path.join(tempDir, 'sub', 'a.txt'), '', 'utf8')

    const result = await listFilesRecursively(tempDir)

    expect(result).toEqual([path.join(tempDir, 'sub', 'a.txt'), path.join(tempDir, 'z.txt')])
  })

  test('returns empty array for empty directory', async () => {
    const tempDir = await createTempDir()

    expect(await listFilesRecursively(tempDir)).toEqual([])
  })
})

describe('removeStaleFiles', () => {
  test('removes files no longer present in current paths', async () => {
    const tempDir = await createTempDir()
    const stalePath = path.join(tempDir, 'stale.txt')
    const keptPath = path.join(tempDir, 'kept.txt')
    await fs.writeFile(stalePath, '', 'utf8')
    await fs.writeFile(keptPath, '', 'utf8')

    const removed = await removeStaleFiles([keptPath], [keptPath, stalePath], [tempDir])

    expect(removed).toEqual([stalePath])
    expect(await pathExists(stalePath)).toBe(false)
    expect(await pathExists(keptPath)).toBe(true)
  })

  test('returns empty array when no files are stale', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'file.txt')
    await fs.writeFile(filePath, '', 'utf8')

    const removed = await removeStaleFiles([filePath], [filePath], [tempDir])

    expect(removed).toEqual([])
  })

  test('handles empty previous paths', async () => {
    const tempDir = await createTempDir()
    const removed = await removeStaleFiles([path.join(tempDir, 'kept')], [], [tempDir])

    expect(removed).toEqual([])
  })

  test('handles empty current paths (removes all previous)', async () => {
    const tempDir = await createTempDir()
    const filePath = path.join(tempDir, 'file.txt')
    await fs.writeFile(filePath, '', 'utf8')

    const removed = await removeStaleFiles([], [filePath], [tempDir])

    expect(removed).toEqual([filePath])
    expect(await pathExists(filePath)).toBe(false)
  })

  test('refuses to delete paths that escape the allowed base dirs', async () => {
    const tempDir = await createTempDir()
    const sentinelDir = await createTempDir()
    const sentinelPath = path.join(sentinelDir, 'do-not-touch.txt')
    await fs.writeFile(sentinelPath, 'safe', 'utf8')

    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (...args: unknown[]) => {
      warnings.push(args.map((a) => String(a)).join(' '))
    }

    try {
      const removed = await removeStaleFiles([], [sentinelPath], [tempDir])

      expect(removed).toEqual([])
      // Sentinel file must NOT be unlinked — it lives outside the allowed base.
      expect(await pathExists(sentinelPath)).toBe(true)
      expect(warnings.some((w) => w.includes(sentinelPath))).toBe(true)
    } finally {
      console.warn = originalWarn
    }
  })

  test('throws when called with no allowed base dirs', async () => {
    await expect(removeStaleFiles([], ['/anywhere'], [])).rejects.toThrow(/allowed base dir/)
  })
})
