import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { useSvgIndicator } from '../checkers'

function TestIndicator() {
  const { inputStyle, SvgIndicator, indicatorReady, checkedIndicatorReady } = useSvgIndicator({
    indicator: (
      <svg viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="4" />
      </svg>
    ),
    checkedIndicator: (
      <svg viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="blue" />
      </svg>
    ),
  })

  return (
    <div>
      <SvgIndicator data-testid="svg-indicator" />
      <input data-testid="input" style={inputStyle} />
      <span data-testid="off-ready">{String(indicatorReady)}</span>
      <span data-testid="on-ready">{String(checkedIndicatorReady)}</span>
    </div>
  )
}

describe('useSvgIndicator (checkers)', () => {
  it('renders hidden SVG containers', () => {
    const { container } = render(<TestIndicator />)
    const hiddenDivs = container.querySelectorAll('[aria-hidden]')
    expect(hiddenDivs.length).toBeGreaterThanOrEqual(2)
  })

  it('renders the indicator SVG inside hidden container', () => {
    const { container } = render(<TestIndicator />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(2)
  })

  it('returns SvgIndicator as a renderable component', () => {
    const { container } = render(<TestIndicator />)
    expect(container.querySelector('[data-testid="svg-indicator"]')).toBeDefined()
  })

  it('returns inputStyle object', () => {
    const { container } = render(<TestIndicator />)
    const input = container.querySelector('[data-testid="input"]') as HTMLInputElement
    expect(input).not.toBeNull()
  })
})

// SEC-005: regression test pinning the data-URI safety property of useSvgIndicator.
// Hostile-looking strings are passed as SVG text/attribute values. React escapes them
// when serializing to innerHTML, and svgToMiniDataURI URL-encodes the markup, so the
// resulting CSS var must always be an image/svg+xml data URI and never a live script.
const HOSTILE_TEXT = '</style><script>alert(1)</script>'
const HOSTILE_ATTR = '"><script>alert(1)</script>'

function HostileIndicator() {
  const { inputStyle, SvgIndicator } = useSvgIndicator({
    checkedIndicator: (
      <svg viewBox="0 0 16 16">
        <title>{HOSTILE_ATTR}</title>
        <circle cx="8" cy="8" r="6" fill="blue" />
        <text x="0" y="8">
          {HOSTILE_TEXT}
        </text>
      </svg>
    ),
    indicator: (
      <svg viewBox="0 0 16 16">
        <desc>{HOSTILE_TEXT}</desc>
        <circle cx="8" cy="8" r="4" />
        <text x="0" y="8">
          {HOSTILE_ATTR}
        </text>
      </svg>
    ),
  })

  return (
    <div>
      <SvgIndicator data-testid="svg-indicator" />
      <input data-testid="input" style={inputStyle} />
    </div>
  )
}

describe('useSvgIndicator (checkers) SEC-005 data-URI safety', () => {
  it('encodes SVG markup as an image/svg+xml data URI even with hostile inputs', () => {
    const { container } = render(<HostileIndicator />)
    const input = container.querySelector('[data-testid="input"]') as HTMLInputElement
    const style = input.getAttribute('style') ?? ''

    const matches = style.match(/url\("([^"]*)"\)/g) ?? []
    expect(matches.length).toBeGreaterThan(0)

    for (const wrapped of matches) {
      const uri = wrapped.slice(5, -2)
      expect(uri.startsWith('data:image/svg+xml')).toBe(true)
      expect(uri.startsWith('data:text/html')).toBe(false)
      expect(uri.startsWith('data:application/javascript')).toBe(false)
    }
  })

  it('produces no live <script> element and no javascript: URI', () => {
    const { container } = render(<HostileIndicator />)

    // The hidden source containers must not spawn a live script element.
    expect(container.querySelector('script')).toBeNull()

    const input = container.querySelector('[data-testid="input"]') as HTMLInputElement
    const style = input.getAttribute('style') ?? ''
    expect(style.toLowerCase()).not.toContain('javascript:')
    // A live (unescaped) script tag would survive verbatim; encoding escapes the angle brackets.
    expect(style).not.toContain('<script>')
  })
})
