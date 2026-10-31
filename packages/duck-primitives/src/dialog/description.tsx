import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useDialogContentContext } from './dialog'
import { useRegisteredId } from './dialog.libs'
import type { IDialog } from './dialog.types'

const DESCRIPTION_NAME = 'DialogDescription'

export const DialogDescription = React.forwardRef<HTMLParagraphElement, IDialog.IDescriptionProps>(
  (props: IDialog.IScoped<IDialog.IDescriptionProps>, forwardedRef) => {
    const { __scopeDialog, id: idProp, ...descriptionProps } = props
    const { onDescriptionIdChange } = useDialogContentContext(DESCRIPTION_NAME, __scopeDialog)
    return (
      <Primitive.p
        data-slot="dialog-description"
        id={useRegisteredId(idProp, onDescriptionIdChange)}
        {...descriptionProps}
        ref={forwardedRef}
      />
    )
  },
)

DialogDescription.displayName = DESCRIPTION_NAME
