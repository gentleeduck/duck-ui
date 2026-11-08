import type * as React from 'react'
import type { IDirection } from '../direction'
import type { IDismissableLayer } from '../dismissable-layer'
import type { IFocusScope } from '../focus-scope'
import type { Scope } from '../libs/create-context'
import type { IPortal } from '../portal'
import type { Primitive } from '../primitive-elements'

export namespace IDialog {
  export type IScoped<TProps> = TProps & { __scopeDialog?: Scope }

  export type ContentElement = HTMLDivElement

  export interface IContext {
    triggerRef: React.RefObject<HTMLButtonElement | null>
    contentRef: React.RefObject<ContentElement | null>
    contentId: string
    onContentIdChange(id: string | undefined): void
    open: boolean
    onOpenChange(open: boolean): void
    onOpenToggle(): void
    modal: boolean
    dir?: IDirection.Kind
    branches: readonly HTMLElement[]
    branchRegistry: IFocusScope.IBranchRegistry
    /** The contents of the dialogs opened from this one's content, while they are mounted. */
    layers: readonly HTMLElement[]
    layerRegistry: IFocusScope.IBranchRegistry
    /** Opened from another dialog's content. */
    nested: boolean
    /** How deep the dialogs opened from this one's content go, while they are open. */
    nestedCount: number
    onNestedCountChange(count: number): void
  }

  export interface IContentContext {
    onTitleIdChange(key: string, id?: string): void
    onDescriptionIdChange(key: string, id?: string): void
  }

  export interface IProps {
    children?: React.ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?(open: boolean): void
    modal?: boolean
    dir?: IDirection.Kind
  }

  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>
  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveHeading2Props = React.ComponentPropsWithoutRef<typeof Primitive.h2>
  type PrimitiveParagraphProps = React.ComponentPropsWithoutRef<typeof Primitive.p>

  export interface ICloseProps extends PrimitiveButtonProps {}
  export interface ITriggerProps extends PrimitiveButtonProps {}
  export interface ITitleProps extends PrimitiveHeading2Props {}
  export interface IDescriptionProps extends PrimitiveParagraphProps {}

  /** The element to focus, or `false` to leave focus where it is. */
  export type IFocusTarget = React.RefObject<HTMLElement | null> | false

  export interface IContentProps extends Omit<IDismissableLayer.IProps, 'onDismiss' | 'deferPointerDownOutside'> {
    forceMount?: true
    /** Ignored by a non-modal dialog, which never traps focus or blocks the page. */
    trapFocus?: IFocusScope.IProps['trapped']
    onOpenAutoFocus?: IFocusScope.IProps['onMountAutoFocus']
    onCloseAutoFocus?: IFocusScope.IProps['onUnmountAutoFocus']
    /** Focused on open in place of the first tabbable element. */
    initialFocus?: IFocusTarget
    /** Focused on close in place of the trigger. */
    finalFocus?: IFocusTarget
  }

  export interface IOverlayImplProps extends PrimitiveDivProps {
    lockScroll?: boolean
  }

  export interface IOverlayProps extends IOverlayImplProps {
    forceMount?: true
  }

  export interface IPortalProps {
    children?: React.ReactNode | undefined
    container?: IPortal.IProps['container'] | undefined
    forceMount?: true | undefined
  }

  export interface IPortalContext {
    forceMount?: true | undefined
  }

  export interface IWarningNames {
    contentName: string
    titleName: string
    descriptionName: string
  }

  export interface ITitleWarningProps {
    titles: ReadonlyMap<string, string>
    named: boolean
  }

  export interface IDescriptionWarningProps {
    descriptions: ReadonlyMap<string, string>
    described: boolean
  }
}
