import type * as React from 'react'
import { composeEventHandlers } from './compose-event-handler'

export function focusOn(
  handler: ((event: Event) => void) | undefined,
  target: React.RefObject<HTMLElement | null> | false | undefined,
) {
  if (target === undefined) return handler
  return composeEventHandlers(handler, (event: Event) => {
    event.preventDefault()
    if (target) target.current?.focus({ preventScroll: true })
  })
}
