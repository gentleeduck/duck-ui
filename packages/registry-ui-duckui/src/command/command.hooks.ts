import React from 'react'
import { CommandContextType, CommandRefsContextType } from './command.types'
import { CommandContext, CommandRefsContext } from './command'
import { dstyleItem, handleItemsSelection, styleItem } from './command.libs'

/**
 * Custom hook to access the CommandContext.
 *
 * @function useCommandContext
 * @returns {CommandContextType} The command context value.
 * @throws Will throw an error if the hook is used outside of a CommandProvider.
 */
export function useCommandContext(): CommandContextType {
  const context = React.useContext(CommandContext)
  if (!context) {
    throw new Error('useCommandContext must be used within a CommandProvider')
  }
  return context
}

/**
 * Custom hook to access the CommandRefsContext.
 *
 * @function useCommandRefsContext
 * @returns {CommandRefsContextType} The command refs context value.
 * @throws Will throw an error if the hook is used outside of a CommandProvider.
 */
export function useCommandRefsContext(): CommandRefsContextType {
  const context = React.useContext(CommandRefsContext)
  if (!context) {
    throw new Error('useCommandContext must be used within a CommandProvider')
  }
  return context
}

export function useCommandElements(
  commandRef: React.RefObject<HTMLDivElement | null>,
  setSelectedItem: React.Dispatch<React.SetStateAction<HTMLLIElement | null>>,
) {
  const items = React.useRef<HTMLLIElement[]>([])
  const filteredItems = React.useRef<HTMLLIElement[]>([])
  const groups = React.useRef<HTMLDivElement[]>([])

  React.useEffect(() => {
    if (!commandRef.current) return
    const _items = commandRef.current.querySelectorAll('li[duck-command-item]')
    const _groups = commandRef.current.querySelectorAll('div[duck-command-group]')
    items.current = Array.from(_items) as HTMLLIElement[]
    groups.current = Array.from(_groups) as HTMLDivElement[]
    filteredItems.current = items.current

    const item = items.current?.[0] as HTMLLIElement

    styleItem(item ?? null)
    item?.focus()
    setSelectedItem(item ?? null)
  }, [])

  return { items, groups, filteredItems }
}

export function useCommandSearch(
  items: React.RefObject<HTMLLIElement[]>,
  search: string,
  setSelectedItem: React.Dispatch<React.SetStateAction<HTMLLIElement | null>>,
  emptyRef: React.RefObject<HTMLHeadingElement | null>,
  commandRef: React.RefObject<HTMLDivElement | null>,
  groups: React.RefObject<HTMLDivElement[]>,
  filteredItems: React.RefObject<HTMLLIElement[]>,
): void {
  React.useEffect(() => {
    if (!commandRef.current || items.current.length === 0) return
    const itemsHidden = new Map<string, HTMLLIElement>()

    // Hiding the items that don't match the search query
    for (let i = 0; i < items.current.length; i++) {
      const item = items.current[i] as HTMLLIElement

      if (item.textContent?.toLowerCase().includes(search.toLowerCase())) {
        item.classList.remove('hidden')
      } else {
        item.classList.add('hidden')
        item.removeAttribute('aria-selected')
        itemsHidden.set(i.toString(), item)
      }
    }

    // Toggling the empty message if all items are hidden
    if (itemsHidden.size === items.current.length) {
      emptyRef.current?.classList.remove('hidden')
      setSelectedItem(null)
    } else {
      emptyRef.current?.classList.add('hidden')
      setSelectedItem(items.current[0] as HTMLLIElement)
    }

    // Setting filteredItems to the items that are not hidden
    filteredItems.current = Array.from(commandRef.current.querySelectorAll('li[duck-command-item]:not(.hidden)'))

    // Clearing all the classes from the items
    filteredItems.current.map((item) => dstyleItem(item))

    // Toggling the groups if they have no items
    for (let i = 0; i < groups.current.length; i++) {
      const group = groups.current[i] as HTMLDivElement
      const groupItems = group.querySelectorAll('li[duck-command-item]:not(.hidden)') as NodeListOf<HTMLLIElement>
      const nextSeparator = group.nextElementSibling
      const hasSeparator = nextSeparator?.hasAttribute('duck-command-separator')

      if (groupItems.length === 0) {
        group.classList.add('hidden')
        // Hiding the separator if the group has no items
        if (hasSeparator && nextSeparator) nextSeparator.classList.add('hidden')
      } else {
        group.classList.remove('hidden')
        // Showing the separator if the group has items
        if (hasSeparator && nextSeparator) nextSeparator.classList.remove('hidden')
      }
    }

    const item = filteredItems.current?.[0] as HTMLLIElement
    styleItem(item ?? null)
    item?.focus()
    setSelectedItem(item ?? null)
  }, [search])
}

