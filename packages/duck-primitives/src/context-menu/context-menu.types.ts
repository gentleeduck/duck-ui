import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { IMenu } from '../menu'
import type { Primitive } from '../primitive-elements'

export namespace IContextMenu {
  export type IScoped<TProps> = TProps & { __scopeContextMenu?: Scope }

  export interface IContext {
    open: boolean
    onOpenChange(open: boolean): void
    modal: boolean
    hasInteractedRef: React.RefObject<boolean>
    rightClickClosesRef: React.RefObject<boolean>
  }

  type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>

  export interface IProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?(open: boolean): void
    dir?: IDirection.Kind
    modal?: boolean
  }

  export interface ITriggerProps extends PrimitiveSpanProps {
    disabled?: boolean
  }

  export interface IContentProps extends Omit<IMenu.IContentProps, 'onEntryFocus' | 'side' | 'sideOffset' | 'align'> {}
  export interface IItemIndicatorProps extends IMenu.IItemIndicatorProps {}
  export interface IItemProps extends IMenu.IItemProps {}
  export interface ICheckboxItemProps extends IMenu.ICheckboxItemProps {}
  export interface IGroupProps extends IMenu.IGroupProps {}
  export interface IPortalProps extends IMenu.IPortalProps {}
  export interface IRadioGroupProps extends IMenu.IRadioGroupProps {}
  export interface IRadioItemProps extends IMenu.IRadioItemProps {}
  export interface ISeparatorProps extends IMenu.ISeparatorProps {}
  export interface ISubContentProps extends IMenu.ISubContentProps {}
  export interface ISubTriggerProps extends IMenu.ISubTriggerProps {}
  export interface IArrowProps extends IMenu.IArrowProps {}
  export interface ILabelProps extends IMenu.ILabelProps {}

  export interface ISubProps extends IMenu.ISubProps {
    defaultOpen?: boolean
  }
}
