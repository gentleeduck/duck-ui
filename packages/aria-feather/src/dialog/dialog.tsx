import React from 'react'
import { Slot } from '../slot'
import { useDialog, useDialogContext } from './dialog.hooks'
import { DialogContextType, DialogProps } from './dialog.types'
import { useComputedTimeoutTransition } from '@gentleduck/hooks'


/**
 * Context for managing the open state of the dialog.
 *
 */
export const DialogContext = React.createContext<DialogContextType | null>(null)

/**
 * Dialog component that provides a context for managing its open state and
 * behavior. It uses a ref to handle the underlying HTMLDialogElement.
 */
export function Root({ children, open: openProp, onOpenChange }: DialogProps): React.JSX.Element {
  const { open, onOpenChange: _onOpenChange, ref } = useDialog(openProp, onOpenChange)

  return (
    <DialogContext.Provider
      value={{
        open: open,
        onOpenChange: _onOpenChange,
        ref,
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
  asChild?: boolean
}): React.JSX.Element {
  const { onOpenChange, open: _open } = useDialogContext()

  return (
    <Slot
      onClick={(e) => {
        onOpenChange(open ?? !_open)
        onClick?.(e)
      }}
      {...props}
    />
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

export default {
  Root,
  Trigger,
}
