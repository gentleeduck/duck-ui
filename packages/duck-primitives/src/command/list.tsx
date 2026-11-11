import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import {
  Collection,
  CommandListProvider,
  seek,
  useCollection,
  useCommandContext,
  useCommandStateContext,
} from './command'
import type { ICommand } from './command.types'
import { fold } from './filter'

const LIST_NAME = 'CommandList'
const ITEM = '[data-slot="command-item"]'
const GROUP = '[data-slot="command-group"]'
const SEPARATOR = '[data-slot="command-separator"]'
const HEIGHT = '--gentleduck-command-list-height'

interface IOrder {
  rank: WeakMap<Element, number>
  moved: Set<Element>
}

// React puts a node in just before its next sibling in the tree, wherever a ranked search has moved that sibling.
function rankNew(parent: Element, rank: WeakMap<Element, number>) {
  const children = Array.from(parent.children)
  let top = Math.max(-1, ...children.filter((child) => rank.has(child)).map((child) => Number(rank.get(child))))
  for (let index = children.length - 1; index >= 0; index--) {
    const child = children[index]
    if (rank.has(child)) continue
    const next = rank.get(children[index + 1])
    rank.set(child, next === undefined ? ++top : next - 1e-6)
  }
  return children
}

function place(parent: Element, order: Element[]) {
  order.forEach((child, index) => {
    const at = parent.children[index]
    if (at !== child) parent.insertBefore(child, at)
  })
}

// Items and groups trade the places they hold among a parent's children, so a heading, a separator or the empty
// state stays where it is.
function arrange(parents: Element[], scores: Map<Element, number>, order: IOrder) {
  const best = new Map<Element, number>()
  for (const [node, score] of scores) {
    best.set(node, score)
    const group = node.closest(GROUP)
    if (group) best.set(group, Math.max(score, best.get(group) ?? 0))
  }
  const rank = (node: Element) => Number(order.rank.get(node))
  const scoreOf = (node: Element) => Number(best.get(node))

  for (const parent of parents) {
    let children: Element[]
    if (order.moved.has(parent)) children = rankNew(parent, order.rank)
    else {
      children = Array.from(parent.children)
      children.forEach((child, index) => {
        order.rank.set(child, index)
      })
      order.moved.add(parent)
    }
    const sorted = children
      .filter((child) => best.has(child))
      .sort((a, b) => scoreOf(b) - scoreOf(a) || rank(a) - rank(b))
    let slot = 0
    place(
      parent,
      children.map((child) => (best.has(child) ? sorted[slot++] : child)),
    )
  }
}

function restore(order: IOrder) {
  for (const parent of order.moved) {
    place(
      parent,
      rankNew(parent, order.rank).sort((a, b) => Number(order.rank.get(a)) - Number(order.rank.get(b))),
    )
  }
  order.moved.clear()
}

type CommandListElement = React.ComponentRef<typeof Primitive.ul>

