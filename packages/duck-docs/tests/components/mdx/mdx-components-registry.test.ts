import { describe, expect, it } from 'vitest'
import { mdxBaseComponents } from '../../../src/components/mdx/mdx-components-base'
import { mdxComponents } from '../../../src/components/mdx/mdx-components-registry'
import { mdxUiComponents } from '../../../src/components/mdx/mdx-components-ui'

describe('mdxComponents registry', () => {
  it('includes base component keys', () => {
    const registry = mdxComponents as Record<string, unknown>

    for (const key of Object.keys(mdxBaseComponents)) {
      expect(registry[key]).toBeDefined()
    }
  })

  it('includes UI component keys', () => {
    const registry = mdxComponents as Record<string, unknown>

    for (const key of Object.keys(mdxUiComponents)) {
      expect(registry[key]).toBeDefined()
    }
  })
})
