import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PreBlock } from '../../../src/components/mdx/mdx-components/code/pre-block/pre-block'

describe('PreBlock', () => {
  it('renders a regular pre block with source content', () => {
    const html = renderToStaticMarkup(
      <PreBlock __dmcRaw__="npm install @gentleduck/ui">
        <code>npm install @gentleduck/ui</code>
      </PreBlock>,
    )

    expect(html).toContain('<pre')
    expect(html).toContain('npm install @gentleduck/ui')
  })

  it('renders command tabs when all package manager commands are available', () => {
    const html = renderToStaticMarkup(
      <PreBlock
        bun="bun add @gentleduck/ui"
        npm="npm install @gentleduck/ui"
        pnpm="pnpm add @gentleduck/ui"
        yarn="yarn add @gentleduck/ui">
        <code>npm install @gentleduck/ui</code>
      </PreBlock>,
    )

    expect(html).toContain('npm install @gentleduck/ui')
    expect(html).toContain('>npm<')
    expect(html).toContain('>yarn<')
    expect(html).toContain('>pnpm<')
    expect(html).toContain('>bun<')
  })
})
