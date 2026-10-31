import * as DialogPrimitive from '../dialog'
import { dialogPart } from './alert-dialog'
import type { IAlertDialog } from './alert-dialog.types'

export const AlertDialogTitle = dialogPart<HTMLHeadingElement, IAlertDialog.ITitleProps>(
  DialogPrimitive.Title,
  'AlertDialogTitle',
)
