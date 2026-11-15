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
  CustomEvent: dom.window.CustomEvent,
  document: dom.window.document,
  Element: dom.window.Element,
  Event: dom.window.Event,
  HTMLElement: dom.window.HTMLElement,
  HTMLDivElement: dom.window.HTMLDivElement,
  HTMLButtonElement: dom.window.HTMLButtonElement,
  HTMLSpanElement: dom.window.HTMLSpanElement,
  navigator: dom.window.navigator,
  Node: dom.window.Node,
  requestAnimationFrame: dom.window.requestAnimationFrame,
  cancelAnimationFrame: dom.window.cancelAnimationFrame,
  window: dom.window,
})
