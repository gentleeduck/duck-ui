import type * as React from 'react'
import type { IDirection } from '../direction'
import type { IDismissableLayer } from '../dismissable-layer'
import type { Scope } from '../libs/create-context'
import type { IPopper } from '../popper'
import type { IPortal } from '../portal'
import type { Primitive } from '../primitive-elements'

export namespace IHoverCard {
  export type IScoped<TProps> = TProps & { __scopeHoverCard?: Scope }

  export interface IContext {
    open: boolean
    onOpen(): void
    onClose(): void
    onDismiss(): void
    hasSelectionRef: React.RefObject<boolean>
    isPointerDownOnContentRef: React.RefObject<boolean>
    dir: IDirection.Kind | undefined
  }

  export interface IPortalContext {
    forceMount?: true | undefined
  }

  export interface IProps {
    children?: React.ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    openDelay?: number
    closeDelay?: number
    dir?: IDirection.Kind
    /** Keeps the card closed, and closes it if it is open. */
    disabled?: boolean
  }

  type PrimitiveLinkProps = React.ComponentPropsWithoutRef<typeof Primitive.a>

  export interface IArrowProps extends IPopper.IArrowProps {}

  export interface IContentImplProps extends Omit<IPopper.IContentProps, 'onPlaced'> {
    onEscapeKeyDown?: IDismissableLayer.IProps['onEscapeKeyDown']
    onPointerDownOutside?: IDismissableLayer.IProps['onPointerDownOutside']
    onFocusOutside?: IDismissableLayer.IProps['onFocusOutside']
    onInteractOutside?: IDismissableLayer.IProps['onInteractOutside']
  }

  export interface IContentProps extends IContentImplProps {
    forceMount?: true
  }

  export interface IPortalProps {
    children?: React.ReactNode | undefined
    container?: IPortal.IProps['container'] | undefined
    forceMount?: true | undefined
  }

  export interface ITriggerProps extends PrimitiveLinkProps {}
}
