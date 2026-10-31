import type * as DialogPrimitive from '@gentleduck/primitives/dialog'
import type * as React from 'react'

export interface IDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  closeText?: string
  hideClose?: boolean
}
