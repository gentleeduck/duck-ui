import { readdirSync } from 'node:fs'
import path from 'node:path'
import { cleanup, render } from '@testing-library/react'
import type * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '../internal-primitives')
const examples = readdirSync(ROOT, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)

afterEach(cleanup)

describe('primitive examples', () => {
  it('finds the examples', () => {
    expect(examples.length).toBeGreaterThan(0)
  })

  for (const name of examples) {
    it(`renders ${name} without an error`, async () => {
      const { default: Example }: { default: React.ComponentType } = await import(
        /* @vite-ignore */ path.join(ROOT, name, `${name}.tsx`)
      )
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        render(<Example />)
        expect(error.mock.calls).toEqual([])
      } finally {
        error.mockRestore()
      }
    })
  }
})
