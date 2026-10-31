import * as DialogPrimitive from '../dialog'
import { dialogPart } from './alert-dialog'
import type { IAlertDialog } from './alert-dialog.types'

export const AlertDialogTrigger = dialogPart<HTMLButtonElement, IAlertDialog.ITriggerProps>(
  DialogPrimitive.Trigger,
  'AlertDialogTrigger',
)
