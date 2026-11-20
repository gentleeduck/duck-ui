type FocusableElement = Element & HTMLOrSVGElement

/** The element focus is on, inside any open shadow root it is in. */
function activeElement(document: Document) {
  let element = document.activeElement
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement
  return element as FocusableElement | null
}

/** `contains` across shadow roots, since a scope's own `contains` stops at each one. */
function contains(ancestor: Node, target: EventTarget | null) {
  let node = target as Node | null
  while (node && node !== ancestor) node = node.parentNode ?? (node as Partial<ShadowRoot>).host ?? null
  return !!node
}

/** Focus first candidate that actually accepts focus. */
function focusFirst(candidates: FocusableElement[]) {
  for (const candidate of candidates) {
    const previouslyFocusedElement = activeElement(candidate.ownerDocument)
    focus(candidate)
    if (activeElement(candidate.ownerDocument) !== previouslyFocusedElement) return
  }
}

const isRadio = (element?: Element): element is HTMLInputElement =>
  element?.tagName === 'INPUT' && (element as HTMLInputElement).type === 'radio'

/** Tab leaves a group of native radios from any radio in it, so the group is one stop. */
function isSameStop(element: Element, other: Element | undefined) {
  return (
    element === other ||
    (isRadio(element) &&
      isRadio(other) &&
      !!element.name &&
      element.name === other.name &&
      element.form === other.form &&
      element.getRootNode() === other.getRootNode())
  )
}

/** First and last visible tab stops inside a container. */
function getTabStops(container: HTMLElement) {
  const candidates = getTabbableCandidates(container)
  // Tab into a radio group lands on its checked radio, so the group's other radios are no stop of their own.
  return candidates.filter(
    (candidate) =>
      !isRadio(candidate) ||
      candidate.checked ||
      !candidates.some((other) => isRadio(other) && other.checked && isSameStop(candidate, other)),
  )
}

function getTabbableEdges(container: HTMLElement) {
  const stops = getTabStops(container)
  return [findVisible(stops, container), findVisible([...stops].reverse(), container)] as const
}

/** The visible stop a Tab from `from` reaches inside the container, or a Shift+Tab, read in the container's order. */
function getNextStop(container: HTMLElement, from: Element, backwards: boolean) {
  const stops = getTabStops(container)
  const at = stops.findIndex((stop) => isSameStop(from, stop))
  // From the container itself, which is no stop, a Tab reaches the first stop and a Shift+Tab none, so focus stays.
  const ahead = backwards ? stops.slice(0, Math.max(at, 0)).reverse() : stops.slice(at + 1)
  return findVisible(ahead, container)
}

/**
 * Tabbable candidates in the order Tab reaches them, into open shadow roots and through their slots. Approximation:
 * does not account for computed visibility (use findVisible/isHidden for that). Relies on `.tabIndex` for runtime
 * tabbability.
 */
function getTabbableCandidates(container: HTMLElement) {
  const nodes: FocusableElement[] = []
  const collect = (parent: Element) => {
    const children =
      parent.shadowRoot?.children ??
      (parent.localName === 'slot' ? (parent as HTMLSlotElement).assignedElements({ flatten: true }) : parent.children)
    // An svg takes focus as an html element does, and an iframe's elements fail `instanceof` this realm's classes.
    for (const node of children as Iterable<FocusableElement>) {
      // Nothing inside a hidden or inert element takes focus.
      if (node.hasAttribute('hidden') || node.hasAttribute('inert')) continue
      // `:disabled` also matches a control in a disabled fieldset, where its own `disabled` stays false.
      if (node.tabIndex >= 0 && !node.matches(':disabled')) nodes.push(node)
      collect(node)
    }
  }
  collect(container)
  return nodes
}

// `checkVisibilityCSS` is the name browsers shipped first; each reads the one it knows.
const VISIBILITY_OPTIONS = { checkVisibilityCSS: true, visibilityProperty: true }

/** First visible element; visibility checked up to (excluding) the container. */
function findVisible(elements: FocusableElement[], container: HTMLElement) {
  // One native check per element instead of a computed style per ancestor.
  const native = typeof container.checkVisibility === 'function' && container.checkVisibility(VISIBILITY_OPTIONS)
  for (const element of elements) {
    const hidden = native ? !element.checkVisibility(VISIBILITY_OPTIONS) : isHidden(element, container)
    if (!hidden) return element
  }
}

// The parent an element is drawn in: the slot it is assigned to, or the host of the shadow root it tops.
const renderedParent = (node: Element) =>
  node.assignedSlot ?? node.parentElement ?? (node.parentNode as ShadowRoot).host

function isHidden(element: FocusableElement, container: HTMLElement) {
  if (getComputedStyle(element).visibility === 'hidden') return true
  for (let node: Element = element; node !== container; node = renderedParent(node)) {
    if (getComputedStyle(node).display === 'none') return true
  }
  return false
}

/** Focus without scrolling, selecting the text of an input that focus moves to. */
function focus(element: FocusableElement | null | undefined) {
  if (!element) return
  // The element's own document: the global one may be another realm's, or gone by the unmount timer.
  const previouslyFocusedElement = activeElement(element.ownerDocument)
  element.focus({ preventScroll: true })
  if (element !== previouslyFocusedElement && element.tagName === 'INPUT') (element as HTMLInputElement).select()
}

/** Strip anchors, an svg's among them; prevents auto-focusing links on mount. */
function removeLinks(items: FocusableElement[]) {
  return items.filter((item) => item.localName !== 'a')
}

type FocusScopeAPI = { paused: boolean; pause(): void; resume(): void }

let stack: FocusScopeAPI[] = []

const focusScopesStack = {
  add(focusScope: FocusScopeAPI) {
    stack[0]?.pause()
    stack = [focusScope, ...stack]
  },

  remove(focusScope: FocusScopeAPI) {
    stack = stack.filter((scope) => scope !== focusScope)
    stack[0]?.resume()
  },
}

export type { FocusableElement, FocusScopeAPI }
export {
  activeElement,
  contains,
  focus,
  focusFirst,
  focusScopesStack,
  getNextStop,
  getTabbableCandidates,
  getTabbableEdges,
  isSameStop,
  removeLinks,
}
