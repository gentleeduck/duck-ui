import type * as React from 'react'
import * as DialogPrimitive from '../dialog'
import { createDialogScope } from '../dialog'
import { createContextScope } from '../libs/create-context'
import { createScopedPart } from '../libs/scoped-part'
import type { IAlertDialog } from './alert-dialog.types'

const ROOT_NAME = 'AlertDialog'

export const [createAlertDialogContext, createAlertDialogScope] = createContextScope(ROOT_NAME, [createDialogScope])
export const useDialogScope = createDialogScope()
export const dialogPart = createScopedPart('__scopeAlertDialog', useDialogScope)

const AlertDialog: React.FC<IAlertDialog.IProps> = (props: IAlertDialog.IScoped<IAlertDialog.IProps>) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props
  const dialogScope = useDialogScope(__scopeAlertDialog)
  return <DialogPrimitive.Root {...dialogScope} {...alertDialogProps} modal={true} />
}

AlertDialog.displayName = ROOT_NAME

export { AlertDialog }
