import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useDialogContentContext } from './dialog'
import { useRegisteredId } from './dialog.libs'
import type { IDialog } from './dialog.types'

const TITLE_NAME = 'DialogTitle'

export const DialogTitle = React.forwardRef<HTMLHeadingElement, IDialog.ITitleProps>(
  (props: IDialog.IScoped<IDialog.ITitleProps>, forwardedRef) => {
    const { __scopeDialog, id: idProp, ...titleProps } = props
    const { onTitleIdChange } = useDialogContentContext(TITLE_NAME, __scopeDialog)
    return (
      <Primitive.h2
        data-slot="dialog-title"
        id={useRegisteredId(idProp, onTitleIdChange)}
        {...titleProps}
        ref={forwardedRef}
      />
    )
  },
)

DialogTitle.displayName = TITLE_NAME
