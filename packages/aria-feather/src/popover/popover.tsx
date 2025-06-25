import React from "react"
import { Slot } from "../slot"
import { DialogProps, Root as DialogRoot, useDialogContext } from "../dialog"

/**
 * Popover component that provides a context for managing its open state and
 * behavior. It uses a ref to handle the underlying HTMLPopoverElement.
 */
export function Root({ lockScroll = false, hoverable = true, modal= false,...props }: DialogProps): React.JSX.Element {
  return (
    <DialogRoot {...props} modal={modal} lockScroll={lockScroll} hoverable={hoverable} />
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
  const { onOpenChange, open: _open, id, triggerRef } = useDialogContext()

  return (
    <Slot
      ref={triggerRef}
      aria-haspopup="dialog"
      aria-controls={id}
      popoverTarget={id}
      style={{ '--position-anchor': `--${id}`, 'anchorName': 'var(--position-anchor)' } as React.CSSProperties}
      onClick={(e) => {
        onOpenChange(open ?? !_open)
        onClick?.(e)
      }}
      {...props}
    />
  )
}
