import * as React from 'react'
import * as DialogPrimitive from '../dialog'
import { focusOn } from '../libs/focus-on'
import { createAlertDialogContext, useDialogScope } from './alert-dialog'
import type { IAlertDialog } from './alert-dialog.types'

const CONTENT_NAME = 'AlertDialogContent'
const TITLE_NAME = 'AlertDialogTitle'
const DESCRIPTION_NAME = 'AlertDialogDescription'

export const [AlertDialogContentProvider, useAlertDialogContentContext] =
  createAlertDialogContext<IAlertDialog.IContentContextValue>(CONTENT_NAME)

export const AlertDialogContent = React.forwardRef<HTMLDivElement, IAlertDialog.IContentProps>(
  (props: IAlertDialog.IScoped<IAlertDialog.IContentProps>, forwardedRef) => {
    const { __scopeAlertDialog, children, initialFocus, ...contentProps } = props
    const dialogScope = useDialogScope(__scopeAlertDialog)
    const cancelRef = React.useRef<HTMLButtonElement | null>(null)

    return (
      <DialogPrimitive.WarningProvider
        contentName={CONTENT_NAME}
        titleName={TITLE_NAME}
        descriptionName={DESCRIPTION_NAME}>
        <AlertDialogContentProvider scope={__scopeAlertDialog} cancelRef={cancelRef}>
          <DialogPrimitive.Content
            role="alertdialog"
            {...dialogScope}
            {...contentProps}
            ref={forwardedRef}
            onOpenAutoFocus={focusOn(contentProps.onOpenAutoFocus, initialFocus ?? cancelRef)}
            onInteractOutside={(event) => event.preventDefault()}>
            {children}
          </DialogPrimitive.Content>
        </AlertDialogContentProvider>
      </DialogPrimitive.WarningProvider>
    )
  },
)

AlertDialogContent.displayName = CONTENT_NAME
