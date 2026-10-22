import * as React from 'react'

let count = 0
let guards: [HTMLSpanElement, HTMLSpanElement] | undefined

/** Component wrapper for `useFocusGuards`. */
function FocusGuards(props: { children?: React.ReactNode }) {
  useFocusGuards()
  return props.children
}

/**
 * Insert invisible focusable spans at the start/end of document.body. Required so
 * focusin/focusout fire consistently for focus-trap when the scope is portalled outside
 * the trap's container.
 */
function useFocusGuards() {
  React.useEffect(() => {
    guards ??= [createFocusGuard(), createFocusGuard()]
    const [start, end] = guards
    // Moving a guard that is already in place still dirties layout for every overlay that measures after it.
    if (document.body.firstElementChild !== start) document.body.insertAdjacentElement('afterbegin', start)
    if (document.body.lastElementChild !== end) document.body.insertAdjacentElement('beforeend', end)
    count++

    return () => {
      if (--count) return
      start.remove()
      end.remove()
      guards = undefined
    }
  }, [])
}

function createFocusGuard() {
  const element = document.createElement('span')
  element.setAttribute('data-slot', 'focus-guard')
  element.tabIndex = 0
  element.style.outline = 'none'
  element.style.opacity = '0'
  element.style.position = 'fixed'
  element.style.pointerEvents = 'none'
  return element
}

export { FocusGuards, useFocusGuards }
