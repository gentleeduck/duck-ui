import * as React from 'react'
import ReactDOM from 'react-dom'
import { Primitive } from '../primitive-elements'
import { Slot } from '../slot'
import type { IPortal } from './portal.types'

const PORTAL_NAME = 'Portal'

type PortalElement = React.ComponentRef<typeof Primitive.div>

const Portal = React.forwardRef<PortalElement, IPortal.IProps>((props, forwardedRef) => {
  const { container: containerProp, asChild, ...portalProps } = props
  // The server and hydration render nothing, and React reads the container again once a commit is done, which is when
  // a ref holding no element yet has one. A ref is told from a node by nodeType, since a form's named controls are its
  // properties and a control named current would pass for a ref.
  const container = React.useSyncExternalStore(
    subscribe,
    () => (containerProp && !('nodeType' in containerProp) ? containerProp.current : containerProp || document.body),
    nothing,
  )
  if (!container) return null
  return ReactDOM.createPortal(
    // Slotted, the marker would replace the data-slot of the content it lands on.
    asChild ? (
      <Slot {...portalProps} ref={forwardedRef} />
    ) : (
      <Primitive.div data-slot="portal" {...portalProps} ref={forwardedRef} />
    ),
    container,
  )
})

Portal.displayName = PORTAL_NAME

const nothing = () => null
const subscribe = () => nothing

export { Portal, Portal as Root }
