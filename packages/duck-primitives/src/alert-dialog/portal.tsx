import * as DialogPrimitive from '../dialog'
import { dialogPart } from './alert-dialog'
import type { IAlertDialog } from './alert-dialog.types'

export const AlertDialogPortal = dialogPart<never, IAlertDialog.IPortalProps>(
  DialogPrimitive.Portal,
  'AlertDialogPortal',
)
