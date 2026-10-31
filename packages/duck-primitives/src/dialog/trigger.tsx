import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { getState } from '../libs/get-state'
import { Primitive } from '../primitive-elements'
import { useDialogContext } from './dialog'
import type { IDialog } from './dialog.types'

const TRIGGER_NAME = 'DialogTrigger'

export const DialogTrigger = React.forwardRef<HTMLButtonElement, IDialog.ITriggerProps>(
  (props: IDialog.IScoped<IDialog.ITriggerProps>, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props
    const context = useDialogContext(TRIGGER_NAME, __scopeDialog)
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef)
    return (
      <Primitive.button
        data-slot="dialog-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={context.open}
        aria-controls={context.open ? context.contentId : undefined}
        data-state={getState(context.open)}
        {...triggerProps}
        ref={composedTriggerRef}
        onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
      />
    )
  },
)

DialogTrigger.displayName = TRIGGER_NAME
