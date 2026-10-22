import * as React from 'react'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import {
  activeElement,
  contains,
  type FocusableElement,
  focus,
  focusFirst,
  focusScopesStack,
  getTabbableCandidates,
  getTabbableEdges,
  isSameStop,
  removeLinks,
} from './focus-scope.libs'
import type { IFocusScope } from './focus-scope.types'

const AUTOFOCUS_ON_MOUNT = 'focusScope.autoFocusOnMount'
const AUTOFOCUS_ON_UNMOUNT = 'focusScope.autoFocusOnUnmount'
const EVENT_OPTIONS = { bubbles: false, cancelable: true }

const FOCUS_SCOPE_NAME = 'FocusScope'

type FocusScopeElement = React.ComponentRef<typeof Primitive.div>

const FocusScope = React.forwardRef<FocusScopeElement, IFocusScope.IProps>((props, forwardedRef) => {
  const {
    loop = false,
    trapped = false,
    branches,
    onKeyDown,
    onMountAutoFocus: onMountAutoFocusProp,
    onUnmountAutoFocus: onUnmountAutoFocusProp,
    ...scopeProps
  } = props
  const [container, setContainer] = React.useState<HTMLElement | null>(null)
  const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp)
  const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp)
  const lastFocusedComponentRef = React.useRef<FocusableElement | null>(null)
  const restoreFocusRef = React.useRef<FocusableElement | null>(null)
  const unmountTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const composedRefs = useComposedRefs(forwardedRef, setContainer)
  const branchesRef = React.useRef(branches)
  React.useEffect(() => {
    branchesRef.current = branches
  })

  const focusScope = React.useRef({
    paused: false,
    pause() {
      this.paused = true
    },
    resume() {
      this.paused = false
    },
  }).current

  React.useEffect(() => {
    if (!trapped || !container) return
    const document = container.ownerDocument
    const root = container.getRootNode()
    const isInScope = (target: EventTarget | null) =>
      contains(container, target) || !!branchesRef.current?.some((branch) => contains(branch, target))
    // The element last focused may have gone with a branch since, which the observer below never sees.
    const focusBack = () => {
      const last = lastFocusedComponentRef.current
      if (last) focus(last.isConnected && isInScope(last) ? last : container)
    }

    const handleFocusIn = (event: Event) => {
      if (focusScope.paused) return
      // The element focused, where a listener outside its shadow root is handed the shadow host.
      const target = event.composedPath()[0] as FocusableElement
      if (isInScope(target)) lastFocusedComponentRef.current = target
      else focusBack()
    }

    const handleFocusOut = (event: Event) => {
      if (focusScope.paused) return
      const { relatedTarget } = event as FocusEvent
      // No relatedTarget: the window lost focus, or the focused element went, and the browser decides what follows.
      if (relatedTarget !== null && !isInScope(relatedTarget)) focusBack()
    }

    // Browser moves focus to body when the focused element is removed; bring it back.
    const handleMutations = (mutations: MutationRecord[]) => {
      if (document.activeElement === document.body && mutations.some((mutation) => mutation.removedNodes.length)) {
        focus(container)
      }
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    // Focus moving between two elements of a shadow root never reaches the document.
    if (root !== document) root.addEventListener('focusin', handleFocusIn)
    const mutationObserver = new MutationObserver(handleMutations)
    mutationObserver.observe(container, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      root.removeEventListener('focusin', handleFocusIn)
      mutationObserver.disconnect()
    }
  }, [trapped, container, focusScope])

  React.useEffect(() => {
    if (!container) return
    const focusedElement = activeElement(container.ownerDocument)
    // Mounting again before the unmount timer runs is rendering another element: the scope never left.
    if (unmountTimerRef.current === undefined) {
      focusScopesStack.add(focusScope)
      restoreFocusRef.current = focusedElement
    } else clearTimeout(unmountTimerRef.current)

    if (!contains(container, focusedElement)) {
      const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS)
      container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus)
      container.dispatchEvent(mountEvent)
      if (!mountEvent.defaultPrevented) {
        focusFirst(removeLinks(getTabbableCandidates(container)))
        if (activeElement(container.ownerDocument) === focusedElement) focus(container)
      }
    }

    return () => {
      container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus)
      // Read now: by the time the timer fires, a torn-down test environment may have swapped the globals.
      const UnmountEvent = CustomEvent

      // Defer unmount focus: React bug focusing during unmount.
      // https://github.com/facebook/react/issues/17894
      unmountTimerRef.current = setTimeout(() => {
        unmountTimerRef.current = undefined
        const unmountEvent = new UnmountEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS)
        container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus)
        container.dispatchEvent(unmountEvent)
        if (!unmountEvent.defaultPrevented) focus(restoreFocusRef.current)
        container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus)

        focusScopesStack.remove(focusScope)
      }, 0)
    }
  }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope])

  // Tab/Shift+Tab looping at container edges
  const handleKeyDown = (event: React.KeyboardEvent<FocusScopeElement>) => {
    if (!loop && !trapped) return
    if (focusScope.paused) return
    // A Tab during an IME composition can pick a suggestion, so it stays with the input method.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return

    const isTabKey = event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey
    const container = event.currentTarget
    const focusedElement = activeElement(container.ownerDocument)

    if (isTabKey && focusedElement) {
      const [first, last] = getTabbableEdges(container)
      const hasTabbableElementsInside = first && last

      if (!hasTabbableElementsInside) {
        if (focusedElement === container) event.preventDefault()
      } else {
        if (!event.shiftKey && isSameStop(focusedElement, last)) {
          event.preventDefault()
          if (loop) focus(first)
        } else if (event.shiftKey && isSameStop(focusedElement, first)) {
          event.preventDefault()
          if (loop) focus(last)
        }
      }
    }
  }

  return (
    <Primitive.div
      data-slot="focus-scope"
      tabIndex={-1}
      {...scopeProps}
      ref={composedRefs}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
    />
  )
})

FocusScope.displayName = FOCUS_SCOPE_NAME

export { FocusScope }
