import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MdxComponentMap } from '../../../src/components/mdx/mdx-component-registry.types'
import { compileMdxBody, trustCompiledMdxBody, useMDXComponent } from '../../../src/components/mdx/mdx-runtime'

const TRUSTED_BODY = `
return {
  default: function MDXContent({ components }) {
    const P = components.p
    return P ? P({ children: 'runtime ok' }) : null
  }
}
`

describe('compileMdxBody', () => {
  it('compiles a trusted MDX body and renders with a supplied component map', () => {
    const Compiled = compileMdxBody(trustCompiledMdxBody(TRUSTED_BODY))
    const components: MdxComponentMap = {
      p: (props) => React.createElement('p', props),
    }

    const html = renderToStaticMarkup(React.createElement(Compiled, { components }))
    expect(html).toContain('<p>runtime ok</p>')
  })

  it('rejects compiled bodies without a default export factory', () => {
    expect(() => compileMdxBody(trustCompiledMdxBody('return {}'))).toThrow(/default/)
    expect(() => compileMdxBody(trustCompiledMdxBody('return { default: 42 }'))).toThrow(/not a component/)
  })
})

describe('useMDXComponent (deprecated shim)', () => {
  it('still compiles for legacy callers', () => {
    const Compiled = useMDXComponent(TRUSTED_BODY)
    const components: MdxComponentMap = {
      p: (props) => React.createElement('p', props),
    }

    const html = renderToStaticMarkup(React.createElement(Compiled, { components }))
    expect(html).toContain('<p>runtime ok</p>')
  })
})
