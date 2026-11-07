import type * as React from 'react'
import type { IDirection } from '../direction'
import type { IDismissableLayer } from '../dismissable-layer'
import type { IFocusScope } from '../focus-scope'
import type { Scope } from '../libs/create-context'
import type { IPopper } from '../popper'
import type { IPortal } from '../portal'
import type { Primitive } from '../primitive-elements'

export namespace IPopover {
  export type IScoped<TProps> = TProps & { __scopePopover?: Scope }

  export interface IContext {
    triggerRef: React.RefObject<HTMLButtonElement | null>
    contentId: string
    open: boolean
    onOpenChange(open: boolean): void
    onOpenToggle(): void
    hasCustomAnchor: boolean
    onCustomAnchorAdd(): void
    onCustomAnchorRemove(): void
    modal: boolean
    dir: IDirection.Kind | undefined
  }

  export interface IContentContext {
    onTitleIdChange(id: string | undefined): void
    onDescriptionIdChange(id: string | undefined): void
  }

  export interface IProps {
    children?: React.ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    modal?: boolean
    dir?: IDirection.Kind
  }

  type PrimitiveButtonProps = React.ComponentPropsWithRef<typeof Primitive.button>
  type PrimitiveHeading2Props = React.ComponentPropsWithoutRef<typeof Primitive.h2>
  type PrimitiveParagraphProps = React.ComponentPropsWithoutRef<typeof Primitive.p>

  export interface IAnchorProps extends IPopper.IAnchorProps {}
  export interface IArrowProps extends IPopper.IArrowProps {}
  export interface ITriggerProps extends PrimitiveButtonProps {}
  export interface ICloseProps extends ITriggerProps {}
  export interface ITitleProps extends PrimitiveHeading2Props {}
  export interface IDescriptionProps extends PrimitiveParagraphProps {}

  export interface IContentImplProps
    extends Omit<IPopper.IContentProps, 'onPlaced'>,
      Omit<IDismissableLayer.IProps, 'onDismiss' | 'deferPointerDownOutside'> {
    trapFocus?: IFocusScope.IProps['trapped']
    onOpenAutoFocus?: IFocusScope.IProps['onMountAutoFocus']
    onCloseAutoFocus?: IFocusScope.IProps['onUnmountAutoFocus']
    branches?: IFocusScope.IProps['branches']
    branchRegistry?: IFocusScope.IBranchRegistry | undefined
  }

  export interface IContentTypeProps extends Omit<IContentImplProps, 'branches' | 'branchRegistry'> {
    lockScroll?: boolean
  }

  /** The element to focus, or `false` to leave focus where it is. */
  export type IFocusTarget = React.RefObject<HTMLElement | null> | false

  export interface IContentProps extends IContentTypeProps {
    forceMount?: true
    /** Focused on open in place of the first tabbable element. */
    initialFocus?: IFocusTarget
    /** Focused on close in place of the trigger. */
    finalFocus?: IFocusTarget
  }

  export interface IPortalProps {
    children?: React.ReactNode | undefined
    container?: IPortal.IProps['container'] | undefined
    forceMount?: true | undefined
  }

  export interface IPortalContext {
    forceMount?: true | undefined
  }
}