export const CommandList = React.forwardRef<CommandListElement, ICommand.IListProps>(
  (props: ICommand.IScoped<ICommand.IListProps>, forwardedRef) => {
    const { __scopeCommand, virtual, ...listProps } = props
    const context = useCommandContext(LIST_NAME, __scopeCommand)
    const { search, shouldFilter, filter, value, defaultValue, limit } = useCommandStateContext(
      LIST_NAME,
      __scopeCommand,
    )
    const getItems = useCollection(__scopeCommand)
    const listRef = React.useRef<HTMLUListElement | null>(null)
    const emptyRef = React.useRef<HTMLDivElement | null>(null)
    const composedRef = useComposedRefs(forwardedRef, listRef)
    const [version, onItemsChange] = React.useReducer((count: number) => count + 1, 0)
    const [order] = React.useState<IOrder>(() => ({ rank: new WeakMap(), moved: new Set() }))
    const [filteredOut] = React.useState(() => new WeakSet<HTMLElement>())
    const lastSearch = React.useRef(search)
    const lastValue = React.useRef(value)
    const mounted = React.useRef(false)
    const { highlight, markHighlighted, highlightedRef, itemsChangeRef, forcedGroups, inputRef, store } = context
    const { virtualRef, pendingRef } = context

    const handleItemLeave = React.useCallback(() => {
      highlight(null)
      inputRef.current?.focus({ preventScroll: true })
    }, [inputRef, highlight])

    useLayoutEffect(() => {
      virtualRef.current = virtual ?? null
    })

    // Set after the items' own effects on mount, so the items a command mounts with do not filter it twice. A list
    // leaving takes its virtualizer and its pending move with it, unless another list has replaced them.
    useLayoutEffect(() => {
      itemsChangeRef.current = onItemsChange
      return () => {
        if (itemsChangeRef.current !== onItemsChange) return
        itemsChangeRef.current = null
        virtualRef.current = null
        pendingRef.current = null
      }
    }, [itemsChangeRef, virtualRef, pendingRef])

    // The list's own height may follow the variable, so its rows are measured instead: each one the observer reports,
    // and each one added since, which the mutation observer hands it.
    useLayoutEffect(() => {
      // A test DOM has none, and the variable is only for styling.
      if (typeof ResizeObserver === 'undefined') return
      // biome-ignore lint/style/noNonNullAssertion: the list is mounted when its own layout effect runs
      const list = listRef.current!
      const sizes = new ResizeObserver((entries) => {
        for (const { target } of entries) if (target.parentElement !== list) sizes.unobserve(target)
        let top = Number.POSITIVE_INFINITY
        let bottom = Number.NEGATIVE_INFINITY
        for (const row of list.children) {
          const rect = row.getBoundingClientRect()
          if (rect.height === 0) continue
          top = Math.min(top, rect.top)
          bottom = Math.max(bottom, rect.bottom)
        }
        list.style.setProperty(HEIGHT, `${Math.max(0, bottom - top)}px`)
      })
      const watch = () => {
        for (const row of list.children) sizes.observe(row)
      }
      const rows = new MutationObserver(watch)
      watch()
      rows.observe(list, { childList: true })
      return () => {
        rows.disconnect()
        sizes.disconnect()
      }
    }, [])

    // A passive effect would leave the highlight to a render in a later task, a keystroke behind the filter.
    useLayoutEffect(() => {
      // biome-ignore lint/style/noNonNullAssertion: the list is mounted when its own layout effect runs
      const list = listRef.current!
      const groups = Array.from(list.querySelectorAll<HTMLElement>(GROUP))
      const items = getItems()
      const ranked = shouldFilter && search !== ''
      const query = fold(search)
      const scores = new Map<Element, number>()

      for (const item of items) {
        const node = item.ref.current
        let score = 1
        if (ranked) {
          const text = item.textValue || item.textRef.current?.textContent || node.textContent
          const keywords = item.keywords ?? []
          score = filter
            ? filter(text, search, keywords)
            : [text, ...keywords].some((word) => fold(word).includes(query))
              ? 1
              : 0
        }
        scores.set(node, score)
        if (shouldFilter) {
          node.hidden = score <= 0 && !item.forceMount
          if (node.hidden) filteredOut.add(node)
          else filteredOut.delete(node)
        } else if (filteredOut.delete(node)) node.hidden = false
      }

      if (filter && ranked) arrange([list, ...groups], scores, order)
      else if (order.moved.size > 0) restore(order)

      // Counted in the order the rows stand in now, so a limit keeps the best ranked.
      const shown = getItems()
      let matches = 0
      for (const item of shown) {
        const node = item.ref.current
        if (node.hidden || Number(scores.get(node)) <= 0) continue
        if (shouldFilter && limit !== undefined && matches >= limit && !item.forceMount) {
          node.hidden = true
          filteredOut.add(node)
        } else matches++
      }
      const virtualList = virtualRef.current
      store.set('count', virtualList ? virtualList.count : matches)

      for (const group of groups) {
        group.hidden = !forcedGroups.has(group) && group.querySelector(`${ITEM}:not([hidden])`) === null
      }
      for (const separator of list.querySelectorAll<HTMLElement>(`${GROUP} + ${SEPARATOR}`)) {
        separator.hidden = separator.matches(`${GROUP}[hidden] + *`)
      }
      if (emptyRef.current) emptyRef.current.hidden = matches > 0

      const choices = shown.filter((item) => !item.disabled && !item.ref.current.hidden).map((item) => item.ref.current)
      const named = (name: string | undefined) =>
        name ? (choices.find((node) => node.getAttribute('data-value') === name) ?? null) : null
      const searched = lastSearch.current !== search
      lastSearch.current = search
      const first = choices[0] ?? null

      const heldValue = value ?? store.get().value
      if (virtualList && !searched) {
        // A row scrolled out of the DOM stays highlighted, and is drawn so again when it comes back.
        const pending = pendingRef.current
        const held = named(heldValue)
        if (pending) seek(shown, virtualList, context, pending.index, pending.step)
        else if (held) markHighlighted(held)
        else if (heldValue !== '') inputRef.current?.removeAttribute('aria-activedescendant')
        else highlight((!mounted.current && named(defaultValue)) || first)
      } else if (value !== undefined) {
        pendingRef.current = null
        const held = named(value)
        markHighlighted(held)
        // An owner clearing the highlight to '' means none, where a value naming no shown row asks for the first.
        const cleared = value === '' && mounted.current && lastValue.current !== ''
        if (searched || (!held && !cleared)) highlight(first)
      } else {
        pendingRef.current = null
        const current = highlightedRef.current
        if (searched || !current || !choices.includes(current)) {
          highlight((!mounted.current && named(defaultValue)) || first)
        }
      }
      mounted.current = true
      lastValue.current = value
    }, [
      search,
      shouldFilter,
      filter,
      value,
      defaultValue,
      limit,
      version,
      getItems,
      order,
      filteredOut,
      forcedGroups,
      highlight,
      markHighlighted,
      highlightedRef,
      store,
      virtualRef,
      pendingRef,
      context,
    ])

    return (
      <CommandListProvider
        scope={__scopeCommand}
        onItemLeave={handleItemLeave}
        listRef={listRef}
        emptyRef={emptyRef}
        setSize={virtual?.count}>
        <Collection.Slot scope={__scopeCommand}>
          <Primitive.ul data-slot="command-list" role="listbox" id={context.listId} {...listProps} ref={composedRef} />
        </Collection.Slot>
      </CommandListProvider>
    )
  },
)

CommandList.displayName = LIST_NAME
