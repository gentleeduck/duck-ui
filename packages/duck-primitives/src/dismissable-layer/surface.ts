import * as React from 'react'
import { DismissableLayerContext } from './dismissable-layer'

// iOS Safari dispatches no click for a tap on an element without a click listener of its own.
const NOOP = () => {}

/** Registers a node, such as a dialog's overlay, that dismisses the layer even when it stops propagation. */
function useDismissableLayerSurface(): React.RefCallback<HTMLElement> {
  const { surfaces } = React.useContext(DismissableLayerContext)
  const [node, setNode] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!node) return
    surfaces.add(node)
    node.addEventListener('click', NOOP)
    return () => {
      surfaces.delete(node)
      node.removeEventListener('click', NOOP)
    }
  }, [node, surfaces])

  return setNode
}

export { useDismissableLayerSurface }
