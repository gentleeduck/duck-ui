import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import {
  createLayerStack,
  enterLayer,
  type Layer,
  type LayerOwner,
  leaveLayer,
  updateLayer,
} from './dismissable-layer.libs'
import type { IDismissableLayer } from './dismissable-layer.types'

const DISMISSABLE_LAYER_NAME = 'DismissableLayer'

type DismissableLayerElement = React.ComponentRef<typeof Primitive.div>

export const DismissableLayerContext = React.createContext(createLayerStack())

/** The layer as props for an element of the caller's own, where `DismissableLayer` would add one of its own. */
function useDismissableLayer<E extends HTMLElement>(
  props: IDismissableLayer.IHookProps<E>,
  forwardedRef?: React.Ref<E>,
): IDismissableLayer.IHookResult<E> {
  const { disableOutsidePointerEvents = false } = props
  const stack = React.useContext(DismissableLayerContext)
  const nodeRef = React.useRef<E | null>(null)
  const layerRef = React.useRef<Layer | null>(null)
  const [owner] = React.useState<LayerOwner>(() => ({ props, pointerInside: false, focusInside: false }))
  // A `pointerEvents` key in the consumer's style wins, as it did when the layer spread it over its own.
  const ownsPointerEvents = !(props.style && 'pointerEvents' in props.style)

  React.useInsertionEffect(() => {
    owner.props = props
  })

  // Before paint, so the layer is never painted inheriting the body's `none`.
  useLayoutEffect(() => {
    const node = nodeRef.current
    const layer = layerRef.current
    if (layer && layer.node === node) return updateLayer(stack, layer, disableOutsidePointerEvents, ownsPointerEvents)
    if (layer) leaveLayer(stack, layer)
    layerRef.current = node && enterLayer(stack, node, owner, disableOutsidePointerEvents, ownsPointerEvents)
  })

  // A passive cleanup, so the page gets its pointer events back only once the layer's node is gone from it.
  React.useEffect(
    () => () => {
      if (layerRef.current) leaveLayer(stack, layerRef.current)
      layerRef.current = null
    },
    [stack],
  )

  return {
    ref: useComposedRefs(forwardedRef, nodeRef),
    onFocusCapture: composeEventHandlers(props.onFocusCapture, () => {
      owner.focusInside = true
    }),
    onBlurCapture: composeEventHandlers(props.onBlurCapture, () => {
      owner.focusInside = false
    }),
    onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, () => {
      owner.pointerInside = true
    }),
  }
}

const DismissableLayer = React.forwardRef<DismissableLayerElement, IDismissableLayer.IProps>((props, forwardedRef) => {
  const {
    disableOutsidePointerEvents,
    deferPointerDownOutside,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onDismiss,
    ...layerProps
  } = props
  return <Primitive.div data-slot="dismissable-layer" {...layerProps} {...useDismissableLayer(props, forwardedRef)} />
})

DismissableLayer.displayName = DISMISSABLE_LAYER_NAME

export { DismissableLayer, useDismissableLayer }
