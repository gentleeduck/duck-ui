import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace IAccordion {
  export type IScoped<TProps> = TProps & { __scopeAccordion?: Scope }

  export interface IContext {
    openItems: string[]
    onItemOpenChange(value: string): void
    collapsible: boolean
    disabled: boolean
    orientation: IOrientation
    onFocusChange?(value: string | null): void
  }

  export type IOrientation = 'vertical' | 'horizontal'

  export interface IImpl extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
    dir?: IDirection.Kind
    orientation?: IOrientation
    disabled?: boolean
    /** Arrow keys wrap from the last trigger to the first and back. Defaults to `true`. */
    loop?: boolean
    /** Called with the focused item's value, and with `null` once focus leaves the triggers. */
    onFocusChange?(value: string | null): void
  }

  export interface ISingle extends IImpl {
    type?: 'single'
    value?: string
    defaultValue?: string
    onValueChange?(value: string): void
    collapsible?: boolean
  }

  export interface IMultiple extends IImpl {
    type: 'multiple'
    value?: string[]
    defaultValue?: string[]
    onValueChange?(value: string[]): void
    collapsible?: never
  }

  export interface IImplPrivate extends IImpl {
    openItems: string[]
    onItemOpenChange(value: string): void
    collapsible: boolean
  }

  export type IProps = ISingle | IMultiple

  export interface IItemProps extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
    value?: string
    disabled?: boolean
    /** Called when the item's trigger, or the browser's find-in-page, opens or closes it. */
    onOpenChange?(open: boolean): void
  }

  export interface IItemContext {
    value: string
    open: boolean
    disabled: boolean
    triggerId: string
    contentId: string
    onOpenToggle(): void
  }

  export interface IContentProps extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
    forceMount?: boolean
    /** Keeps the closed content in the page as `hidden="until-found"`, so the browser's find-in-page opens the item. */
    hiddenUntilFound?: boolean
  }

  export interface IContentImplProps extends Omit<IContentProps, 'forceMount'> {
    present: boolean
    skipAnimationRef: React.RefObject<boolean | null>
  }

  export interface IHeaderProps extends React.ComponentPropsWithoutRef<typeof Primitive.h3> {}

  export interface IIndicatorProps extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

  export interface ITriggerProps extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}
}
