import * as DialogPrimitive from '../dialog'
import { dialogPart } from './alert-dialog'
import type { IAlertDialog } from './alert-dialog.types'

export const AlertDialogOverlay = dialogPart<HTMLDivElement, IAlertDialog.IOverlayProps>(
  DialogPrimitive.Overlay,
  'AlertDialogOverlay',
)
