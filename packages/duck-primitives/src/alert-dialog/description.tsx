import * as DialogPrimitive from '../dialog'
import { dialogPart } from './alert-dialog'
import type { IAlertDialog } from './alert-dialog.types'

export const AlertDialogDescription = dialogPart<HTMLParagraphElement, IAlertDialog.IDescriptionProps>(
  DialogPrimitive.Description,
  'AlertDialogDescription',
)
