import type * as React from 'react'
import type { IDirection } from '../direction'
import type { IDismissableLayer } from '../dismissable-layer'
import type { IFocusScope } from '../focus-scope'
import type { Scope } from '../libs/create-context'
import type { IPopper } from '../popper'
import type { IPortal } from '../portal'
import type { Primitive } from '../primitive-elements'

export namespace ISelect {
  export type IScoped<TProps> = TProps & { __scopeSelect?: Scope }

  export type INativeOption = React.ReactElement<React.ComponentProps<'option'>>

  /** One value, or every value a `multiple` select holds, in the order they were picked. */
  export type IValue = string | readonly string[]

  export interface IItem {
    value: string
    label: string
    disabled?: boolean
  }

  export interface IItemData {
    value: string
    disabled: boolean
    textValue: string | undefined
    textRef: React.RefObject<HTMLSpanElement | null>
  }

  export interface IContext {
    trigger: HTMLButtonElement | null
    onTriggerChange(node: HTMLButtonElement | null): void
    valueNode: HTMLSpanElement | null
    onValueNodeChange(node: HTMLSpanElement | null): void
    valueNodeHasChildren: boolean
    onValueNodeHasChildrenChange(hasChildren: boolean): void
    contentId: string
    value: IValue | undefined
    onValueChange(value: IValue | undefined): void
    onUserSelect(value: string, stoppedPropagation: boolean): void
    multiple: boolean
    required?: boolean | undefined
    onOpenChange(open: boolean): void
    dir: IDirection.Kind
    triggerPointerDownPosRef: React.RefObject<{ x: number; y: number } | null>
    disabled?: boolean | undefined
    name?: string | undefined
    autoComplete?: string | undefined
    form?: string | undefined
    isFormControl: boolean
    items: readonly IItem[] | undefined
  }

  export interface IOpenContext {
    open: boolean
  }

  export interface IBubbleInputContext {
    /** The value the select started with, which a form reset puts back. */
    initialValue: IValue | undefined
    nativeOptions: Set<INativeOption>
    userSelection: IUserSelection | null
  }

  export interface IUserSelection {
    value: IValue
    stoppedPropagation: boolean
  }

  export interface INativeOptionsContext {
    onNativeOptionAdd(option: INativeOption): void
    onNativeOptionRemove(option: INativeOption): void
  }

  export interface IContentContext {
    onViewportChange?: (node: HTMLDivElement | null) => void
    itemRefCallback?: (node: HTMLDivElement | null, value: string, disabled: boolean) => void
    onItemLeave?: () => void
    itemTextRefCallback?: (node: HTMLSpanElement | null, value: string, disabled: boolean) => void
    position?: 'item-aligned' | 'popper'
    searchRef?: React.RefObject<string>
  }

  export interface IContentLayoutContext {
    viewport?: HTMLDivElement | null
    selectedItem?: HTMLDivElement | null
    selectedItemText?: HTMLSpanElement | null
    focusSelectedItem?: () => void
    isPositioned?: boolean
  }

  export interface IViewportContext {
    contentWrapper?: HTMLDivElement | null
    shouldExpandOnScrollRef?: React.RefObject<boolean>
    onScrollButtonChange?: (node: HTMLDivElement | null) => void
  }

  export interface IItemContext {
    value: string
    disabled: boolean
    textId: string
    isSelected: boolean
    textRef: React.RefObject<HTMLSpanElement | null>
  }

  export interface IGroupContext {
    id: string
  }

  type PrimitiveDivProps = React.ComponentPropsWithRef<typeof Primitive.div>
  type PrimitiveButtonProps = React.ComponentPropsWithRef<typeof Primitive.button>
  type PrimitiveSpanProps = React.ComponentPropsWithRef<typeof Primitive.span>

  export interface ISharedProps {
    children?: React.ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?(open: boolean): void
    dir?: IDirection.Kind
    name?: string
    autoComplete?: string
    disabled?: boolean
    required?: boolean
    form?: string
    items?: readonly IItem[]
  }

  export interface ISingleProps {
    multiple?: false
    value?: string
    defaultValue?: string
    onValueChange?(value: string): void
  }

  export interface IMultipleProps {
    multiple: true
    value?: readonly string[]
    defaultValue?: readonly string[]
    onValueChange?(value: string[]): void
  }

  export type IProps = ISharedProps & (ISingleProps | IMultipleProps)

  export interface IBubbleInputProps extends Omit<React.ComponentPropsWithRef<'select'>, 'value'> {}
  export interface IArrowProps extends IPopper.IArrowProps {}
  export interface IGroupProps extends PrimitiveDivProps {}
  export interface IIconProps extends PrimitiveSpanProps {}
  export interface IItemIndicatorProps extends PrimitiveSpanProps {}
  export interface IItemTextProps extends PrimitiveSpanProps {}
  export interface ILabelProps extends PrimitiveDivProps {}
  export interface ISeparatorProps extends PrimitiveDivProps {}
  export interface ITriggerProps extends PrimitiveButtonProps {}
  export interface IViewportProps extends PrimitiveDivProps {
    nonce?: string
  }

  export interface IValueProps extends Omit<PrimitiveSpanProps, 'placeholder' | 'children'> {
    placeholder?: React.ReactNode
    /** A function is given the picked values, one long in a single select, and is not called while none is. */
    children?: React.ReactNode | ((value: string[]) => React.ReactNode)
  }

  export interface IItemProps extends PrimitiveDivProps {
    value: string
    disabled?: boolean
    textValue?: string
  }

  export interface IPortalProps {
    children?: React.ReactNode | undefined
    container?: IPortal.IProps['container'] | undefined
  }

  export interface IScrollUpButtonProps extends Omit<PrimitiveDivProps, 'onAutoScroll'> {}
  export interface IScrollDownButtonProps extends Omit<PrimitiveDivProps, 'onAutoScroll'> {}

  export interface IScrollButtonImplProps extends PrimitiveDivProps {
    onAutoScroll(): void
  }

  export interface IPopperPrivateProps {
    onPlaced?: IPopper.IContentProps['onPlaced']
  }

  export interface IItemAlignedPositionProps extends PrimitiveDivProps {
    onPlaced?: () => void
  }

  export interface IPopperPositionProps extends IPopper.IContentProps {
    onPlaced?: () => void
  }

  export interface IContentImplProps
    extends Omit<IPopperPositionProps, keyof IPopperPrivateProps>,
      Omit<IItemAlignedPositionProps, keyof IPopperPrivateProps> {
    onCloseAutoFocus?: IFocusScope.IProps['onUnmountAutoFocus']
    onEscapeKeyDown?: IDismissableLayer.IProps['onEscapeKeyDown']
    onPointerDownOutside?: IDismissableLayer.IProps['onPointerDownOutside']
    onFocusOutside?: IDismissableLayer.IProps['onFocusOutside']
    position?: 'item-aligned' | 'popper'
    disableOutsidePointerEvents?: boolean
    trapFocus?: boolean
    lockScroll?: boolean
  }

  export interface IContentProps extends IContentImplProps {
    forceMount?: true
  }
}
