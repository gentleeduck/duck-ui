import * as React from 'react'
import { activeElement, type FocusableElement, getTabbableCandidates } from '../focus-scope/focus-scope.libs'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import type { Scope } from '../libs/create-context'
import { byDocumentPosition } from '../libs/shared-utils'
import { useNavigationMenuContext } from './navigation-menu'
import type { INavigationMenu } from './navigation-menu.types'

const ROOT_CONTENT_DISMISS = 'navigationMenu.rootContentDismiss'
const LINK_SELECT = 'navigationMenu.linkSelect'
const ARROW_KEYS = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']

function getOpenState(open: boolean) {
  return open ? 'open' : 'closed'
}

function makeTriggerId(baseId: string, value: string) {
  return `${baseId}-trigger-${value}`
}

function makeContentId(baseId: string, value: string) {
  return `${baseId}-content-${value}`
}

function whenMouse<E>(handler: React.PointerEventHandler<E>): React.PointerEventHandler<E> {
  return (event) => (event.pointerType === 'mouse' ? handler(event) : undefined)
}

// A link inside a shadow root leaves its host as the document's active element, so focus is read through the root.
function focusFirst(candidates: FocusableElement[]) {
  const previouslyFocusedElement = activeElement(document)
  return candidates.some((candidate) => {
    if (candidate === previouslyFocusedElement) return true
    candidate.focus()
    return activeElement(document) !== previouslyFocusedElement
  })
}

function removeFromTabOrder(candidates: FocusableElement[]) {
  const tabIndexes = candidates.map((candidate) => candidate.getAttribute('tabindex'))
  for (const candidate of candidates) candidate.setAttribute('tabindex', '-1')
  return () => {
    candidates.forEach((candidate, index) => {
      const tabIndex = tabIndexes[index]
      if (tabIndex === null) candidate.removeAttribute('tabindex')
      else candidate.setAttribute('tabindex', tabIndex)
    })
  }
}

function useResizeObserver(element: HTMLElement | null, onResize: (element: HTMLElement) => void) {
  const handleResize = useCallbackRef(onResize)
  useLayoutEffect(() => {
    if (!element) return
    let rAF = 0
    let reported = false
    // The first report arrives before the first paint, so it is acted on at once and nothing is painted unmeasured.
    // Later ones are coalesced into a frame to dodge "ResizeObserver loop completed with undelivered
    // notifications". https://github.com/WICG/resize-observer/issues/38
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(rAF)
      if (reported) rAF = window.requestAnimationFrame(() => handleResize(element))
      else {
        reported = true
        handleResize(element)
      }
    })
    resizeObserver.observe(element)
    return () => {
      window.cancelAnimationFrame(rAF)
      resizeObserver.unobserve(element)
    }
  }, [element, handleResize])
}

const FOCUS_GROUP_ITEM_NAME = 'FocusGroupItem'

type FocusGroup = Set<React.RefObject<HTMLElement | null>>

// The list of triggers, or one content's links: what the arrow keys move between.
const FocusGroupContext = React.createContext<FocusGroup | null>(null)

function useFocusGroup(): FocusGroup {
  return React.useState<FocusGroup>(() => new Set())[0]
}

/** An element the arrow keys, Home and End move focus to and from, in document order within its group. */
function useFocusGroupItem<E extends HTMLElement>(
  scope: Scope,
  onKeyDown: React.KeyboardEventHandler<E> | undefined,
  forwardedRef: React.Ref<E> | undefined,
): { ref: React.RefCallback<E>; onKeyDown: React.KeyboardEventHandler<E> } {
  const group = React.useContext(FocusGroupContext)
  const context = useNavigationMenuContext(FOCUS_GROUP_ITEM_NAME, scope)
  const ref = React.useRef<E>(null)

  useLayoutEffect(() => {
    if (!group) return
    group.add(ref)
    return () => void group.delete(ref)
  }, [group])

  return {
    ref: useComposedRefs(forwardedRef, ref),
    onKeyDown: composeEventHandlers(onKeyDown, (event: React.KeyboardEvent<E>) => {
      if (!['Home', 'End', ...ARROW_KEYS].includes(event.key)) return
      let candidateNodes: HTMLElement[] = []
      for (const item of group ?? []) if (item.current) candidateNodes.push(item.current)
      candidateNodes.sort(byDocumentPosition)
      const prevItemKey = context.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
      if ([prevItemKey, 'ArrowUp', 'End'].includes(event.key)) candidateNodes.reverse()
      if (ARROW_KEYS.includes(event.key)) {
        const currentIndex = candidateNodes.indexOf(event.currentTarget)
        candidateNodes = candidateNodes.slice(currentIndex + 1)
      }
      focusFirst(candidateNodes)
      event.preventDefault()
    }),
  }
}

/** The menu's triggers with an element, in document order. */
function getTriggers(triggers: Set<INavigationMenu.ITrigger>) {
  const found: { value: string; node: INavigationMenu.TriggerElement }[] = []
  for (const { value, ref } of triggers) if (ref.current) found.push({ value, node: ref.current })
  return found.sort((a, b) => byDocumentPosition(a.node, b.node))
}

export {
  activeElement,
  FocusGroupContext,
  focusFirst,
  getOpenState,
  getTabbableCandidates,
  getTriggers,
  LINK_SELECT,
  makeContentId,
  makeTriggerId,
  ROOT_CONTENT_DISMISS,
  removeFromTabOrder,
  useFocusGroup,
  useFocusGroupItem,
  useResizeObserver,
  whenMouse,
}
