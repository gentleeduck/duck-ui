import { flushSync } from 'react-dom'
import type { IDismissableLayer } from './dismissable-layer.types'

const POINTER_DOWN_OUTSIDE = 'dismissableLayer.pointerDownOutside'
const FOCUS_OUTSIDE = 'dismissableLayer.focusOutside'

// Third-party code that stops one of these after a pointer down outside cancels a deferred dismissal.
const OUTSIDE_INTERACTION_EVENTS = ['pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click']

// A browser holds a tap's click up to ~350ms after the lift to rule out a double tap.
const TAP_CLICK_WINDOW = 1000

export interface LayerOwner {
  props: IDismissableLayer.IOptions
  // A press stopped inside never reaches the document, so the press is kept rather than a flag it would leave set.
  pressInside: Event | null
  focusInside: boolean
}

interface LayerDocument {
  layers: number
  disabling: number
  // The index of the highest layer blocking this document, or -1.
  highest: number
  bodyPointerEvents: string
  focus: EventListener
  remove: () => void
}

export interface Layer {
  readonly node: HTMLElement
  readonly owner: LayerOwner
  readonly perDocument: LayerDocument
  readonly root: Node
  disables: boolean
  ownsPointerEvents: boolean
  // The element's `pointer-events` as the stack last wrote or found them, so a change reads no layer's style back. Null
  // while the consumer's style holds them.
  pointerEvents: string | null
  // Its own `pointer-events` from before the stack took them, put back once the layer leaves an element that stays.
  ownPointerEvents: string
  // -1 once it has left the stack.
  index: number
  // The press that opened it reaches the document after it mounts. A press stamped later is a new one; a tie on a
  // coarse clock waits until the task that mounted it is over.
  mountedAt: number
  armed: boolean
  pending: Press | null
  // The box whose scrollbar the press is on. A box that takes focus takes it from that press.
  scrollbarBox: HTMLElement | null
  deferred: boolean
  intercepted: Map<string, boolean>
}

interface Press {
  readonly event: PointerEvent
  readonly target: HTMLElement
}

export interface LayerStack {
  layers: Layer[]
  branches: Set<HTMLElement>
  surfaces: Set<HTMLElement>
  documents: Map<Document, LayerDocument>
  armTimer: number
}

export function createLayerStack(): LayerStack {
  return {
    layers: [],
    branches: new Set(),
    surfaces: new Set(),
    documents: new Map(),
    armTimer: 0,
  }
}

// One pass per change writes the pointer events that changed, where every layer used to rerender on every change.
function restack(stack: LayerStack) {
  for (const perDocument of stack.documents.values()) perDocument.highest = -1
  stack.layers.forEach((layer, index) => {
    layer.index = index
    if (layer.disables) layer.perDocument.highest = index
  })
  for (const layer of stack.layers) {
    const { highest } = layer.perDocument
    const value = !layer.ownsPointerEvents ? null : highest === -1 ? '' : layer.index >= highest ? 'auto' : 'none'
    if (value !== null && value !== layer.pointerEvents) layer.node.style.pointerEvents = value
    layer.pointerEvents = value
  }
}

function setDisables(layer: Layer, disables: boolean) {
  if (layer.disables === disables) return
  const { body } = layer.node.ownerDocument
  const { perDocument } = layer
  layer.disables = disables
  if (disables) {
    if (perDocument.disabling === 0) {
      perDocument.bodyPointerEvents = body.style.pointerEvents
      body.style.pointerEvents = 'none'
    }
    perDocument.disabling++
  } else if (--perDocument.disabling === 0) {
    body.style.pointerEvents = perDocument.bodyPointerEvents
  }
}

export function enterLayer(
  stack: LayerStack,
  node: HTMLElement,
  owner: LayerOwner,
  disables: boolean,
  ownsPointerEvents: boolean,
): Layer {
  const layer: Layer = {
    node,
    owner,
    perDocument: listenOn(stack, node.ownerDocument),
    root: node.getRootNode(),
    disables: false,
    ownsPointerEvents,
    pointerEvents: node.style.pointerEvents,
    ownPointerEvents: node.style.pointerEvents,
    index: -1,
    // Read off an event, since that is the clock events carry: jsdom stamps them with Date.now().
    mountedAt: new (node.ownerDocument.defaultView ?? window).Event('').timeStamp,
    armed: false,
    pending: null,
    scrollbarBox: null,
    deferred: false,
    intercepted: new Map(),
  }
  // Focus moving within a shadow root stops at its host, so the document never hears it.
  if (layer.root !== node.ownerDocument) layer.root.addEventListener('focusin', layer.perDocument.focus)
  setDisables(layer, disables)
  stack.layers.push(layer)
  stack.armTimer ||= window.setTimeout(() => {
    stack.armTimer = 0
    for (const each of stack.layers) each.armed = true
  }, 0)
  restack(stack)
  return layer
}

