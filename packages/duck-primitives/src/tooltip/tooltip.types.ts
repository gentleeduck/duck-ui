import type * as React from 'react'
import type { IDirection } from '../direction'
import type { IDismissableLayer } from '../dismissable-layer'
import type { Scope } from '../libs/create-context'
import type { IPopper } from '../popper'
import type { IPortal } from '../portal'
import type { Primitive } from '../primitive-elements'

export namespace ITooltip {
  export type IScoped<TProps = {}> = TProps & { __scopeTooltip?: Scope }

  type TriggerElement = React.ComponentRef<'button'>

  export interface IContext {
    contentId: string
    setContentId(id: string | undefined): void
    open: boolean
    stateAttribute: 'closed' | 'delayed-open' | 'instant-open'
    trigger: TriggerElement | null
    onTriggerChange(trigger: TriggerElement | null): void
    onTriggerEnter(): void
    onTriggerLeave(): void
    triggerGraceRef: React.RefObject<((event: React.PointerEvent<HTMLElement>) => void) | null>
    onContentEnter(): void
    onOpen(): void
    onClose(): void
    onDelayedClose(): void
    disableHoverableContent: boolean
    dir: IDirection.Kind | undefined
  }

  export interface IProviderContext {
    isOpenDelayedRef: React.RefObject<boolean>
    delayDuration: number
    closeDelay: number
    onOpen(): void
    onClose(): void
    onPointerInTransitChange(inTransit: boolean): void
    isPointerInTransitRef: React.RefObject<boolean>
    disableHoverableContent: boolean
  }

  export interface IPortalContext {
    forceMount?: true | undefined
  }

  export interface IProps {
    children?: React.ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    delayDuration?: number
    /** How long it stays open, in milliseconds, after the pointer leaves it. */
    closeDelay?: number
    disableHoverableContent?: boolean
    dir?: IDirection.Kind
    /** Keeps the tooltip closed, and closes it if it is open. */
    disabled?: boolean
  }

  export interface IProviderProps {
    children: React.ReactNode
    delayDuration?: number
    closeDelay?: number
    skipDelayDuration?: number
    disableHoverableContent?: boolean
  }

  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>

  export interface IArrowProps extends IPopper.IArrowProps {}

  export interface IContentImplProps extends Omit<IPopper.IContentProps, 'onPlaced'> {
    'aria-label'?: string
    onEscapeKeyDown?: IDismissableLayer.IProps['onEscapeKeyDown']
    onPointerDownOutside?: IDismissableLayer.IProps['onPointerDownOutside']
  }

  export interface IContentProps extends IContentImplProps {
    forceMount?: true
  }

  export interface IPortalProps {
    children?: React.ReactNode | undefined
    container?: IPortal.IProps['container'] | undefined
    forceMount?: true | undefined
  }

  export interface ITriggerProps extends PrimitiveButtonProps {
    disableCloseOnClick?: boolean
  }
}
