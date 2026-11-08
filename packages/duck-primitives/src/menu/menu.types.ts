import type * as React from 'react'
import type { IDirection } from '../direction'
import type { IDismissableLayer } from '../dismissable-layer'
import type { IFocusScope } from '../focus-scope'
import type { Scope } from '../libs/create-context'
import type * as PopperPrimitive from '../popper'
import type { IPopper } from '../popper'
import type { IPortal } from '../portal'
import type { Primitive } from '../primitive-elements'
import type { IRovingFocus } from '../roving-focus'
import type { CheckedState } from './menu.libs'

export namespace IMenu {
  export type IScoped<TProps> = TProps & { __scopeMenu?: Scope }

  export type ContentElement = React.ComponentRef<typeof PopperPrimitive.Content>
  export type ItemElement = React.ComponentRef<typeof Primitive.div>
  export type SubTriggerElement = React.ComponentRef<typeof Primitive.div>

  export interface IContext {
    open: boolean
    onOpenChange(open: boolean): void
  }

  export interface IRootContext {
    onClose(): void
    isUsingKeyboardRef: React.RefObject<boolean>
    dir: IDirection.Kind
    modal: boolean
  }

  export interface IPortalContext {
    forceMount?: true | undefined
  }

  export interface ISubContext {
    contentId: string
    triggerId: string
    trigger: SubTriggerElement | null
    onTriggerChange(trigger: SubTriggerElement | null): void
    content: ContentElement | null
    onContentChange(content: ContentElement | null): void
    closeParentOnEsc: boolean
  }

  export interface IProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?(open: boolean): void
    dir?: IDirection.Kind
    modal?: boolean
  }

  export interface ISubProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?(open: boolean): void
    /** Whether Escape in the submenu closes the whole menu, or only the submenu, focusing its trigger. */
    closeParentOnEsc?: boolean
  }

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>

  export interface IAnchorProps extends IPopper.IAnchorProps {}
  export interface IArrowProps extends IPopper.IArrowProps {}
  export interface IGroupProps extends PrimitiveDivProps {}
  export interface ILabelProps extends PrimitiveDivProps {}
  export interface ISeparatorProps extends PrimitiveDivProps {}

  export interface IPortalProps {
    children?: React.ReactNode | undefined
    container?: IPortal.IProps['container'] | undefined
    forceMount?: true | undefined
  }

  export interface IItemImplProps extends PrimitiveDivProps {
    disabled?: boolean
    textValue?: string
  }

  export interface IItemProps extends Omit<IItemImplProps, 'onSelect'> {
    onSelect?: (event: Event) => void
    /** Closes the menu once the item is selected. Defaults to `true`. */
    closeOnSelect?: boolean
  }

  export interface ICheckboxItemProps extends IItemProps {
    checked?: CheckedState
    onCheckedChange?: (checked: boolean) => void
  }

  export interface ICheckboxContext {
    checked: CheckedState
  }

  export interface IItemIndicatorProps extends PrimitiveSpanProps {
    forceMount?: true
  }

  export interface IRadioGroupProps extends IGroupProps {
    value?: string | undefined
    onValueChange?: ((value: string) => void) | undefined
  }

  export interface IRadioItemProps extends IItemProps {
    value: string
  }

  export interface IContentImplPrivateProps {
    onOpenAutoFocus?: IFocusScope.IProps['onMountAutoFocus']
    onDismiss?: IDismissableLayer.IProps['onDismiss']
    disableOutsidePointerEvents?: IDismissableLayer.IProps['disableOutsidePointerEvents']
    disableOutsideScroll?: boolean
    trapFocus?: IFocusScope.IProps['trapped']
  }

  export interface IContentImplProps extends IContentImplPrivateProps, Omit<IPopper.IContentProps, 'dir' | 'onPlaced'> {
    onCloseAutoFocus?: IFocusScope.IProps['onUnmountAutoFocus']
    loop?: IRovingFocus.IGroupProps['loop']
    onEntryFocus?: IRovingFocus.IGroupProps['onEntryFocus']
    onEscapeKeyDown?: IDismissableLayer.IProps['onEscapeKeyDown']
    onPointerDownOutside?: IDismissableLayer.IProps['onPointerDownOutside']
    onFocusOutside?: IDismissableLayer.IProps['onFocusOutside']
    onInteractOutside?: IDismissableLayer.IProps['onInteractOutside']
  }

  export interface IRootContentTypeProps extends Omit<IContentImplProps, keyof IContentImplPrivateProps> {
    trapFocus?: IFocusScope.IProps['trapped']
    disableOutsidePointerEvents?: IDismissableLayer.IProps['disableOutsidePointerEvents']
    disableOutsideScroll?: boolean
  }

  export interface IContentProps extends IRootContentTypeProps {
    forceMount?: true
  }

  export interface ISubContentProps
    extends Omit<
      IContentImplProps,
      keyof IContentImplPrivateProps | 'onCloseAutoFocus' | 'onEntryFocus' | 'side' | 'align'
    > {
    forceMount?: true
  }

  export interface ISubTriggerProps extends IItemImplProps {}
}