export function useHandleKeyDown(
  open: boolean,
  itemsRef: React.RefObject<HTMLLIElement[]>,
  setSelectedItem: (item: HTMLLIElement) => void,
  originalItemsRef: React.RefObject<HTMLLIElement[]>,
  triggerRef: React.RefObject<HTMLButtonElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
  onOpenChange?: (open: boolean) => void,
  allowAxisArrowKeys = false,
) {
  React.useEffect(() => {
    if (!open) return
    const html = document.documentElement
    let originalCurrentItem = 0
    let currentItem = 0
    let inSubMenu = false
    let firstOpen = true
    console.log(open)

    if (firstOpen) {
      firstOpen = false
      setTimeout(() => {
        handleItemsSelection(currentItem, itemsRef, setSelectedItem)
      }, 0)
    }
    function handleKeyDown(e: KeyboardEvent) {
      let isClicked = false
      if (e.key === 'ArrowDown') {
        const itemIndex = currentItem === itemsRef.current.length - 1 ? 0 : currentItem + 1
        currentItem = itemIndex
        isClicked = true
        if (!inSubMenu) originalCurrentItem = itemIndex
      } else if (e.key === 'ArrowUp') {
        const itemIndex = currentItem === 0 ? itemsRef.current.length - 1 : currentItem - 1
        currentItem = itemIndex
        isClicked = true
        if (!inSubMenu) originalCurrentItem = itemIndex
      } else if (e.key === 'Enter') {
        ;(itemsRef.current[currentItem] as HTMLLIElement)?.click()
        if (onOpenChange) onOpenChange(false)
        contentRef.current?.setAttribute('data-open', 'false')
        triggerRef.current?.setAttribute('aria-open', 'false')
        isClicked = true
      }

      if (allowAxisArrowKeys) {
        if (
          (e.key === 'ArrowLeft' && html.getAttribute('dir') === 'rtl') ||
          (e.key === 'ArrowRight' && (html.getAttribute('dir') === 'ltr' || html.getAttribute('dir') === null))
        ) {
          const item = itemsRef.current[originalCurrentItem] as HTMLLIElement
          const parent = item?.parentNode as HTMLDivElement
          if (!parent?.hasAttribute('duck-dropdown-menu-sub')) return

          const subItems = Array.from(parent?.querySelectorAll('[duck-dropdown-menu-item]') as never as HTMLLIElement[])
            .splice(1, 3)
            .filter((item) => !(item.hasAttribute('disabled') || item.getAttribute('disabled') === 'true'))

          if (subItems.length <= 0) return

          item.setAttribute('data-open', 'true')
          itemsRef.current = subItems
          inSubMenu = true
          currentItem = 0
          isClicked = true
        }

        if (
          (e.key === 'ArrowRight' && html.getAttribute('dir') === 'rtl') ||
          (e.key === 'ArrowLeft' && (html.getAttribute('dir') === 'ltr' || html.getAttribute('dir') === null))
        ) {
          const subItem = itemsRef.current[currentItem] as HTMLLIElement
          subItem.removeAttribute('aria-selected')
          itemsRef.current = originalItemsRef.current.filter((item) => !item.hasAttribute('disabled'))

          const item = itemsRef.current[originalCurrentItem] as HTMLLIElement
          item?.setAttribute('data-open', 'false')

          inSubMenu = false
          currentItem = originalCurrentItem
          isClicked = true
        }
      }

      if (!isClicked) return
      handleItemsSelection(currentItem, itemsRef, setSelectedItem)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])
}
