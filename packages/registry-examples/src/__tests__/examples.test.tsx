import { readdirSync } from 'node:fs'
import path from 'node:path'
import { cleanup, render } from '@testing-library/react'
import type * as React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '..')
const examples = readdirSync(ROOT, { recursive: true, withFileTypes: true })
  .filter((dirent) => dirent.isFile() && /-\d+\.tsx$/.test(dirent.name))
  .map((dirent) => path.relative(ROOT, path.join(dirent.parentPath, dirent.name)))
  .sort()

afterEach(cleanup)

describe('registry examples', () => {
  it('finds the examples', () => {
    expect(examples.length).toBeGreaterThan(0)
  })

  for (const file of examples) {
    it(`renders ${file}`, async () => {
      const { default: Example }: { default: React.ComponentType } = await import(
        /* @vite-ignore */ path.join(ROOT, file)
      )
      expect(() => render(<Example />)).not.toThrow()
    })
  }
})
