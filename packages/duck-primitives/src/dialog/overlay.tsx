import * as React from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { useDismissableLayerSurface } from '../dismissable-layer'
import { useComposedRefs } from '../libs/compose-ref'
import { getState } from '../libs/get-state'
import { Presence } from '../presence'
import { useHeldOpen } from '../presence/presence.libs'
import { Primitive } from '../primitive-elements'
import { createSlot } from '../slot'
import { useDialogContext } from './dialog'
import type { IDialog } from './dialog.types'
import { usePortalContext } from './portal'

const OVERLAY_NAME = 'DialogOverlay'

export const DialogOverlay = React.forwardRef<HTMLDivElement, IDialog.IOverlayProps>(
  (props: IDialog.IScoped<IDialog.IOverlayProps>, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog)
    const { forceMount = portalContext.forceMount, ...overlayProps } = props
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog)
    return context.modal ? (
      <Presence present={forceMount || context.open}>
        <DialogOverlayImpl {...overlayProps} ref={forwardedRef} />
      </Presence>
    ) : null
  },
)

DialogOverlay.displayName = OVERLAY_NAME

const Slot = createSlot('DialogOverlay.RemoveScroll')

const DialogOverlayImpl = React.forwardRef<HTMLDivElement, IDialog.IOverlayImplProps>(
  (props: IDialog.IScoped<IDialog.IOverlayImplProps>, forwardedRef) => {
    const { __scopeDialog, lockScroll: lockScrollProp, ...overlayProps } = props
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog)
    const held = useHeldOpen(context.open)
    // The overlay dismisses the dialog even when a consumer stops propagation on it.
    const composedRefs = useComposedRefs(forwardedRef, useDismissableLayerSurface())
    // A portalled branch, such as a nested popover's content, has to scroll too.
    const shards = React.useMemo(
      () => [context.contentRef, ...context.branches],
      [context.contentRef, context.branches],
    )
    return (
      <RemoveScroll as={Slot} allowPinchZoom enabled={lockScrollProp ?? held} shards={shards}>
        <Primitive.div
          data-slot="dialog-overlay"
          data-state={getState(context.open)}
          data-nested={context.nested ? '' : undefined}
          dir={context.dir}
          {...overlayProps}
          ref={composedRefs}
          style={{ pointerEvents: 'auto', ...overlayProps.style }}
        />
      </RemoveScroll>
    )
  },
)
DialogOverlayImpl.displayName = 'DialogOverlayImpl'
