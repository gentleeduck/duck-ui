import * as React from 'react'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { getRootActiveElement, wrapArray } from './shared-utils'

export const NAVIGATION_KEYS = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'] as const

function focusItem(item: HTMLElement) {
  item.scrollIntoView({ block: 'nearest' })
  item.focus({ preventScroll: true })
}

/** Ordered arrow-key candidates: reversed for Up, End and PageDown, sliced past current for Up/Down. */
export function getNavigationCandidates(
  items: HTMLElement[],
  key: string,
  activeElement: Element | null,
): HTMLElement[] {
  let candidates = items.slice()
  if (key === 'ArrowUp' || key === 'End' || key === 'PageDown') {
    candidates = candidates.reverse()
  }
  if (key === 'ArrowUp' || key === 'ArrowDown') {
    const currentIndex = candidates.indexOf(activeElement as HTMLElement)
    candidates = candidates.slice(currentIndex + 1)
  }
  return candidates
}

/**
 * Find next typeahead match. Repeated chars (e.g. 'aaa') collapse to one char, and a single char searches from
 * the item after currentItem, so typing it again cycles through the items it starts.
 */
export function findNextItem<T extends { textValue: string }>(items: T[], search: string, currentItem?: T) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0])
  // biome-ignore lint/style/noNonNullAssertion: search.length > 1 guarantees search[0] exists when isRepeated is true
  const normalizedSearch = isRepeated ? search[0]! : search
  const currentItemIndex = currentItem ? items.indexOf(currentItem) : -1
  let wrappedItems = wrapArray(items, Math.max(currentItemIndex, 0))
  if (normalizedSearch.length === 1) wrappedItems = wrappedItems.filter((v) => v !== currentItem)
  const nextItem = wrappedItems.find((item) => item.textValue.toLowerCase().startsWith(normalizedSearch.toLowerCase()))
  return nextItem !== currentItem ? nextItem : undefined
}

/**
 * Typeahead search with 1s auto-reset. Returns [searchRef, handleTypeaheadSearch, reset].
 * `externalSearchRef` lets callers share state via context. `onSearchChange` may return
 * a replacement string to store (used for fallback-to-last-key behavior).
 */
export function useTypeaheadSearch(
  onSearchChange: (search: string, key: string) => string | undefined,
  externalSearchRef?: React.RefObject<string>,
) {
  const handleSearchChange = useCallbackRef(onSearchChange)
  const internalSearchRef = React.useRef('')
  const searchRef = externalSearchRef ?? internalSearchRef
  const timerRef = React.useRef(0)

  const clearSearchLater = React.useCallback(() => {
    window.clearTimeout(timerRef.current)
    if (searchRef.current === '') return
    timerRef.current = window.setTimeout(() => {
      searchRef.current = ''
    }, 1000)
  }, [searchRef])

  const handleTypeaheadSearch = React.useCallback(
    (key: string) => {
      const search = searchRef.current + key
      const nextSearch = handleSearchChange(search, key)
      searchRef.current = typeof nextSearch === 'string' ? nextSearch : search
      clearSearchLater()
    },
    [handleSearchChange, searchRef, clearSearchLater],
  )

  const resetTypeahead = React.useCallback(() => {
    searchRef.current = ''
    window.clearTimeout(timerRef.current)
  }, [searchRef])

  // StrictMode replays the cleanup on a list that stays mounted, so a search typed before the replay is timed again.
  React.useEffect(() => {
    clearSearchLater()
    return () => window.clearTimeout(timerRef.current)
  }, [clearSearchLater])

  return [searchRef, handleTypeaheadSearch, resetTypeahead] as const
}

interface ITypeaheadListState {
  activeElement: Element | null
  lastMatchedElement: HTMLElement | null
}

interface ITypeaheadListNavigationOptions<T> {
  /** Candidates to search; callers must pre-filter disabled/hidden items. */
  getItems: () => T[]
  getItemElement: (item: T) => HTMLElement | null
  /** Searchable text; empty strings are skipped. */
  getItemTextValue: (item: T) => string
  onMatch: (item: T) => void
  /** Override current-item (e.g. SelectTrigger uses selected value instead of focus). */
  getCurrentItem?: (items: T[], state: ITypeaheadListState) => T | undefined
  /** Share typeahead state via context. */
  externalSearchRef?: React.RefObject<string>
}

