import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost',
})

Object.assign(globalThis, {
  // motion's gestures take a target only if it is an EventTarget and listen with an AbortSignal. Bun's own are not
  // jsdom's, so without these no press would ever start.
  AbortController: dom.window.AbortController,
  AbortSignal: dom.window.AbortSignal,
  EventTarget: dom.window.EventTarget,
  cancelAnimationFrame: dom.window.cancelAnimationFrame,
  CustomEvent: dom.window.CustomEvent,
  document: dom.window.document,
  DocumentFragment: dom.window.DocumentFragment,
  DOMRect: dom.window.DOMRect,
  Element: dom.window.Element,
  Event: dom.window.Event,
  getComputedStyle: dom.window.getComputedStyle,
  HTMLButtonElement: dom.window.HTMLButtonElement,
  HTMLElement: dom.window.HTMLElement,
  HTMLFormElement: dom.window.HTMLFormElement,
  HTMLInputElement: dom.window.HTMLInputElement,
  IS_REACT_ACT_ENVIRONMENT: true,
  KeyboardEvent: dom.window.KeyboardEvent,
  MouseEvent: dom.window.MouseEvent,
  MutationObserver: dom.window.MutationObserver,
  navigator: dom.window.navigator,
  Node: dom.window.Node,
  NodeFilter: dom.window.NodeFilter,
  requestAnimationFrame: dom.window.requestAnimationFrame,
  SVGElement: dom.window.SVGElement,
  Text: dom.window.Text,
  window: dom.window,
})
