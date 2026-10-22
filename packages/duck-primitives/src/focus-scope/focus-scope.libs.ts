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
    (isRadio(element) && isRadio(other) && !!element.name && element.name === other.name && element.form === other.form)
  )
}

/** First and last visible tab stops inside a container. Tab into a radio group lands on its checked radio. */
function getTabbableEdges(container: HTMLElement) {
  const candidates = getTabbableCandidates(container)
  const toStop = (edge?: FocusableElement) =>
    candidates.find((candidate) => (candidate as HTMLInputElement).checked && isSameStop(candidate, edge)) ?? edge
  const first = toStop(findVisible(candidates, container))
  const last = toStop(findVisible([...candidates].reverse(), container))
  return [first, last] as const
}

/**
 * Tabbable candidates via TreeWalker. Approximation: does not account for computed
 * visibility (use findVisible/isHidden for that). Relies on `.tabIndex` for runtime tabbability.
 */
function getTabbableCandidates(container: HTMLElement) {
  const nodes: FocusableElement[] = []
  const walker = container.ownerDocument.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    // An svg takes focus as an html element does, and an iframe's elements fail `instanceof` this realm's classes.
    acceptNode: (node: FocusableElement) => {
      // Nothing inside a hidden or inert element takes focus.
      if (node.hasAttribute('hidden') || node.hasAttribute('inert')) return NodeFilter.FILTER_REJECT
      // `:disabled` also matches a control in a disabled fieldset, where its own `disabled` stays false.
      return node.tabIndex >= 0 && !node.matches(':disabled') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    },
  })
  while (walker.nextNode()) nodes.push(walker.currentNode as FocusableElement)
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

function isHidden(element: FocusableElement, container: HTMLElement) {
  if (getComputedStyle(element).visibility === 'hidden') return true
  for (let node: Element = element; node !== container; node = node.parentElement as Element) {
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

/** Strip anchors; prevents auto-focusing links on mount. */
function removeLinks(items: FocusableElement[]) {
  return items.filter((item) => item.tagName !== 'A')
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
  getTabbableCandidates,
  getTabbableEdges,
  isSameStop,
  removeLinks,
}