export function leaveLayer(stack: LayerStack, layer: Layer) {
  const { ownerDocument } = layer.node
  setDisables(layer, false)
  stack.layers.splice(layer.index, 1)
  layer.index = -1
  reset(layer)
  if (layer.pointerEvents !== null) layer.node.style.pointerEvents = layer.ownPointerEvents
  if (layer.root !== ownerDocument && !stack.layers.some((other) => other.root === layer.root)) {
    layer.root.removeEventListener('focusin', layer.perDocument.focus)
  }
  if (--layer.perDocument.layers === 0) {
    layer.perDocument.remove()
    stack.documents.delete(ownerDocument)
  }
  // A timer whose window has gone never fires, and would leave every later layer unarmed.
  if (!stack.layers.length) {
    window.clearTimeout(stack.armTimer)
    stack.armTimer = 0
  }
  restack(stack)
}

export function updateLayer(
  stack: LayerStack,
  layer: Layer,
  disables: boolean,
  ownsPointerEvents: boolean,
  consumerPointerEvents: string | undefined,
) {
  if (layer.disables === disables && layer.ownsPointerEvents === ownsPointerEvents) return
  setDisables(layer, disables)
  if (ownsPointerEvents && !layer.ownsPointerEvents) layer.ownPointerEvents = layer.node.style.pointerEvents
  // React writes nothing for a style set to undefined that it never set, which would leave the stack's value.
  if (!ownsPointerEvents && layer.pointerEvents !== null) layer.node.style.pointerEvents = consumerPointerEvents ?? ''
  layer.ownsPointerEvents = ownsPointerEvents
  restack(stack)
}

// A listener on the document hears the shadow host as the target of an event inside a shadow root, and nothing once
// the event is over.
const targetOf = (event: Event) => event.composedPath()[0] as HTMLElement

// The path crosses into the shadow roots inside a branch, where `contains` stops at their hosts.
const isInBranch = (stack: LayerStack, event: Event) => {
  const path = event.composedPath()
  return [...stack.branches].some((branch) => path.includes(branch))
}

// WebKit takes a press within 17px of the edge on a scrollbar drawn over its box, measured.
const OVERLAY_SCROLLBAR = 17

const pixels = (...lengths: string[]) => lengths.reduce((sum, length) => sum + Number.parseFloat(length), 0)

// A press on a scrollbar scrolls its box rather than pressing the page, and a touch has no scrollbar to press. One
// beside the content is found by where the press lands. One macOS draws over the content's edge takes no room, so a
// press at that edge is `over` the scrollbar or the content, and only a press on the content is followed by a click.
function scrollbarPress(event: PointerEvent, target: HTMLElement): 'beside' | 'over' | undefined {
  if (event.pointerType === 'touch') return
  const { clientWidth, clientHeight, offsetWidth, offsetHeight, ownerDocument } = target
  const root = ownerDocument.documentElement
  const style = getComputedStyle(target)
  const rtl = style.direction === 'rtl'
  // The root element scrolls the page whatever its overflow says.
  const scrolls = (overflow: string) => target === root || /auto|scroll/.test(overflow)
  const down = scrolls(style.overflowY) && target.scrollHeight > clientHeight
  const across = scrolls(style.overflowX) && target.scrollWidth > clientWidth
  const onVertical = rtl ? event.offsetX <= offsetWidth - clientWidth : event.offsetX > clientWidth
  if ((down && onVertical) || (across && event.offsetY > clientHeight)) return 'beside'

  const overVertical =
    down &&
    offsetWidth - clientWidth - pixels(style.borderLeftWidth, style.borderRightWidth) < 1 &&
    (rtl ? event.offsetX < OVERLAY_SCROLLBAR : event.offsetX >= clientWidth - OVERLAY_SCROLLBAR)
  const overHorizontal =
    across &&
    offsetHeight - clientHeight - pixels(style.borderTopWidth, style.borderBottomWidth) < 1 &&
    event.offsetY >= clientHeight - OVERLAY_SCROLLBAR
  if (overVertical || overHorizontal) return 'over'

  // The page's own scrollbar lies over whatever is under the press, so the press has that as its target.
  const view = ownerDocument.defaultView ?? window
  const overPageVertical =
    root.scrollHeight > root.clientHeight &&
    view.innerWidth - root.clientWidth < 1 &&
    (getComputedStyle(root).direction === 'rtl'
      ? event.clientX < OVERLAY_SCROLLBAR
      : event.clientX >= root.clientWidth - OVERLAY_SCROLLBAR)
  const overPageHorizontal =
    root.scrollWidth > root.clientWidth &&
    view.innerHeight - root.clientHeight < 1 &&
    event.clientY >= root.clientHeight - OVERLAY_SCROLLBAR
  if (overPageVertical || overPageHorizontal) return 'over'
}

