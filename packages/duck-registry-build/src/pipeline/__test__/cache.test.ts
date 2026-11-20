import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { hashString } from '../../lib/hash'
import { createRegistryBuildCache } from '../cache'

const tempDirs: string[] = []

async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'registry-build-cache-'))
  tempDirs.push(tempDir)
  return tempDir
}

async function writeFile(filePath: string, content: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf8')
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { force: true, recursive: true })))
})

describe('createRegistryBuildCache', () => {
  describe('initialization', () => {
    test('creates a cache store with expected properties', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      expect(cache.enabled).toBe(true)
      expect(cache.filePath).toBe(cachePath)
      expect(typeof cache.getFileHash).toBe('function')
      expect(typeof cache.getPhaseData).toBe('function')
      expect(typeof cache.setPhaseData).toBe('function')
      expect(typeof cache.save).toBe('function')
    })

    test('creates a disabled cache store when enabled is false', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: false,
        filePath: cachePath,
      })

      expect(cache.enabled).toBe(false)
    })

    test('starts with an empty manifest when no cache file exists', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      expect(cache.getPhaseData('anyPhase')).toBeUndefined()
    })

    test('loads an existing cache file when enabled and file exists', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')
      const manifest = {
        fileHashes: {},
        phases: { index: { entries: {} } },
        version: 1,
      }
      await writeFile(cachePath, JSON.stringify(manifest))

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      expect(cache.getPhaseData('index')).toEqual({ entries: {} })
    })

    test('ignores existing cache file when enabled is false', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')
      const manifest = {
        fileHashes: {},
        phases: { index: { entries: {} } },
        version: 1,
      }
      await writeFile(cachePath, JSON.stringify(manifest))

      const cache = await createRegistryBuildCache({
        enabled: false,
        filePath: cachePath,
      })

      expect(cache.getPhaseData('index')).toBeUndefined()
    })

    test('resets manifest when cache version does not match', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')
      const manifest = {
        fileHashes: {},
        phases: { index: { stale: true } },
        version: 999,
      }
      await writeFile(cachePath, JSON.stringify(manifest))

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      expect(cache.getPhaseData('index')).toBeUndefined()
    })
  })

  describe('phase data', () => {
    test('setPhaseData stores and getPhaseData retrieves a value', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      const data = { hashes: { 'button.json': 'abc123' }, itemCount: 3 }
      const returned = cache.setPhaseData('components', data)

      expect(returned).toEqual(data)
      expect(cache.getPhaseData('components')).toEqual(data)
    })

    test('setPhaseData overwrites existing phase data', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      cache.setPhaseData('colors', { version: 1 })
      cache.setPhaseData('colors', { version: 2 })

      expect(cache.getPhaseData('colors')).toEqual({ version: 2 })
    })

    test('getPhaseData returns undefined for unknown phases', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      expect(cache.getPhaseData('nonexistent')).toBeUndefined()
    })

    test('multiple phases are stored independently', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      cache.setPhaseData('validate', { passed: true })
      cache.setPhaseData('index', { itemCount: 10 })
      cache.setPhaseData('components', { built: 5 })

      expect(cache.getPhaseData('validate')).toEqual({ passed: true })
      expect(cache.getPhaseData('index')).toEqual({ itemCount: 10 })
      expect(cache.getPhaseData('components')).toEqual({ built: 5 })
    })
  })

  describe('file hashing', () => {
    test('getFileHash returns the SHA-256 hash of a file', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')
      const testFile = path.join(tempDir, 'src', 'button.tsx')
      const content = 'export const Button = () => null\n'
      await writeFile(testFile, content)

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      const hash = await cache.getFileHash(testFile)
      expect(hash).toBe(hashString(content))
    })

    test('getFileHash returns the same hash for unchanged files', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')
      const testFile = path.join(tempDir, 'src', 'button.tsx')
      await writeFile(testFile, 'export const Button = () => null\n')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      const hash1 = await cache.getFileHash(testFile)
      const hash2 = await cache.getFileHash(testFile)

      expect(hash1).toBe(hash2)
    })

    test('getFileHash returns a different hash when file content changes', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')
      const testFile = path.join(tempDir, 'src', 'button.tsx')
      await writeFile(testFile, 'export const Button = () => null\n')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      const hash1 = await cache.getFileHash(testFile)

      // Wait so mtime differs.
      await new Promise((resolve) => setTimeout(resolve, 50))
      await writeFile(testFile, 'export const Button = () => "updated"\n')

      const hash2 = await cache.getFileHash(testFile)

      expect(hash1).not.toBe(hash2)
      expect(hash2).toBe(hashString('export const Button = () => "updated"\n'))
    })
  })

  describe('save', () => {
    test('save writes the cache manifest to disk when enabled and dirty', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      cache.setPhaseData('index', { itemCount: 7 })
      await cache.save()

      const written = JSON.parse(await fs.readFile(cachePath, 'utf8')) as {
        phases: Record<string, unknown>
        version: number
      }

      expect(written.version).toBe(1)
      expect(written.phases.index).toEqual({ itemCount: 7 })
    })

    test('save does not write when disabled', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: false,
        filePath: cachePath,
      })

      cache.setPhaseData('index', { itemCount: 7 })
      await cache.save()

      const exists = await fs
        .access(cachePath)
        .then(() => true)
        .catch(() => false)

      expect(exists).toBe(false)
    })

    test('save is idempotent (no-op on second call without changes)', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      cache.setPhaseData('colors', { count: 3 })
      await cache.save()

      const stat1 = await fs.stat(cachePath)

      await new Promise((resolve) => setTimeout(resolve, 50))
      await cache.save()

      const stat2 = await fs.stat(cachePath)

      expect(stat2.mtimeMs).toBe(stat1.mtimeMs)
    })

    test('saved cache can be loaded by a new cache instance', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')
      const testFile = path.join(tempDir, 'src', 'dialog.tsx')
      await writeFile(testFile, 'export const Dialog = () => null\n')

      const cache1 = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })
      cache1.setPhaseData('validate', { passed: true })
      await cache1.getFileHash(testFile)
      await cache1.save()

      const cache2 = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      expect(cache2.getPhaseData('validate')).toEqual({ passed: true })

      const hash = await cache2.getFileHash(testFile)
      expect(hash).toBe(hashString('export const Dialog = () => null\n'))
    })
  })

  describe('version-based invalidation', () => {
    test('saves with version 1 and reloading produces valid data', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })
      cache.setPhaseData('test', { value: 42 })
      await cache.save()

      const raw = JSON.parse(await fs.readFile(cachePath, 'utf8')) as { version: number }
      expect(raw.version).toBe(1)

      const cache2 = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })
      expect(cache2.getPhaseData('test')).toEqual({ value: 42 })
    })

    test('corrupted version in cache file causes full reset', async () => {
      const tempDir = await createTempDir()
      const cachePath = path.join(tempDir, '.cache', 'build-cache.json')

      await writeFile(
        cachePath,
        JSON.stringify({
          fileHashes: { '/some/file': { hash: 'old', mtimeMs: 0, size: 0 } },
          phases: { stale: { data: true } },
          version: 0,
        }),
      )

      const cache = await createRegistryBuildCache({
        enabled: true,
        filePath: cachePath,
      })

      expect(cache.getPhaseData('stale')).toBeUndefined()
    })
  })
})
