import * as React from 'react'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { composeRefs } from '../libs/compose-ref'
import { getComponentRef, PresenceClosingContext, usePresence } from './presence.libs'
import type { IPresence } from './presence.types'

const Presence: React.FC<IPresence.IProps> = (props) => {
  const { present, children } = props
  const presence = usePresence(present)

  const child = (
    typeof children === 'function' ? children({ present: presence.isPresent }) : React.Children.only(children)
  ) as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>

  // One identity for the life of the node: React re-attaches a ref that changes, so a child's inline ref that
  // renders on attach would loop. The child's latest ref is the one told when the node goes.
  const ref = useCallbackRef(composeRefs(presence.ref, getComponentRef(child)))
  const forceMount = typeof children === 'function'
  return (
    <PresenceClosingContext.Provider value={presence.closing}>
      {forceMount || presence.isPresent ? React.cloneElement(child, { ref }) : null}
    </PresenceClosingContext.Provider>
  )
}

Presence.displayName = 'Presence'

export { Presence }
