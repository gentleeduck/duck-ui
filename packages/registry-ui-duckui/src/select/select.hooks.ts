import React from 'react'
import { initRefs } from './select.libs'
import { dstyleItem, styleItem } from '../command'

export function useSelectInit(open: boolean, onOpenChange?: (open: boolean) => void) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const groupsRef = React.useRef<HTMLUListElement[]>([])
  const [selectedItem, setSelectedItem] = React.useState<HTMLLIElement | null>(null)
  const itemsRef = React.useRef<HTMLLIElement[]>([])
  const selectedItemRef = React.useRef<HTMLLIElement | null>(null)

  React.useEffect(() => {
    setTimeout(() => {
      initRefs(groupsRef, wrapperRef, triggerRef, contentRef, selectedItemRef, itemsRef, setSelectedItem)
      console.log(selectedItemRef)
    }, 0)
    triggerRef.current?.setAttribute('data-open', String(open))
    contentRef.current?.setAttribute('data-open', String(open))
  }, [open])

  React.useEffect(() => {
    setTimeout(() => {
      initRefs(groupsRef, wrapperRef, triggerRef, contentRef, selectedItemRef, itemsRef, setSelectedItem)

      triggerRef.current?.addEventListener('click', () => {
        const open = contentRef.current?.getAttribute('data-open') === 'true'

        if (!groupsRef.current.length || !itemsRef.current.length) {
          initRefs(groupsRef, wrapperRef, triggerRef, contentRef, selectedItemRef, itemsRef, setSelectedItem)
        }

        if (onOpenChange) onOpenChange(!open)
        contentRef.current?.setAttribute('data-open', String(!open))
        triggerRef.current?.setAttribute('data-open', String(!open))
      })
    }, 0)
  }, [])

  return {
    wrapperRef,
    triggerRef,
    contentRef,
    groupsRef,
    itemsRef,
    selectedItem,
    selectedItemRef,
  }
}

export function useSelectScroll(
  open: boolean,
  itemsRef: React.RefObject<HTMLLIElement[]>,
  selectedItemRef: React.RefObject<HTMLLIElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
) {
  React.useEffect(() => {
    if (!open) return
    const keyDown = contentRef.current?.querySelector<HTMLDivElement>('[duck-select-scroll-down-button]')
    const keyUp = contentRef.current?.querySelector<HTMLDivElement>('[duck-select-scroll-up-button]')
    if (!keyDown || !keyUp) return

    let intervalId: NodeJS.Timeout | null = null

    const moveSelectionDown = () => {
      if (!itemsRef.current || !selectedItemRef.current) return

      const currentIndex = itemsRef.current.findIndex((item) => item.id === selectedItemRef.current?.id)
      if (currentIndex === -1) return

      const nextIndex = Math.min(currentIndex + 1, itemsRef.current.length - 1)
      selectedItemRef.current = itemsRef.current[nextIndex]!

      selectedItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }

    const moveSelectionUp = () => {
      if (!itemsRef.current || !selectedItemRef.current) return

      const currentIndex = itemsRef.current.findIndex((item) => item.id === selectedItemRef.current?.id)
      if (currentIndex === -1) return

      const prevIndex = Math.max(currentIndex - 1, 0)
      selectedItemRef.current = itemsRef.current[prevIndex]!

      selectedItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }

    const startInterval = (fn: () => void) => {
      stopInterval()
      fn()
      intervalId = setInterval(fn, 40)
    }

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    keyDown.addEventListener('mouseenter', () => startInterval(moveSelectionDown))
    keyDown.addEventListener('mouseleave', stopInterval)

    keyUp.addEventListener('mouseenter', () => startInterval(moveSelectionUp))
    keyUp.addEventListener('mouseleave', stopInterval)

    return () => {
      keyDown.removeEventListener('mouseenter', () => startInterval(moveSelectionDown))
      keyDown.removeEventListener('mouseleave', stopInterval)

      keyUp.removeEventListener('mouseenter', () => startInterval(moveSelectionUp))
      keyUp.removeEventListener('mouseleave', stopInterval)

      stopInterval()
    }
  }, [open])
}
