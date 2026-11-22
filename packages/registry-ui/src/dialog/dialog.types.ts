import type * as DialogPrimitive from '@gentleduck/primitives/dialog'
import type { IPortal } from '@gentleduck/primitives/portal'
import type * as React from 'react'

export interface IDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  closeText?: string
  hideClose?: boolean
  /** Where the content portals to, in place of `document.body`: an element, or a ref to one. */
  container?: IPortal.IProps['container']
}
