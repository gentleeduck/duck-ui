import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace IRovingFocus {
  export type IScoped<TProps> = TProps & { __scopeRovingFocusGroup?: Scope }

  export type Orientation = React.AriaAttributes['aria-orientation']
  export type FocusIntent = 'first' | 'last' | 'prev' | 'next'

  export interface IOptions {
    orientation?: Orientation
    dir?: IDirection.Kind
    loop?: boolean
  }

  export interface IContext extends IOptions {
    currentTabStopId: string | null
    queuedMovesRef: React.RefObject<number>
    onItemFocus(tabStopId: string): void
    onItemShiftTab(): void
    /** Adds an item to `items`, returning what takes it out again. */
    register(item: IItem): () => void
    items: Set<IItem>
  }

  export interface IItem {
    ref: React.RefObject<HTMLElement | null>
    id: string
    focusable: boolean
    active: boolean
    textValue: string | undefined
  }

  export interface IItemOptions {
    tabStopId?: string
    focusable?: boolean
    active?: boolean
    /** What a typeahead over the group matches, in place of the item's text. */
    textValue?: string
  }

  export type IItemHandlers<E extends HTMLElement> = Pick<
    React.DOMAttributes<E>,
    'onMouseDown' | 'onFocus' | 'onKeyDown'
  >

  export interface IItemBindings<E extends HTMLElement> {
    state: IItemState
    /** Undefined while roving focus is off, for the caller to set a tab index of its own. */
    attributes: { tabIndex: number; 'data-orientation': Orientation } | undefined
    handlers: IItemHandlers<E> & { ref: React.RefCallback<E> }
  }

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>

  export interface IGroupState {
    currentTabStopId?: string | null
    defaultCurrentTabStopId?: string
    onCurrentTabStopIdChange?: (tabStopId: string | null) => void
    onEntryFocus?: (event: Event) => void
    preventScrollOnEntryFocus?: boolean
  }

  export interface IGroupProps extends Omit<PrimitiveDivProps, 'dir'>, IOptions, IGroupState {}

  type IGroupElementProps<E extends HTMLElement> = Pick<
    React.HTMLAttributes<E>,
    'style' | 'onMouseDown' | 'onFocus' | 'onBlur'
  >

  export interface IGroupOptions<E extends HTMLElement>
    extends Omit<IOptions, 'dir'>,
      IGroupState,
      IGroupElementProps<E> {
    dir: IDirection.Kind
    /** The caller's own tab index, which the group then leaves alone. */
    tabIndex?: number
  }

  export interface IGroup<E extends HTMLElement> {
    context: IContext
    props: IGroupElementProps<E> & { 'data-orientation': Orientation; dir: IDirection.Kind; ref: React.RefCallback<E> }
  }

  export interface IItemState {
    isCurrentTabStop: boolean
    hasTabStop: boolean
  }

  export interface IItemProps extends Omit<PrimitiveSpanProps, 'children'>, IItemOptions {
    children?: React.ReactNode | ((state: IItemState) => React.ReactNode)
  }
}
