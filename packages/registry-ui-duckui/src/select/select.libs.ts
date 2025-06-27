import { dstyleItem, handleItemsSelection, styleItem } from '../command'

export function initRefs(
  groupsRef: React.RefObject<HTMLUListElement[] | null>,
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  triggerRef: React.RefObject<HTMLDivElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
  selectedItemRef: React.RefObject<HTMLLIElement | null>,
  itemsRef: React.RefObject<HTMLLIElement[]>,
  setSelectedItem: (item: HTMLLIElement) => void,
) {
  const items = wrapperRef.current?.querySelectorAll('[duck-select-item]') as never as HTMLLIElement[]
  const groups = wrapperRef.current?.querySelectorAll('[duck-select-group]') as never as HTMLUListElement[]

  itemsRef.current = Array.from(items)
  groupsRef.current = Array.from(groups)

  const item = itemsRef.current?.[0] as HTMLLIElement
  // console.log(itemsRef.current)
  // styleItem(item ?? null)
  // item?.focus()
  selectedItemRef.current = item

  // for (let i = 0; i < itemsRef.current?.length; i++) {
  //   const item = itemsRef.current[i] as HTMLLIElement
  //
  //   item.addEventListener('mouseover', () => {
  //     if (item.hasAttribute('aria-checked')) return
  //     dstyleItem?.(item)
  //     item?.blur()
  //   })
  //
  //   item.addEventListener('click', () => {
  //     const currentItem = itemsRef.current?.findIndex((_item) => _item.id === item.id)
  //     handleItemsSelection(currentItem, itemsRef, (value) => setSelectedItem(value))
  //     wrapperRef.current?.querySelector('[duck-select-value]')?.setHTMLUnsafe(item.children[0]?.getHTML() ?? '')
  //     item.setAttribute('aria-checked', 'true')
  //     triggerRef.current?.setAttribute('data-open', 'false')
  //     contentRef.current?.setAttribute('data-open', 'false')
  //   })
  // }
}
