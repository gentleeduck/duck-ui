// Runs Radix UI's primitive tests (MIT, see ./LICENSE) under bun:test. Gives them what their vitest setup gave.

import { afterAll, afterEach, beforeAll, vi as bunVi, expect } from 'bun:test'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup, render } from '@testing-library/react'
import axeCore from 'axe-core'
import * as React from 'react'

declare module 'bun:test' {
  interface Matchers<T> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {
    toHaveNoViolations(): void
    toHaveBeenCalledExactlyOnceWith(...args: unknown[]): void
  }
}

// jest-dom calls `this.utils` helpers unbound, which bun refuses, and bun prints a node by walking all of jsdom.
function short(value: unknown): string {
  if (value instanceof Node) {
    const html = value instanceof Element ? value.outerHTML : (value.textContent ?? value.nodeName)
    return html.length > 400 ? `${html.slice(0, 400)}...` : html
  }
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

// Left alone, bun prints a node by walking jsdom and React's fiber links on it: one failing toThrow took 15s.
Object.defineProperty(Node.prototype, Bun.inspect.custom, {
  configurable: true,
  value(this: Node) {
    return short(this)
  },
})

function readableUtils(utils: Record<string, unknown>) {
  const bound: Record<string, unknown> = { EXPECTED_COLOR: String, RECEIVED_COLOR: String, diff: () => '' }
  for (let level = utils; level && level !== Object.prototype; level = Object.getPrototypeOf(level)) {
    for (const key of Object.getOwnPropertyNames(level)) {
      const value = utils[key]
      if (key !== 'constructor') bound[key] = typeof value === 'function' ? value.bind(utils) : value
    }
  }
  return { ...bound, printExpected: short, printReceived: short, stringify: short }
}

expect.extend(
  Object.fromEntries(
    Object.entries(matchers).map(([name, matcher]) => [
      name,
      function (this: { utils: Record<string, unknown> }, ...args: unknown[]) {
        const utils = readableUtils(this.utils)
        // bun's context getters and methods check their receiver, so everything but `utils` reads through to it.
        const context = new Proxy(this, {
          get(target, key) {
            if (key === 'utils') return utils
            const value = Reflect.get(target, key, target)
            return typeof value === 'function' ? value.bind(target) : value
          },
        })
        return (matcher as (...rest: unknown[]) => unknown).apply(context, args)
      },
    ]),
  ) as never,
)

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
  toHaveBeenCalledExactlyOnceWith(
    this: { equals(a: unknown, b: unknown): boolean },
    received: { mock: { calls: unknown[][] } },
    ...expected: unknown[]
  ) {
    const calls = received.mock.calls
    const show = (args: unknown[]) => `(${args.map((arg) => Bun.inspect(arg, { depth: 2 }).slice(0, 600)).join(', ')})`
    return {
      message: () => `expected one call with ${show(expected)}, got ${calls.map(show).join(' ') || 'none'}`,
      pass: calls.length === 1 && this.equals(calls[0], expected),
    }
  },
})

if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}

// vitest's jsdom environment takes every global from the window. The shared preload copies a list, which misses
// PointerEvent and FocusEvent among others, and keeps bun's own EventTarget, whose dispatchEvent refuses jsdom's Event,
// and FormData, which reads nothing from a jsdom form.
for (const key of Object.getOwnPropertyNames(window)) {
  if (key in globalThis) continue
  Object.defineProperty(globalThis, key, {
    configurable: true,
    get: () => Reflect.get(window, key),
    set: (value) => Reflect.set(window, key, value),
  })
}
Object.assign(globalThis, { EventTarget: window.EventTarget, FormData: window.FormData })

export async function axe(container: Element) {
  return axeCore.run(container)
}

// bun's vi lacks the global and env stubs and cannot spy on an accessor. vitest's `window` is `globalThis`, so a
// global stub goes on this `window` too, except where jsdom makes the property unforgeable, as `document`.
const stubbed = new Map<string, [PropertyDescriptor | undefined, PropertyDescriptor | undefined]>()
const envs = new Map<string, string | undefined>()
const accessorRestores = new Set<() => void>()

function spyOnAccessor(target: object, key: PropertyKey, access: 'get' | 'set') {
  let owner: object | null = target
  let found: PropertyDescriptor | undefined
  while (owner && !found) {
    found = Object.getOwnPropertyDescriptor(owner, key)
    if (!found) owner = Object.getPrototypeOf(owner)
  }
  const descriptor = found
  const original = descriptor?.[access]
  if (!descriptor || !original) throw new TypeError(`${String(key)} has no ${access}ter to spy on`)
  const spy = bunVi.fn(function (this: unknown, ...args: unknown[]) {
    return original.apply(this, args)
  })
  // A shadow over an inherited accessor has to stay deletable, or restoring it leaves the spy in place.
  Object.defineProperty(target, key, { ...descriptor, configurable: true, [access]: spy })
  const restore = () => {
    accessorRestores.delete(restore)
    if (owner === target) Object.defineProperty(target, key, descriptor)
    else Reflect.deleteProperty(target, key)
  }
  accessorRestores.add(restore)
  // bun's mockRestore is read-only on the prototype, so only defineProperty can shadow it.
  return Object.defineProperty(spy, 'mockRestore', { value: restore })
}

export const vi = {
  ...bunVi,
  spyOn(target: object, key: PropertyKey, access?: 'get' | 'set') {
    return access ? spyOnAccessor(target, key, access) : bunVi.spyOn(target as never, key as never)
  },
  restoreAllMocks() {
    // A second spy on the same key saved the first as its original, so they unwind newest first.
    for (const restore of [...accessorRestores].reverse()) restore()
    bunVi.restoreAllMocks()
  },
  stubEnv(name: string, value: string) {
    if (!envs.has(name)) envs.set(name, process.env[name])
    process.env[name] = value
  },
  unstubAllEnvs() {
    for (const [name, value] of envs) {
      if (value === undefined) Reflect.deleteProperty(process.env, name)
      else process.env[name] = value
    }
    envs.clear()
  },
  stubGlobal(name: string, value: unknown) {
    if (!stubbed.has(name)) {
      stubbed.set(name, [
        Object.getOwnPropertyDescriptor(globalThis, name),
        Object.getOwnPropertyDescriptor(window, name),
      ])
    }
    Object.defineProperty(globalThis, name, { configurable: true, value, writable: true })
    if (stubbed.get(name)?.[1]?.configurable !== false) {
      Object.defineProperty(window, name, { configurable: true, value, writable: true })
    }
  },
  unstubAllGlobals() {
    for (const [name, [global, win]] of stubbed) {
      if (global) Object.defineProperty(globalThis, name, global)
      else Reflect.deleteProperty(globalThis, name)
      if (win?.configurable === false) continue
      if (win) Object.defineProperty(window, name, win)
      else Reflect.deleteProperty(window, name)
    }
    stubbed.clear()
  },
}

// Radix's setup reports a zero size on observe, where the shared preload's observer never calls back.
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

// Files without this harness leave roots mounted, some after wiping the DOM under them, so unmounting one throws.
// React drops a root before unmounting it, so each retry gets past the root that threw.
function cleanupLeftovers() {
  for (let attempt = 0; attempt < 1000; attempt++) {
    try {
      cleanup()
      return
    } catch {}
  }
}

// bun shares one module cache across files, so testing-library's own afterEach is registered for the first file only.
export function radixEnvironment() {
  const original = globalThis.ResizeObserver
  beforeAll(() => {
    cleanupLeftovers()
    globalThis.ResizeObserver = ResizeObserverMock as never
  })
  afterEach(() => {
    cleanup()
  })
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