/**
 * Typeahead list navigation. Falls back to latest key when no item, the current one included, matches the search,
 * and tracks last matched element so consecutive keys stay stable across async focus shifts.
 */
export function useTypeaheadListNavigation<T>(options: ITypeaheadListNavigationOptions<T>) {
  const lastMatchedRefObject = React.useRef<HTMLElement | null>(null)

  const [searchRef, handleTypeaheadSearch, resetTypeahead] = useTypeaheadSearch((search, key) => {
    const items = options.getItems()
    const searchableItems = items
      .map((item) => ({
        item,
        textValue: options.getItemTextValue(item).trim(),
      }))
      .filter((entry) => entry.textValue !== '')

    if (searchableItems.length === 0) return ''

    const element = searchableItems.map((entry) => options.getItemElement(entry.item)).find(Boolean)
    const state: ITypeaheadListState = {
      activeElement: getRootActiveElement(element ?? document),
      lastMatchedElement: lastMatchedRefObject.current,
    }

    const itemAt = (target: Element | null) =>
      target ? searchableItems.find((entry) => options.getItemElement(entry.item) === target)?.item : undefined
    const defaultCurrentItem = itemAt(state.activeElement) ?? itemAt(state.lastMatchedElement)

    const currentItem =
      options.getCurrentItem?.(
        searchableItems.map((entry) => entry.item),
        state,
      ) ?? defaultCurrentItem

    const currentEntry = currentItem ? searchableItems.find((entry) => entry.item === currentItem) : undefined

    let nextEntry = findNextItem(searchableItems, search, currentEntry)
    let effectiveSearch = search
    const currentMatches = currentEntry?.textValue.toLowerCase().startsWith(search.toLowerCase())

    if (!nextEntry && search.length > 1 && !currentMatches) {
      effectiveSearch = key
      nextEntry = findNextItem(searchableItems, effectiveSearch, currentEntry)
    }

    if (nextEntry) {
      lastMatchedRefObject.current = options.getItemElement(nextEntry.item)
      options.onMatch(nextEntry.item)
    }

    return effectiveSearch
  }, options.externalSearchRef)

  const resetTypeaheadState = React.useCallback(() => {
    resetTypeahead()
    lastMatchedRefObject.current = null
  }, [resetTypeahead])

  return [searchRef, handleTypeaheadSearch, resetTypeaheadState] as const
}

interface IVimNavigationOptions {
  onNavigate: () => void
  ggTimeoutMs?: number
}

/**
 * Vim-style list bindings: `gg` (two g within ggTimeoutMs) -> first item, `G` -> last item.
 * Handler returns true when a command fired (caller must skip typeahead/nav). The first
 * `g` returns false so typeahead still fires on items starting with 'g'.
 */
export function useVimNavigation(options: IVimNavigationOptions) {
  const { ggTimeoutMs = 300 } = options
  const lastGPressRef = React.useRef(0)
  const onNavigate = useCallbackRef(options.onNavigate)

  const handleVimKey = React.useCallback(
    (event: KeyboardEvent | React.KeyboardEvent, items: HTMLElement[]): boolean => {
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return false
      if (event.ctrlKey || event.altKey || event.metaKey) {
        lastGPressRef.current = 0
        return false
      }

      if (event.key === 'G' && event.shiftKey) {
        lastGPressRef.current = 0
        event.preventDefault()
        onNavigate()
        setTimeout(() => focusItem(last))
        return true
      }

      if (event.key === 'g' && !event.shiftKey) {
        const now = Date.now()
        if (now - lastGPressRef.current < ggTimeoutMs) {
          lastGPressRef.current = 0
          event.preventDefault()
          onNavigate()
          setTimeout(() => focusItem(first))
          return true
        }
        lastGPressRef.current = now
        return false
      }

      // any other key cancels pending `g`
      lastGPressRef.current = 0
      return false
    },
    [ggTimeoutMs, onNavigate],
  )

  return handleVimKey
}
