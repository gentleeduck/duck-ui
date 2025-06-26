import React from 'react'
import { DialogContext } from './_dialog'
import { cleanLockScrollbar, lockScrollbar } from './dialog.libs'
import type { DialogContextType, DialogProps } from './dialog.types'

export function useDialogContext(name: string = 'Dialog'): DialogContextType {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error(`useDialogContext must be used within a ${name}`)
  }
  return context
}

export function useDialog({
  openProp,
  onOpenChange,
  lockScroll,
  hoverable,
  modal,
  skipDelayDuration,
  delayDuration,
}: DialogProps) {
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
      console.warn('Dialog failed to toggle', e)
    }

    setOpen(state)
    onOpenChange?.(state)
  }

  React.useEffect(() => {
    const dialog = dialogRef.current
    const trigger = triggerRef.current

    if (lockScroll) lockScrollbar(open)

    if (openProp !== undefined && openProp !== open) {
      handleOpenChange(openProp)
    }

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
      ;[trigger, dialog].forEach((elm) => {
        elm?.addEventListener('mouseover', openAfterDelay)
        elm?.addEventListener('mouseout', closeAfterDelay)
      })
    }

    return () => {
      dialog?.removeEventListener('close', handleClose)
      if (!modal) {
        dialog?.removeEventListener('beforetoggle', handleClose)
      }
      if (hoverable) {
        ;[trigger, dialog].forEach((elm) => {
          elm?.removeEventListener('mouseover', openAfterDelay)
          elm?.removeEventListener('mouseout', closeAfterDelay)
        })
      }
      cleanLockScrollbar()
    }
  }, [open, openProp, lockScroll, hoverable, delayDuration, skipDelayDuration, onOpenChange, modal])

  return {
    triggerRef,
    ref: dialogRef,
    open,
    onOpenChange: handleOpenChange,
  }
}
