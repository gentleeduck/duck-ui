import type * as React from 'react'
import type { IDialog } from '../dialog'
import type { Scope } from '../libs/create-context'

export namespace IAlertDialog {
  export type IScoped<TProps> = TProps & { __scopeAlertDialog?: Scope }

  export interface IProps extends Omit<IDialog.IProps, 'modal'> {}

  export interface IActionProps extends IDialog.ICloseProps {}
  export interface ICancelProps extends IDialog.ICloseProps {}

  export interface IContentProps
    extends Omit<IDialog.IContentProps, 'onPointerDownOutside' | 'onInteractOutside' | 'initialFocus'> {
    /** Focused on open in place of the cancel button. */
    initialFocus?: IDialog.IFocusTarget
  }

  export interface IDescriptionProps extends IDialog.IDescriptionProps {}

  export interface IOverlayProps extends IDialog.IOverlayProps {}

  export interface IPortalProps extends IDialog.IPortalProps {}

  export interface ITitleProps extends IDialog.ITitleProps {}

  export interface ITriggerProps extends IDialog.ITriggerProps {}

  export interface IContentContextValue {
    cancelRef: React.RefObject<HTMLButtonElement | null>
  }
}
