import { useComputedTimeoutTransition, useStableId } from '@gentleduck/hooks'
import { apply as applyClosedBy, isSupported as isClosedBySupported } from 'dialog-closedby-polyfill'
import { apply as applyInvokers, isSupported as isInvokersSupported } from 'invokers-polyfill/fn'
import React from 'react'
import { Slot } from '../slot'
import { useDialog, useDialogContext } from './dialog.hooks'
import type { DialogContentProps, DialogContextType, DialogProps } from './dialog.types'

if (!isClosedBySupported()) {
  applyClosedBy()
}

if (!isInvokersSupported()) {
  applyInvokers()
}

/**
 * Context for managing the open state of the dialog.
 */
export const DialogContext = React.createContext<DialogContextType | null>(null)

/**
 * Dialog component that provides a context for managing its open state and
 * behavior. It uses a ref to handle the underlying HTMLDialogElement.
 */
export function Root({
  children,
  open: openProp,
  onOpenChange,
  lockScroll = true,
  modal = true,
  closeButton = false,
}: DialogProps): React.JSX.Element {
  const {
    open,
    onOpenChange: _onOpenChange,
    ref,
    triggerRef,
  } = useDialog({
    open: openProp,
    onOpenChange,
    lockScroll,
    modal,
  })
  const id = useStableId()

  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange: _onOpenChange,
        ref,
        triggerRef,
        id,
        modal,
        closeButton,
        lockScroll,
      }}>
      {children}
    </DialogContext.Provider>
  )
}

export function Trigger({
  onClick,
  open,
  ...props
}: React.ComponentPropsWithRef<typeof Slot> & {
  open?: boolean
}): React.JSX.Element {
  const { onOpenChange, open: _open, id, triggerRef } = useDialogContext()

  return (
    <Slot
      ref={triggerRef as React.RefObject<HTMLDivElement>}
      aria-haspopup="dialog"
      aria-controls={id}
      onClick={(e) => {
        onOpenChange(open ?? !_open)
        onClick?.(e)
      }}
      {...props}
    />
  )
}

export function Content({
  children,
  className,
  renderOnce = true,
  overlay = 'default',
  closedby = 'any',
  dialogClose,

  animation = 'default',
  ...props
}: DialogContentProps) {
  const { ref, closeButton, open, id } = useDialogContext()
  const prop = { props, closedby }
  const DialogClose = dialogClose

  return (
    <dialog className={className} {...prop} id={id} ref={ref}>
      <ShouldRender ref={ref} once={renderOnce} open={open}>
        {children}
        {closeButton && <DialogClose />}
      </ShouldRender>
    </dialog>
  )
}

export function ShouldRender({
  once = false,
  open = false,
  children,
  ref,
}: {
  once?: boolean
  open?: boolean
  children?: React.ReactNode
  ref?: React.RefObject<HTMLDialogElement | null>
}) {
  const [_shouldRender, setShouldRender] = React.useState<boolean>(false)
  const [isVisible, setIsVisible] = React.useState<boolean>(false)
  const shouldRender = once ? _shouldRender : open

  React.useEffect(() => {
    if (open && once) {
      setShouldRender(true)
    }
    if (shouldRender) {
      setIsVisible(true)
    } else {
      const element = ref?.current
      if (element) {
        useComputedTimeoutTransition(element, () => {
          setIsVisible(false)
        })
      }
    }
  }, [shouldRender, ref, open, once])

  if (!shouldRender && !isVisible) return null

  return children
}
