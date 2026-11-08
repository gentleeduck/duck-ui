import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { IMenu } from '../menu'
import type { Primitive } from '../primitive-elements'

export namespace IDropdownMenu {
  export type IScoped<TProps> = TProps & { __scopeDropdownMenu?: Scope }

  export interface IContext {
    triggerId: string
    triggerRef: React.RefObject<HTMLButtonElement | null>
    contentId: string
    open: boolean
    onOpenChange(open: boolean): void
    onOpenToggle(): void
    modal: boolean
  }

  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>

  export interface IProps {
    children?: React.ReactNode
    dir?: IDirection.Kind
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?(open: boolean): void
    modal?: boolean
  }

  export interface ITriggerProps extends PrimitiveButtonProps {
    disabled?: boolean
  }

  export interface IContentProps extends Omit<IMenu.IContentProps, 'onEntryFocus'> {}
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
