import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { getDocsIndexStats, resetDocsIndexStateForTests } from '../server'

const CONTENT_DIR_ENV_VAR = 'ACME_DOCS_CONTENT_DIR'
const CACHE_DIR_ENV_VAR = 'ACME_DOCS_MCP_CACHE_DIR'

async function writeDocFile(rootDir: string, relativePath: string, content: string): Promise<void> {
  const filePath = join(rootDir, relativePath)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf-8')
}

describe('MCP docs index persistence', () => {
  let tempRootDir = ''
  let docsDir = ''
  let cacheDir = ''
  let previousContentDir: string | undefined
  let previousCacheDir: string | undefined

  beforeEach(async () => {
    previousContentDir = process.env[CONTENT_DIR_ENV_VAR]
    previousCacheDir = process.env[CACHE_DIR_ENV_VAR]

    tempRootDir = await mkdtemp(join(tmpdir(), 'acme-mcp-index-'))
    docsDir = join(tempRootDir, 'docs')
    cacheDir = join(tempRootDir, 'cache')

    process.env[CONTENT_DIR_ENV_VAR] = docsDir
    process.env[CACHE_DIR_ENV_VAR] = cacheDir

    await resetDocsIndexStateForTests({ clearPersistent: true })
  })

  afterEach(async () => {
    await resetDocsIndexStateForTests({ clearPersistent: true })

    if (previousContentDir === undefined) {
      delete process.env[CONTENT_DIR_ENV_VAR]
    } else {
      process.env[CONTENT_DIR_ENV_VAR] = previousContentDir
    }

    if (previousCacheDir === undefined) {
      delete process.env[CACHE_DIR_ENV_VAR]
    } else {
      process.env[CACHE_DIR_ENV_VAR] = previousCacheDir
    }

    await rm(tempRootDir, { recursive: true, force: true })
  })

  test('reuses a persisted index snapshot after clearing in-memory state', async () => {
    await writeDocFile(
      docsDir,
      'components/button.mdx',
      `---
title: button
description: Button component
---
# Button

Use the button component.
`,
    )

    const first = await getDocsIndexStats()
    expect(first.docCount).toBe(1)
    expect(first.cache.source).toBe('rebuild')
    expect(first.cache.persistedEntries).toBe(1)

    await resetDocsIndexStateForTests()

    const second = await getDocsIndexStats()
    expect(second.docCount).toBe(1)
    expect(second.cache.source).toBe('persistent')
    expect(second.cache.persistedEntries).toBe(1)
    expect(second.cache.cacheFilePath).toContain('docs-index-')
  })

  test('incrementally rebuilds only changed docs when a persisted snapshot exists', async () => {
    await writeDocFile(
      docsDir,
      'components/button.mdx',
      `---
title: button
description: Button component
---
# Button

Use the button component.
`,
    )
    await writeDocFile(
      docsDir,
      'components/dialog.mdx',
      `---
title: dialog
description: Dialog component
---
# Dialog

Use the dialog component.
`,
    )

    const first = await getDocsIndexStats()
    expect(first.cache.source).toBe('rebuild')

    await new Promise((resolve) => setTimeout(resolve, 20))

    await writeDocFile(
      docsDir,
      'components/dialog.mdx',
      `---
title: dialog
description: Dialog component updated
---
# Dialog

Use the updated dialog component.
`,
    )

    await resetDocsIndexStateForTests()

    const second = await getDocsIndexStats()
    expect(second.docCount).toBe(2)
    expect(second.cache.source).toBe('incremental')
    expect(second.cache.persistedEntries).toBe(2)
  })
})
