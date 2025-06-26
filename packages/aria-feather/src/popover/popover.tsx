import type React from 'react'
import { type DialogProps, Root as DialogRoot } from '../dialog'

/**
 * Popover component that provides a context for managing its open state and
 * behavior. It uses a ref to handle the underlying HTMLPopoverElement.
 */
export function Root({
  lockScroll = false,
  hoverable = true,
  modal = false,
  ...props
}: DialogProps): React.JSX.Element {
  return <DialogRoot {...props} modal={modal} lockScroll={lockScroll} hoverable={hoverable} />
}
