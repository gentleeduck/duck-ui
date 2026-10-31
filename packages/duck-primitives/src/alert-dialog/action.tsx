import * as DialogPrimitive from '../dialog'
import { dialogPart } from './alert-dialog'
import type { IAlertDialog } from './alert-dialog.types'

export const AlertDialogAction = dialogPart<HTMLButtonElement, IAlertDialog.IActionProps>(
  DialogPrimitive.Close,
  'AlertDialogAction',
)
