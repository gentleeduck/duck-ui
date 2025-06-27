import React from 'react'
import { cleanLockScrollbar, lockScrollbar } from '../dialog/dialog.libs'
import type { PopoverContextType } from './popover.types'
import { PopoverProps } from './popover.types'

export const PopoverContext = React.createContext<PopoverContextType | null>(null)

export function usePopoverContext(name: string = 'Popover'): PopoverContextType {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error(`usePopoverContext must be used within a ${name}`)
  }
  return context
}

export function usePopover({
  open: openProp,
  onOpenChange,
  lockScroll,
  modal,
  hoverable,
  skipDelayDuration,
  delayDuration,
}: PopoverProps) {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null)
  const triggerRef = React.useRef<HTMLElement | HTMLButtonElement | null>(null)
  const [open, setOpen] = React.useState<boolean>(openProp ?? false)

  function handleOpenChange(state: boolean) {
    const dialog = dialogRef.current
    if (!dialog) return

    try {
      if (modal) {
        state ? dialog.showModal() : dialog.close()
      } else {
        requestAnimationFrame(() => {
          state ? dialog.showPopover() : dialog.hidePopover()
        })
      }
    } catch (e) {
      console.warn('Popover failed to toggle', e)
    }

    setOpen(state)
    onOpenChange?.(state)
  }

  React.useEffect(() => {
    const dialog = dialogRef.current
    const trigger = triggerRef.current

    if (lockScroll) lockScrollbar(open)

    if (openProp) {
      handleOpenChange(true)
    } else if (openProp === false) {
      handleOpenChange(false)
    }

    // FIX:
    function handleClose(event) {
      if (modal) {
        handleOpenChange(false)
      } else {
        const newState = event.newState === 'open'
        handleOpenChange(newState)
      }
    }

    dialog?.addEventListener('close', handleClose)
    if (!modal) {
      dialog?.addEventListener('beforetoggle', handleClose)
    }

    let openTimer = null
    let closeTimer = null

    function openAfterDelay() {
      clearTimeout(closeTimer)
      openTimer = setTimeout(() => handleOpenChange(true), delayDuration)
    }

    function closeAfterDelay() {
      clearTimeout(openTimer)
      closeTimer = setTimeout(() => handleOpenChange(false), skipDelayDuration)
    }

    if (hoverable) {
      for (const elm of [trigger, dialog]) {
        elm?.addEventListener('mouseover', openAfterDelay)
        elm?.addEventListener('mouseout', closeAfterDelay)
      }
    }

    return () => {
      dialog?.removeEventListener('close', handleClose)
      if (!modal) {
        dialog?.removeEventListener('beforetoggle', handleClose)
      }
      if (hoverable) {
        for (const elm of [trigger, dialog]) {
          elm?.removeEventListener('mouseover', openAfterDelay)
          elm?.removeEventListener('mouseout', closeAfterDelay)
        }
      }
      cleanLockScrollbar()
    }
  }, [open, openProp, onOpenChange])

  return {
    triggerRef,
    ref: dialogRef,
    open,
    onOpenChange: handleOpenChange,
  }
}
