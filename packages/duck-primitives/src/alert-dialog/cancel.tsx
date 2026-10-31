import * as React from 'react'
import * as DialogPrimitive from '../dialog'
import { useComposedRefs } from '../libs/compose-ref'
import { useDialogScope } from './alert-dialog'
import type { IAlertDialog } from './alert-dialog.types'
import { useAlertDialogContentContext } from './content'

const CANCEL_NAME = 'AlertDialogCancel'

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, IAlertDialog.ICancelProps>(
  (props: IAlertDialog.IScoped<IAlertDialog.ICancelProps>, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog)
    const dialogScope = useDialogScope(__scopeAlertDialog)
    const ref = useComposedRefs(forwardedRef, cancelRef)
    return <DialogPrimitive.Close {...dialogScope} {...cancelProps} ref={ref} />
  },
)

AlertDialogCancel.displayName = CANCEL_NAME
