// Runs Radix UI's primitive tests (MIT, see ./LICENSE) with what their own vitest setup gave them.

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import axeCore from 'axe-core'
import * as React from 'react'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'

declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: an augmentation must repeat vitest's own `T = any`, or TS2428.
  interface Matchers<T = any> {
    toHaveNoViolations(): T
  }
}

expect.extend({
  toHaveNoViolations(results: axeCore.AxeResults) {
    const found = results.violations
      .map(
        (violation) =>
          `${violation.id}: ${violation.help}\n${violation.nodes.map((node) => `  ${node.html}`).join('\n')}`,
      )
      .join('\n\n')
    return { message: () => found || 'expected axe violations, found none', pass: found === '' }
  },
})

if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}

export async function axe(container: Element, options: axeCore.RunOptions = {}) {
  return axeCore.run(container, options)
}

// Radix's setup reports a zero size on observe, where the shared setup's observer never calls back.
class ResizeObserverMock {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {
    this.callback([{ borderBoxSize: { blockSize: 0, inlineSize: 0 } } as never], this as never)
  }
  unobserve() {}
  disconnect() {}
}

export function radixEnvironment() {
  const original = globalThis.ResizeObserver
  beforeAll(() => {
    globalThis.ResizeObserver = ResizeObserverMock as never
  })
  afterEach(cleanup)
  afterAll(() => {
    globalThis.ResizeObserver = original
  })
}

const DEFAULT_MAX_RENDERS = 25

// Radix's internal/test-utils/ref-stability: a composed ref rebuilt every render loops under React 19.
export function assertStableComposedRef(
  renderWithRef: (ref: React.RefCallback<unknown>) => React.ReactElement,
  { maxRenders = DEFAULT_MAX_RENDERS }: { maxRenders?: number } = {},
) {
  let renderCount = 0

  function Probe() {
    renderCount++
    const [, forceRender] = React.useReducer(() => Object.create(null), null)
    const ref = React.useCallback((node: unknown) => {
      if (node) forceRender()
    }, [])
    return renderWithRef(ref)
  }

  expect(() => render(<Probe />)).not.toThrow()
  expect(renderCount).toBeLessThan(maxRenders)
}
