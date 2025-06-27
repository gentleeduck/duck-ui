import React from 'react'
import { DropdownMenuContext } from './_dropdown-menu'
import { initRefs } from './dropdown-menu.libs'

export const useDropdownMenuContext = () => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('useDropdownMenuContext must be used within a DropdownMenu')
  }
  return context
}

export function useDropdownMenuInit(open: boolean, onOpenChange?: (open: boolean) => void) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const groupsRef = React.useRef<HTMLDivElement[]>([])
  const itemsRef = React.useRef<HTMLLIElement[]>([])
  const originalItemsRef = React.useRef<HTMLLIElement[]>([])
  const selectedItemRef = React.useRef<HTMLLIElement | null>(null)

  React.useEffect(() => {
    contentRef.current?.setAttribute('data-open', String(open))
  }, [open])

  React.useEffect(() => {
    initRefs(groupsRef, wrapperRef, selectedItemRef, itemsRef, originalItemsRef, triggerRef, contentRef)
    function handleClick() {
      const open = contentRef.current?.getAttribute('data-open') === 'true'

      if (!groupsRef.current.length || !itemsRef.current.length) {
        initRefs(groupsRef, wrapperRef, selectedItemRef, itemsRef, originalItemsRef, triggerRef, contentRef)
      }

      if (onOpenChange) onOpenChange(!open)
      contentRef.current?.setAttribute('data-open', String(!open))
      triggerRef.current?.setAttribute('data-open', String(!open))
    }

    triggerRef.current?.addEventListener('click', handleClick)
    return () => {
      triggerRef.current?.removeEventListener('click', handleClick)
    }
  }, [])

  //TODO: clear the listeners
  //TODO: handle the close
  // overlayRef.current?.addEventListener('click', () => {
  //   contentRef.current?.setAttribute('data-open', 'false')
  // })
  return {
    wrapperRef,
    triggerRef,
    contentRef,
    overlayRef,
    groupsRef,
    itemsRef,
    originalItemsRef,
    selectedItemRef,
  }
}
