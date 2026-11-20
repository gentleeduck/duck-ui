import { describe, expect, it } from 'vitest'
import { sanitizeSvg } from '../../src/lib/sanitize-svg'

describe('sanitizeSvg', () => {
  it('keeps a clean inline SVG verbatim', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" /></svg>'
    expect(sanitizeSvg(svg)).toBe(svg)
  })

  it('strips <script> children', () => {
    const out = sanitizeSvg('<svg><script>alert(1)</script><g/></svg>')
    expect(out).not.toContain('script')
    expect(out).not.toContain('alert')
  })

  it('strips self-closing <script />', () => {
    const out = sanitizeSvg('<svg><script src="x.js" /></svg>')
    expect(out).not.toContain('script')
  })

  it('strips <foreignObject> blocks', () => {
    const out = sanitizeSvg('<svg><foreignObject><iframe src="x"></iframe></foreignObject></svg>')
    expect(out).not.toContain('foreignObject')
    expect(out).not.toContain('iframe')
  })

  it('strips on* event handlers regardless of casing', () => {
    const out = sanitizeSvg('<svg onload="alert(1)" OnClick="x()"><g onmouseover=\'y()\'/></svg>')
    expect(out).not.toContain('onload')
    expect(out).not.toContain('OnClick')
    expect(out).not.toContain('onmouseover')
    expect(out).not.toContain('alert')
  })

  it('neutralizes javascript: hrefs', () => {
    const out = sanitizeSvg('<svg><a href="javascript:alert(1)">x</a></svg>')
    expect(out).not.toContain('javascript:')
  })

  it('neutralizes xlink:href javascript: URIs', () => {
    const out = sanitizeSvg('<svg><a xlink:href="javascript:alert(1)">x</a></svg>')
    expect(out).not.toContain('javascript:')
  })

  it('rejects non-svg input', () => {
    expect(sanitizeSvg('<html><body>nope</body></html>')).toBe('')
    expect(sanitizeSvg('')).toBe('')
  })

  // === Pass-2 vectors ===

  // Vector 1: SMIL <set> overwriting an event attribute at runtime.
  it('strips SMIL <set> elements (attributeName=on*)', () => {
    const out = sanitizeSvg('<svg><set attributeName="onload" to="alert(1)"/></svg>')
    expect(out).not.toContain('<set')
    expect(out).not.toContain('alert')
    expect(out).not.toContain('onload')
  })

  // Vector 2: SMIL <animate> animating href to a javascript: URL.
  it('strips SMIL <animate> elements (values=javascript:...)', () => {
    const out = sanitizeSvg('<svg><a><animate attributeName="href" values="javascript:alert(1)" dur="1s"/></a></svg>')
    expect(out).not.toContain('<animate')
    expect(out).not.toContain('javascript:')
  })

  // Vector 2b: also strip <animateTransform> and <animateMotion>.
  it('strips <animateTransform> and <animateMotion>', () => {
    const out = sanitizeSvg(
      '<svg><animateTransform attributeName="transform" type="rotate"/><animateMotion path="M0,0"/></svg>',
    )
    expect(out).not.toContain('animateTransform')
    expect(out).not.toContain('animateMotion')
  })

  // Vector 3: unquoted javascript: href bypass.
  it('neutralizes UNQUOTED javascript: href', () => {
    const out = sanitizeSvg('<svg><a href=javascript:alert(1) />stuff</svg>')
    expect(out.toLowerCase()).not.toContain('javascript:')
    expect(out).not.toContain('alert(1)')
  })

  it('neutralizes UNQUOTED javascript: xlink:href', () => {
    const out = sanitizeSvg('<svg><a xlink:href=javascript:alert(1) /></svg>')
    expect(out.toLowerCase()).not.toContain('javascript:')
  })

  // Vector 4: nested <script> with lazy match — must be idempotent.
  it('strips nested <script> tags (lazy-match leak)', () => {
    const out = sanitizeSvg('<svg><script>a<script>b</script>c</script><g/></svg>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('</script')
    expect(out).not.toContain('alert')
  })

  // Vector 5: CSS url(javascript:...) inside a style attribute.
  it('strips style attributes containing url(javascript:...)', () => {
    const out = sanitizeSvg('<svg><rect style="background:url(javascript:alert(1))"/></svg>')
    expect(out).not.toContain('javascript:')
    expect(out).not.toContain('alert')
  })

  // Vector 5b: CSS expression(...) sink.
  it('strips style attributes containing expression(...)', () => {
    const out = sanitizeSvg('<svg><rect style="width:expression(alert(1))"/></svg>')
    expect(out).not.toContain('expression(')
    expect(out).not.toContain('alert')
  })

  // Vector 6: bare <iframe>/<embed>/<object> outside <foreignObject>.
  it('strips bare <iframe> outside <foreignObject>', () => {
    const out = sanitizeSvg('<svg><iframe src="x"></iframe><g/></svg>')
    expect(out).not.toContain('iframe')
  })

  it('strips bare <embed> and <object> outside <foreignObject>', () => {
    const out = sanitizeSvg('<svg><embed src="x.swf"/><object data="x"></object><g/></svg>')
    expect(out).not.toContain('<embed')
    expect(out).not.toContain('<object')
  })

  // Vector: vbscript: scheme on href.
  it('neutralizes vbscript: href schemes', () => {
    const out = sanitizeSvg('<svg><a href="vbscript:msgbox(1)" /></svg>')
    expect(out.toLowerCase()).not.toContain('vbscript:')
  })

  // Vector: data:text/html href schemes.
  it('neutralizes data:text/html href schemes', () => {
    const out = sanitizeSvg('<svg><a href="data:text/html,<script>alert(1)</script>" /></svg>')
    expect(out.toLowerCase()).not.toContain('data:text/html')
  })
})
