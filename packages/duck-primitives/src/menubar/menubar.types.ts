import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { IMenu } from '../menu'
import type { Primitive } from '../primitive-elements'
import type { IRovingFocus } from '../roving-focus'

export namespace IMenubar {
  export type IScoped<TProps> = TProps & { __scopeMenubar?: Scope }

  export type TriggerElement = HTMLButtonElement

  export interface IContext {
    value: string
    dir: IDirection.Kind
    loop: boolean
    modal: boolean
    disabled: boolean
    orientation: 'horizontal' | 'vertical'
    onMenuOpen(value: string): void
    onMenuClose(): void
    onMenuToggle(value: string): void
    /** The bar's triggers, each under its menu's value. */
    items: IRovingFocus.IContext['items']
  }

  export interface IMenuContext {
    value: string
    triggerId: string
    triggerRef: React.RefObject<TriggerElement | null>
    contentId: string
    wasKeyboardTriggerOpenRef: React.RefObject<boolean>
  }

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>

  export interface IProps extends PrimitiveDivProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    loop?: IRovingFocus.IGroupProps['loop']
    dir?: IRovingFocus.IGroupProps['dir']
    modal?: boolean
    disabled?: boolean
    orientation?: 'horizontal' | 'vertical'
  }

  export interface IMenuProps {
    children?: React.ReactNode
    value?: string
    onOpenChange?: (open: boolean) => void
  }

  export interface ITriggerProps extends PrimitiveButtonProps {}
  // The root's `modal` decides all three for every menu in the bar.
  export interface IContentProps
    extends Omit<
      IMenu.IContentProps,
      'onEntryFocus' | 'trapFocus' | 'disableOutsidePointerEvents' | 'disableOutsideScroll'
    > {}
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
