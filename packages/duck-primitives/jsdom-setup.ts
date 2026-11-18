import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
})

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  HTMLDivElement: dom.window.HTMLDivElement,
  HTMLButtonElement: dom.window.HTMLButtonElement,
  HTMLSpanElement: dom.window.HTMLSpanElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  Event: dom.window.Event,
  MouseEvent: dom.window.MouseEvent,
  KeyboardEvent: dom.window.KeyboardEvent,
  CustomEvent: dom.window.CustomEvent,
  MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: dom.window.requestAnimationFrame,
  cancelAnimationFrame: dom.window.cancelAnimationFrame,
  DocumentFragment: dom.window.DocumentFragment,
  ShadowRoot: dom.window.ShadowRoot,
  Text: dom.window.Text,
  HTMLCollection: dom.window.HTMLCollection,
  NodeList: dom.window.NodeList,
  NodeFilter: dom.window.NodeFilter,
  HTMLInputElement: dom.window.HTMLInputElement,
  HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
  HTMLSelectElement: dom.window.HTMLSelectElement,
  HTMLAnchorElement: dom.window.HTMLAnchorElement,
  HTMLFormElement: dom.window.HTMLFormElement,
  SVGElement: dom.window.SVGElement,
  Range: dom.window.Range,
  DOMRect: dom.window.DOMRect,
  // jsdom has no CSS namespace. This is CSSOM's serialization of an identifier.
  CSS: {
    escape: (value: string) =>
      Array.from(value, (char, index) => {
        const code = char.codePointAt(0) ?? 0
        if (code === 0) return '\uFFFD'
        const leadingDigit = /[0-9]/.test(char) && (index === 0 || (index === 1 && value[0] === '-'))
        if (code < 32 || code === 127 || leadingDigit) return `\\${code.toString(16)} `
        if (char === '-' && value.length === 1) return '\\-'
        return code >= 128 || /[\w-]/.test(char) ? char : `\\${char}`
      }).join(''),
  },
  ResizeObserver:
    dom.window.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  IntersectionObserver:
    dom.window.IntersectionObserver ??
    class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
})