function reset(layer: Layer) {
  layer.pending = null
  layer.deferred = false
  layer.intercepted.clear()
}

function dismissOutside<E extends IDismissableLayer.PointerDownOutsideEvent | IDismissableLayer.FocusOutsideEvent>(
  layer: Layer,
  event: E,
  onOutside: ((event: E) => void) | undefined,
) {
  onOutside?.(event)
  layer.owner.props.onInteractOutside?.(event)
  if (!event.defaultPrevented) layer.owner.props.onDismiss?.()
}

function settle(layer: Layer, press: Press) {
  const wasIntercepted = [...layer.intercepted.values()].some(Boolean)
  reset(layer)
  // A modal layer opened over it since the press, such as a menu its trigger opens on pointer down.
  if (wasIntercepted || layer.index < layer.perDocument.highest) return
  handleAndDispatchCustomEvent(
    POINTER_DOWN_OUTSIDE,
    (event: IDismissableLayer.PointerDownOutsideEvent) =>
      dismissOutside(layer, event, layer.owner.props.onPointerDownOutside),
    press.target,
    { originalEvent: press.event },
    { discrete: true },
  )
}

// A programmatic click can fire inside a React commit, where flushSync is not allowed. A trusted one runs its
// microtasks as soon as the listener returns, so it loses nothing by waiting too.
const settleAfterClick = (layer: Layer, press: Press) =>
  queueMicrotask(() => layer.pending === press && settle(layer, press))

function pressOutside(stack: LayerStack, layer: Layer, event: PointerEvent) {
  const target = targetOf(event)
  const ignored =
    layer.owner.pressInside === event || layer.index < layer.perDocument.highest || isInBranch(stack, event)
  // A press dispatched on the document itself has no box to measure.
  const onScrollbar = ignored || target.nodeType !== Node.ELEMENT_NODE ? undefined : scrollbarPress(event, target)
  layer.scrollbarBox = onScrollbar === 'beside' ? target : null
  if (ignored || layer.scrollbarBox) {
    reset(layer)
    return
  }
  layer.pending = { event, target }
  layer.intercepted.clear()
  // A touch waits for its click anyway: dismissing ~350ms early lets that click land on what the layer uncovered.
  // A control click is a right click on macOS, which sends no click to wait for.
  layer.deferred =
    (event.button === 0 &&
      !event.ctrlKey &&
      (Boolean(layer.owner.props.deferPointerDownOutside) || onScrollbar === 'over')) ||
    event.pointerType === 'touch'
  if (!layer.deferred) settle(layer, layer.pending)
}

function focusOutside(stack: LayerStack, layer: Layer, event: IDismissableLayer.FocusOutsideEvent) {
  // The deferred pointer down decides, once its click lands.
  if (layer.deferred) return
  if (event.target === layer.scrollbarBox || isInBranch(stack, event.detail.originalEvent)) return
  dismissOutside(layer, event, layer.owner.props.onFocusOutside)
}

// A layer that leaves while an event is handed round misses the rest of it, as a removed listener would.
function eachLayerIn(stack: LayerStack, ownerDocument: Document, callback: (layer: Layer) => void) {
  for (const layer of stack.layers.slice()) {
    if (layer.index !== -1 && layer.node.ownerDocument === ownerDocument) callback(layer)
  }
}

