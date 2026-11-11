'use client'

import * as React from 'react'
import { useDirection } from '../direction'
import { useId } from '../hooks/use-id'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { createCollection } from '../libs/create-collection'
import { createContextScope, type Scope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import type { ICommand } from './command.types'

const COMMAND_NAME = 'Command'

export const [Collection, useCollection, createCollectionScope] = createCollection<HTMLLIElement, ICommand.IItemData>(
  COMMAND_NAME,
)

const [createCommandContext, createCommandScope] = createContextScope(COMMAND_NAME, [createCollectionScope])

export { createCommandScope }

export const [CommandProvider, useCommandContext] = createCommandContext<ICommand.IContext>(COMMAND_NAME)

const STATE_CONTEXT_NAME = 'CommandState'
export const [CommandStateProvider, useCommandStateContext] =
  createCommandContext<ICommand.IStateContext>(STATE_CONTEXT_NAME)

/** The text typed into the input. Reading it re-renders on each keystroke, where the rest of the command does not. */
export function useCommandSearch(__scopeCommand?: Scope) {
  return useCommandStateContext('useCommandSearch', __scopeCommand).search
}

/**
 * Reads what `selector` picks from the command's state, and renders again only when that changes. A selector returning
 * a new object renders again on every change of the state, rather than only when what it picks changes.
 */
export function useCommandState<T>(selector: (state: ICommand.IState) => T, __scopeCommand?: Scope) {
  const { store } = useCommandContext('useCommandState', __scopeCommand)
  // React reads the snapshot more than once per change, and an object made fresh each read would never settle.
  const cacheRef = React.useRef<{ state: ICommand.IState; selector: typeof selector; picked: T } | null>(null)
  const read = () => {
    const state = store.get()
    const cache = cacheRef.current
    if (cache && cache.state === state && cache.selector === selector) return cache.picked
    const picked = selector(state)
    cacheRef.current = { state, selector, picked }
    return picked
  }
  return React.useSyncExternalStore(store.subscribe, read, read)
}

function createStore(): ICommand.IStore {
  let state: ICommand.IState = { search: '', value: '', count: 0 }
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set(key, value) {
      if (state[key] === value) return
      state = { ...state, [key]: value }
      for (const listener of listeners) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

const LIST_CONTEXT_NAME = 'CommandList'
const defaultListContext: ICommand.IListContext = {
  onItemLeave: undefined,
  listRef: { current: null },
  emptyRef: { current: null },
  setSize: undefined,
}
export const [CommandListProvider, useCommandListContext] = createCommandContext<ICommand.IListContext>(
  LIST_CONTEXT_NAME,
  defaultListContext,
)

type CollectedItem = ReturnType<ReturnType<typeof useCollection>>[number]

// Walks from `index` by `step` past disabled rows. A row not drawn is asked for, and the list walks on from it once it
// mounts.
export function seek(
  items: CollectedItem[],
  virtual: ICommand.IVirtual,
  context: ICommand.IContext,
  index: number,
  step: 1 | -1,
) {
  context.pendingRef.current = null
  for (; index >= 0 && index < virtual.count; index += step) {
    const item = items.find((entry) => entry.index === index)
    if (!item) {
      context.pendingRef.current = { index, step }
      virtual.scrollToIndex(index)
      return
    }
    if (!item.disabled) {
      context.highlight(item.ref.current)
      item.ref.current.scrollIntoView({ block: 'nearest' })
      return
    }
  }
}

const ITEM_CONTEXT_NAME = 'CommandItem'
export const [CommandItemContextProvider, useCommandItemContext] =
  createCommandContext<ICommand.IItemContext>(ITEM_CONTEXT_NAME)

const GROUP_CONTEXT_NAME = 'CommandGroup'
export const [CommandGroupContextProvider, useCommandGroupContext] =
  createCommandContext<ICommand.IGroupContext>(GROUP_CONTEXT_NAME)

type CommandElement = React.ComponentRef<typeof Primitive.div>

export const Command = React.forwardRef<CommandElement, ICommand.IProps>(
  (props: ICommand.IScoped<ICommand.IProps>, forwardedRef) => {
    const {
      __scopeCommand,
      dir: dirProp,
      shouldFilter = true,
      filter,
      loop = false,
      vimBindings = true,
      disablePointerSelection = false,
      limit,
      value,
      defaultValue,
      onValueChange,
      children,
      ...commandProps
    } = props

    const direction = useDirection(dirProp)
    const listId = useId()
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const typeaheadSearchRef = React.useRef('')
    const highlightedRef = React.useRef<HTMLLIElement | null>(null)
    const itemsChangeRef = React.useRef<(() => void) | null>(null)
    const virtualRef = React.useRef<ICommand.IVirtual | null>(null)
    const pendingRef = React.useRef<{ index: number; step: 1 | -1 } | null>(null)
    const [forcedGroups] = React.useState(() => new WeakSet<HTMLElement>())
    const [search, setSearch] = React.useState('')
    const [store] = React.useState(createStore)
    const latest = React.useRef({ value, onValueChange })
    latest.current = { value, onValueChange }

    // The highlight is drawn on the nodes, so moving it re-renders neither the items nor the input.
    const markHighlighted = React.useCallback(
      (item: HTMLLIElement | null) => {
        const previous = highlightedRef.current
        if (previous === item) return
        previous?.removeAttribute('data-highlighted')
        previous?.setAttribute('aria-selected', 'false')
        item?.setAttribute('data-highlighted', '')
        item?.setAttribute('aria-selected', 'true')
        highlightedRef.current = item
        store.set('value', item?.getAttribute('data-value') ?? '')
        if (item) inputRef.current?.setAttribute('aria-activedescendant', item.id)
        else inputRef.current?.removeAttribute('aria-activedescendant')
      },
      [store],
    )

    const highlight = React.useCallback(
      (item: HTMLLIElement | null) => {
        const next = item?.getAttribute('data-value') ?? ''
        const { value: controlled, onValueChange: notify } = latest.current
        if (controlled !== undefined) {
          if (next !== controlled) notify?.(next)
          return
        }
        const previous = highlightedRef.current?.getAttribute('data-value') ?? ''
        markHighlighted(item)
        if (next !== previous) notify?.(next)
      },
      [markHighlighted],
    )

    const onItemsChange = React.useCallback(() => itemsChangeRef.current?.(), [])
    const onSearchChange = React.useCallback(
      (next: string) => {
        setSearch(next)
        store.set('search', next)
      },
      [store],
    )

    return (
      <CommandProvider
        scope={__scopeCommand}
        listId={listId}
        inputRef={inputRef}
        typeaheadSearchRef={typeaheadSearchRef}
        onSearchChange={onSearchChange}
        highlightedRef={highlightedRef}
        highlight={highlight}
        markHighlighted={markHighlighted}
        onItemsChange={onItemsChange}
        itemsChangeRef={itemsChangeRef}
        forcedGroups={forcedGroups}
        disablePointerSelection={disablePointerSelection}
        store={store}
        virtualRef={virtualRef}
        pendingRef={pendingRef}>
        <CommandStateProvider
          scope={__scopeCommand}
          search={search}
          shouldFilter={shouldFilter}
          filter={filter}
          value={value}
          defaultValue={defaultValue}
          limit={limit}>
          <Collection.Provider scope={__scopeCommand}>
            <CommandInner
              __scopeCommand={__scopeCommand}
              dir={direction}
              loop={loop}
              vimBindings={vimBindings}
              {...commandProps}
              ref={forwardedRef}>
              {children}
            </CommandInner>
          </Collection.Provider>
        </CommandStateProvider>
      </CommandProvider>
    )
  },
)

Command.displayName = COMMAND_NAME

const GROUP = '[data-slot="command-group"]'
const VIM_KEYS: Record<string, string> = { n: 'ArrowDown', j: 'ArrowDown', p: 'ArrowUp', k: 'ArrowUp' }

// Items outside any group count as a group of their own. Up goes to the start of the item's group, or from its start
// to the start of the group before.
function groupStart(nodes: HTMLLIElement[], index: number, step: 1 | -1) {
  const groups = nodes.map((node) => node.closest(GROUP))
  const startOf = (at: number) => {
    while (at > 0 && groups[at - 1] === groups[at]) at--
    return at
  }
  if (step > 0) {
    let at = index
    while (at < nodes.length && groups[at] === groups[index]) at++
    return nodes[at]
  }
  const start = startOf(index)
  if (start < index) return nodes[start]
  return start > 0 ? nodes[startOf(start - 1)] : undefined
}

function scroller(from: HTMLElement) {
  let box = from.parentElement
  while (box && box.scrollHeight <= box.clientHeight) box = box.parentElement
  return box
}

// A page is the height of the nearest box that scrolls the items, as in React Aria. With none, it is the whole list.
function pageFrom(nodes: HTMLLIElement[], from: HTMLLIElement, step: 1 | -1) {
  const box = scroller(from)
  const edge = nodes[step > 0 ? nodes.length - 1 : 0]
  if (!box) return edge
  const { top, height } = from.getBoundingClientRect()
  const reach = top + step * (box.clientHeight - height)
  const ordered = step > 0 ? nodes : [...nodes].reverse()
  return ordered.find((node) => step * (node.getBoundingClientRect().top - reach) >= 0) ?? edge
}

// Rows a virtual list has not drawn have no place to measure, so its page is as many rows of the highlighted one's height
// as the box shows past it.
function pageRows(from: HTMLElement) {
  const box = scroller(from)
  if (!box) return Number.POSITIVE_INFINITY
  const { height } = from.getBoundingClientRect()
  return Math.max(1, Math.round((box.clientHeight - height) / height))
}

const CommandInner = React.forwardRef<
  CommandElement,
  ICommand.IScoped<React.ComponentPropsWithRef<typeof Primitive.div>> & { loop: boolean; vimBindings: boolean }
>((props, forwardedRef) => {
  const { __scopeCommand, loop, vimBindings, children, ...commandProps } = props
  const context = useCommandContext(COMMAND_NAME, __scopeCommand)
  const getItems = useCollection(__scopeCommand)

  return (
    <Primitive.div
      data-slot="command"
      {...commandProps}
      ref={forwardedRef}
      onKeyDown={composeEventHandlers(commandProps.onKeyDown, (event) => {
        // An input method picks its text with these same keys while it composes. Safari sends the Enter that confirms
        // it after compositionend, with isComposing false and keyCode 229.
        if (event.nativeEvent.isComposing || event.keyCode === 229) return

        const key = (vimBindings && event.ctrlKey && VIM_KEYS[event.key]) || event.key
        const highlighted = context.highlightedRef.current

        if (key === 'Enter') {
          // A control beside the list, such as a button, takes its own Enter.
          const target = event.target as HTMLElement
          if (target !== context.inputRef.current && target.closest('button, a[href], input, textarea, select')) return
          // A virtual row scrolled out of the DOM stays the highlight to find again, but there is nothing to click.
          if (!highlighted?.isConnected) return
          event.preventDefault()
          highlighted.click()
          return
        }

        if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(key)) return
        event.preventDefault()
        const step = key === 'ArrowDown' || key === 'End' || key === 'PageDown' ? 1 : -1

        // A virtual list moves by index, since most of its rows are not in the DOM. Alt moves one row, as no group is
        // known past the rows drawn.
        const virtual = context.virtualRef.current
        if (virtual) {
          const end = virtual.count - 1
          const from = highlighted ? Number(highlighted.getAttribute('aria-posinset')) - 1 : -1
          let target = from + step
          if (key === 'Home' || key === 'End' || event.metaKey) target = step > 0 ? end : 0
          else if (!highlighted) target = step > 0 ? 0 : end
          else if (key === 'PageDown' || key === 'PageUp') {
            target = Math.min(end, Math.max(0, from + step * pageRows(highlighted)))
          } else if (target < 0 || target > end) target = loop ? (step > 0 ? 0 : end) : from
          // At an end the walk past a disabled row can only go back in.
          seek(getItems(), virtual, context, target, target === end ? -1 : target === 0 ? 1 : step)
          return
        }

        const nodes = getItems()
          .filter((item) => !item.disabled && !item.ref.current.hidden)
          .map((item) => item.ref.current)
        if (nodes.length === 0) return

        const last = nodes.length - 1
        const index = highlighted ? nodes.indexOf(highlighted) : -1
        let next: HTMLLIElement | undefined
        if (key === 'Home' || key === 'End' || event.metaKey) next = nodes[step > 0 ? last : 0]
        else if (index === -1) next = nodes[step > 0 ? 0 : last]
        else if (key === 'PageDown' || key === 'PageUp') next = pageFrom(nodes, nodes[index], step)
        else if (event.altKey) next = groupStart(nodes, index, step)
        next ??= nodes[index + step] ?? (loop ? nodes[step > 0 ? 0 : last] : nodes[index])

        context.highlight(next)
        next.scrollIntoView({ block: 'nearest' })
      })}>
      {children}
    </Primitive.div>
  )
})

CommandInner.displayName = 'CommandInner'
