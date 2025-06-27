import React from 'react'
import { DialogContext } from './dialog'
import { cleanLockScrollbar, lockScrollbar } from './dialog.libs'
import type { DialogContextType, DialogProps } from './dialog.types'

export function useDialogContext(name: string = 'Dialog'): DialogContextType {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error(`useDialogContext must be used within a ${name}`)
  }
  return context
}

export function useDialog({ open: openProp, onOpenChange, lockScroll, modal }: DialogProps) {
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
        state ? dialog.show() : dialog.close()
      }
    } catch (e) {
      console.warn('Dialog failed to toggle', e)
    }

    setOpen(state)
    onOpenChange?.(state)
  }

  React.useEffect(() => {
    const dialog = dialogRef.current

    if (lockScroll) lockScrollbar(open)

    if (openProp) {
      handleOpenChange(true)
    } else if (openProp === false) {
      handleOpenChange(false)
    }

    function handleClose() {
      handleOpenChange(false)
    }

    dialog?.addEventListener('close', handleClose)

    return () => {
      dialog?.removeEventListener('close', handleClose)
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
