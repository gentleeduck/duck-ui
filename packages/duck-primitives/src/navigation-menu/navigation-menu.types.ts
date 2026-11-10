import type * as React from 'react'
import type { IDirection } from '../direction'
import type { DismissableLayer, IDismissableLayer } from '../dismissable-layer'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'
import type * as VisuallyHiddenPrimitive from '../visibility-hidden'

export namespace INavigationMenu {
  export type IScoped<TProps> = TProps & { __scopeNavigationMenu?: Scope }

  export type Orientation = 'vertical' | 'horizontal'

  /** `automatic` opens an item when the pointer rests on its trigger; `manual` opens it only on a click. */
  export type ActivationMode = 'automatic' | 'manual'

  export type RootElement = HTMLElement
  export type TriggerElement = HTMLButtonElement
  export type ContentImplElement = React.ComponentRef<typeof DismissableLayer>
  export type ViewportElement = HTMLDivElement
  export type FocusProxyElement = React.ComponentRef<typeof VisuallyHiddenPrimitive.Root>

  type PrimitiveNavProps = React.ComponentPropsWithoutRef<typeof Primitive.nav>
  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>

  export interface IContentImplPrivateProps {
    value: string
    triggerRef: React.RefObject<TriggerElement | null>
    focusProxyRef: React.RefObject<FocusProxyElement | null>
    wasEscapeCloseRef: React.RefObject<boolean>
    onContentFocusOutside(): void
    onRootContentClose(): void
  }

  export interface IContentImplProps
    extends Omit<IDismissableLayer.IProps, 'onDismiss' | 'disableOutsidePointerEvents' | 'deferPointerDownOutside'>,
      IContentImplPrivateProps {}

  export interface IViewportContentMounterProps extends IContentImplProps {
    forceMount?: true | undefined
  }

  export type ViewportContentMounterElement = ContentImplElement

  export type IContentData = {
    ref?: React.Ref<ViewportContentMounterElement>
  } & IViewportContentMounterProps

  export interface IContext {
    isRootMenu: boolean
    value: string
    previousValue: string
    baseId: string
    dir: IDirection.Kind
    orientation: Orientation
    activationMode: ActivationMode
    rootNavigationMenu: RootElement | null
    indicatorTrack: HTMLDivElement | null
    onIndicatorTrackChange(indicatorTrack: HTMLDivElement | null): void
    viewport: ViewportElement | null
    onViewportChange(viewport: ViewportElement | null): void
    onViewportContentChange(contentValue: string, contentData: IContentData): void
    onViewportContentRemove(contentValue: string): void
    onTriggerEnter(itemValue: string): void
    onTriggerLeave(): void
    onContentEnter(): void
    onContentLeave(): void
    onItemSelect(itemValue: string): void
    onItemDismiss(): void
    triggers: Set<ITrigger>
  }

  export interface ITrigger {
    value: string
    ref: React.RefObject<TriggerElement | null>
  }

  export interface IItemContext {
    value: string
    triggerRef: React.RefObject<TriggerElement | null>
    contentRef: React.RefObject<ContentImplElement | null>
    focusProxyRef: React.RefObject<FocusProxyElement | null>
    wasEscapeCloseRef: React.RefObject<boolean>
    onEntryKeyDown(): void
    onFocusProxyEnter(side: 'start' | 'end'): void
    onRootContentClose(): void
    onContentFocusOutside(): void
  }

  export interface IProviderProps {
    isRootMenu: boolean
    scope: Scope
    children: React.ReactNode
    orientation: Orientation
    dir: IDirection.Kind
    activationMode: ActivationMode
    rootNavigationMenu: RootElement | null
    value: string
    onTriggerEnter(itemValue: string): void
    onTriggerLeave?(): void
    onContentEnter?(): void
    onContentLeave?(): void
    onItemSelect(itemValue: string): void
    onItemDismiss?(): void
  }

  export interface IProps extends PrimitiveNavProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    dir?: IDirection.Kind
    orientation?: Orientation
    delayDuration?: number
    skipDelayDuration?: number
    /** Milliseconds an item stays open after the pointer leaves it. Defaults to `150`. */
    closeDelay?: number
    activationMode?: ActivationMode
  }

  export interface ISubProps extends PrimitiveDivProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    orientation?: Orientation
    /** Defaults to the root's. */
    activationMode?: ActivationMode
    /** Keeps an open item open when its trigger is clicked again. Defaults to `true`. */
    disableToggle?: boolean
  }

  export interface IListProps extends React.ComponentPropsWithoutRef<typeof Primitive.ul> {}

  export interface IItemProps extends React.ComponentPropsWithoutRef<typeof Primitive.li> {
    value?: string
  }

  export interface ITriggerProps extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

  export interface IContentProps extends Omit<IContentImplProps, keyof IContentImplPrivateProps> {
    forceMount?: true
  }

  export interface ILinkProps extends Omit<React.ComponentPropsWithoutRef<typeof Primitive.a>, 'onSelect'> {
    active?: boolean
    onSelect?: (event: Event) => void
    /** `false` keeps the menu open once the link is selected. Defaults to `true`. */
    closeOnSelect?: boolean
  }

  export interface IViewportProps extends PrimitiveDivProps {
    forceMount?: true
  }

  export interface IIndicatorProps extends PrimitiveDivProps {
    forceMount?: true
  }
}