// The layers in a document share its listeners, where each layer used to add fifteen of its own.
function listenOn(stack: LayerStack, ownerDocument: Document): LayerDocument {
  const existing = stack.documents.get(ownerDocument)
  if (existing) {
    existing.layers++
    return existing
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // An Escape during an IME composition cancels the composition, so it belongs to the input method.
    if (event.key !== 'Escape' || event.isComposing || event.keyCode === 229) return
    const highest = stack.layers[stack.layers.length - 1] as Layer
    if (highest.node.ownerDocument !== ownerDocument) return
    const { onEscapeKeyDown, onDismiss } = highest.owner.props
    onEscapeKeyDown?.(event)
    if (!event.defaultPrevented && onDismiss) {
      event.preventDefault()
      onDismiss()
    }
  }
  const handlePointerDown = (event: PointerEvent) =>
    eachLayerIn(
      stack,
      ownerDocument,
      (layer) => (layer.armed || event.timeStamp > layer.mountedAt) && pressOutside(stack, layer, event),
    )
  let heard: Event | undefined
  const handleFocus = (event: FocusEvent) => {
    // Focus moving into a shadow root reaches both it and the document.
    if (event === heard) return
    heard = event
    const target = targetOf(event)
    eachLayerIn(stack, ownerDocument, (layer) => {
      if (layer.owner.focusInside) return
      handleAndDispatchCustomEvent(
        FOCUS_OUTSIDE,
        (outside: IDismissableLayer.FocusOutsideEvent) => focusOutside(stack, layer, outside),
        target,
        { originalEvent: event },
        { discrete: false },
      )
    })
  }
  const handleCapture = (event: Event) => {
    const path = event.composedPath()
    eachLayerIn(stack, ownerDocument, (layer) => {
      // A box takes the focus its scrollbar's press gives it before the pointer lifts.
      if (event.type === 'pointerup') layer.scrollbarBox = null
      const press = layer.pending
      if (!press) return
      // A dismiss surface, such as a dialog's overlay, still dismisses when it stops its own events.
      layer.intercepted.set(event.type, ![...stack.surfaces].some((surface) => path.includes(surface)))
      // A stopped click never reaches the document, so it is settled from here.
      if (event.type === 'click') window.setTimeout(() => layer.pending === press && settleAfterClick(layer, press), 0)
      // A mouse's click lands before a timer set at its pointerup, so a press still waiting then never gets one.
      if (event.type === 'pointerup') {
        window.setTimeout(
          () => layer.pending === press && !layer.intercepted.has('click') && reset(layer),
          press.event.pointerType === 'mouse' ? 0 : TAP_CLICK_WINDOW,
        )
      }
    })
  }
  // A touch that turns into a scroll, or a press that starts a drag, sends no click.
  const handleCancel = () => eachLayerIn(stack, ownerDocument, reset)
  const handleBubble = (event: Event) =>
    eachLayerIn(stack, ownerDocument, (layer) => {
      layer.intercepted.set(event.type, false)
      if (event.type === 'click' && layer.pending) settleAfterClick(layer, layer.pending)
    })

  ownerDocument.addEventListener('keydown', handleKeyDown, true)
  ownerDocument.addEventListener('pointerdown', handlePointerDown)
  ownerDocument.addEventListener('focusin', handleFocus)
  ownerDocument.addEventListener('pointercancel', handleCancel, true)
  for (const name of OUTSIDE_INTERACTION_EVENTS) {
    ownerDocument.addEventListener(name, handleCapture, true)
    ownerDocument.addEventListener(name, handleBubble)
  }
  const perDocument = {
    layers: 1,
    disabling: 0,
    highest: -1,
    bodyPointerEvents: '',
    focus: handleFocus as EventListener,
    remove: () => {
      ownerDocument.removeEventListener('keydown', handleKeyDown, true)
      ownerDocument.removeEventListener('pointerdown', handlePointerDown)
      ownerDocument.removeEventListener('focusin', handleFocus)
      ownerDocument.removeEventListener('pointercancel', handleCancel, true)
      for (const name of OUTSIDE_INTERACTION_EVENTS) {
        ownerDocument.removeEventListener(name, handleCapture, true)
        ownerDocument.removeEventListener(name, handleBubble)
      }
    },
  }
  stack.documents.set(ownerDocument, perDocument)
  return perDocument
}

function handleAndDispatchCustomEvent<E extends CustomEvent, OriginalEvent extends Event>(
  name: string,
  handler: (event: E) => void,
  target: EventTarget,
  detail: { originalEvent: OriginalEvent } & (E extends CustomEvent<infer D> ? D : never),
  { discrete }: { discrete: boolean },
) {
  const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail })
  target.addEventListener(name, handler as EventListener, { once: true })

  if (discrete) {
    flushSync(() => target.dispatchEvent(event))
  } else {
    target.dispatchEvent(event)
  }
}
