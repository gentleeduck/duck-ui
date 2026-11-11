import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace ICommand {
  export type IScoped<TProps> = TProps & { __scopeCommand?: Scope }

  export interface IItemData {
    value: string
    disabled: boolean
    forceMount: boolean
    textValue: string | undefined
    textRef: React.RefObject<HTMLElement | null>
    keywords?: string[]
    index: number | undefined
  }

  /**
   * Scores an item against the search: 0 hides it, and a higher score puts it before a lower one. `text` is what the
   * default filter matches, the item's `textValue` or the text it shows.
   */
  export type IFilter = (text: string, search: string, keywords: string[]) => number

  export interface IState {
    /** The text typed into the input. */
    search: string
    /** The `value` of the highlighted item, or an empty string when none is. */
    value: string
    /** How many items match the search and show, after `limit`. A `forceMount` item counts only when it matches. */
    count: number
  }

  export interface IStore {
    get(): IState
    set<TKey extends keyof IState>(key: TKey, value: IState[TKey]): void
    subscribe(listener: () => void): () => void
  }

  export interface IVirtual {
    /** How many items the whole list holds, drawn or not. */
    count: number
    /** Brings the item at `index` into the DOM, as a virtualizer's `scrollToIndex` does. */
    scrollToIndex: (index: number) => void
  }

  export interface IContext {
    listId: string
    inputRef: React.RefObject<HTMLInputElement | null>
    /** Where a typeahead of your own keeps its search. While it is not empty, Space on an item is left to it. */
    typeaheadSearchRef: React.RefObject<string>
    onSearchChange: (search: string) => void
    highlightedRef: React.RefObject<HTMLLIElement | null>
    /** Moves the highlight to an item, or clears it. Under a controlled `value` it only calls `onValueChange`. */
    highlight: (item: HTMLLIElement | null) => void
    /** Draws the highlight on an item without asking `onValueChange`. */
    markHighlighted: (item: HTMLLIElement | null) => void
    /** Tells the list an item mounted, unmounted or changed what it is found by, so it filters again. */
    onItemsChange: () => void
    itemsChangeRef: React.RefObject<(() => void) | null>
    forcedGroups: WeakSet<HTMLElement>
    disablePointerSelection: boolean
    store: IStore
    /** The `virtual` of the list, while it has one. */
    virtualRef: React.RefObject<IVirtual | null>
    /** The row a key asked `scrollToIndex` for, and the way on past it if it turns out disabled. */
    pendingRef: React.RefObject<{ index: number; step: 1 | -1 } | null>
  }

  export interface IStateContext {
    search: string
    shouldFilter: boolean
    filter: IFilter | undefined
    value: string | undefined
    defaultValue: string | undefined
    limit: number | undefined
  }

  export interface IListContext {
    onItemLeave?: (() => void) | undefined
    listRef: React.RefObject<HTMLUListElement | null>
    emptyRef: React.RefObject<HTMLDivElement | null>
    /** How many items a `virtual` list holds. */
    setSize: number | undefined
  }

  export interface IItemContext {
    value: string
    disabled: boolean
    textId: string
    onItemTextChange(node: HTMLElement | null): void
  }

  export interface IGroupContext {
    id: string
  }

  type PrimitiveDivProps = React.ComponentPropsWithRef<typeof Primitive.div>
  type PrimitiveInputProps = React.ComponentPropsWithRef<typeof Primitive.input>
  type PrimitiveUlProps = React.ComponentPropsWithRef<typeof Primitive.ul>
  type PrimitiveLiProps = React.ComponentPropsWithRef<typeof Primitive.li>

  export interface IProps extends Omit<PrimitiveDivProps, 'defaultValue'> {
    dir?: IDirection.Kind
    shouldFilter?: boolean
    /** Ranks and sorts the items in place of the default filter, which keeps the order and matches a substring. */
    filter?: IFilter
    /** Moves the highlight from the last item to the first and back on the arrow keys. */
    loop?: boolean
    /** Moves the highlight down on Ctrl+N and Ctrl+J and up on Ctrl+P and Ctrl+K. */
    vimBindings?: boolean
    /** Leaves the highlight where it is as the mouse moves over the items. A click still selects. */
    disablePointerSelection?: boolean
    /** The most matches the list shows, the best ranked first. A `forceMount` item shows beside them. */
    limit?: number
    /** The `value` of the highlighted item, to control the highlight. An empty string highlights nothing. */
    value?: string
    /** The `value` of the item highlighted first, where the first item would be. */
    defaultValue?: string
    /** Called with the `value` of the item the highlight moves to, or an empty string when it leaves every item. */
    onValueChange?: (value: string) => void
  }

  export interface IEmptyProps extends PrimitiveDivProps {}
  export interface IStatusProps extends Omit<PrimitiveDivProps, 'children'> {
    /** What to announce, or a function of how many items match that returns it. */
    children?: React.ReactNode | ((count: number) => React.ReactNode)
  }
  export interface ILoadingProps extends PrimitiveDivProps {
    /** How far the loading has come, from 0 to 100. Left out, the bar shows no amount. */
    progress?: number
  }
  export interface IGroupProps extends PrimitiveDivProps {
    heading?: React.ReactNode
    /** Shows the group whatever the search, with its heading, even when none of its items match. */
    forceMount?: boolean
  }

  export interface IInputProps extends PrimitiveInputProps {}
  export interface IListProps extends PrimitiveUlProps {
    /**
     * Draws only some of the items, as a virtualizer does. Each item then takes its `index`, the keys move by it, and a
     * row they reach that is not drawn is brought in through `scrollToIndex`. Filter the items yourself, with
     * `shouldFilter={false}` on the root.
     */
    virtual?: IVirtual
  }
  export interface ISeparatorProps extends PrimitiveDivProps {}

  export interface IItemProps extends Omit<PrimitiveLiProps, 'onSelect'> {
    value?: string
    disabled?: boolean
    textValue?: string
    /** More words a search matches the item by, such as aliases. */
    keywords?: string[]
    /** Shows the item whatever the search. It does not count as a match, so `Command.Empty` can show beside it. */
    forceMount?: boolean
    /** The item's place in a `virtual` list, from 0. */
    index?: number
    onSelect?: (value: string) => void
  }
}
