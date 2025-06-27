import { useStableId } from '@gentleduck/hooks'
import type React from 'react'
import { ShouldRender } from '../dialog'
import { Slot } from '../slot'
import { PopoverContext, usePopover, usePopoverContext } from './popover.hooks'
import { PopoverContentProps, PopoverRootProps } from './popover.types'

/**
 * Popover component that provides a context for managing its open state and
 * behavior. It uses a ref to handle the underlying HTMLPopoverElement.
 */
export function Root({
  children,
  open: openProp,
  onOpenChange,
  lockScroll = false,
  hoverable = false,
  modal = false,
  closeButton = false,
  skipDelayDuration = 300,
  delayDuration = 0,
}: PopoverRootProps): React.JSX.Element {
  const {
    open,
    onOpenChange: _onOpenChange,
    ref,
    triggerRef,
  } = usePopover({
    open: openProp,
    onOpenChange,
    lockScroll,
    hoverable,
    modal,
    skipDelayDuration,
    delayDuration,
  })
  const id = useStableId()

  return (
    <PopoverContext.Provider
      value={{
        delayDuration,
        skipDelayDuration,
        open,
        onOpenChange: _onOpenChange,
        ref,
        triggerRef,
        id,
        modal,
        closeButton,
        hoverable,
        lockScroll,
      }}>
      {children}
    </PopoverContext.Provider>
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
  const { onOpenChange, open: _open, id, triggerRef } = usePopoverContext()

  return (
    <Slot
      popoverTarget={id}
      style={
        {
          '--position-anchor': `--${id}`,
          anchorName: 'var(--position-anchor)',
        } as React.CSSProperties
      }
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
  overlay = 'nothing',
  closedby = 'any',
  dialogClose,
  animation = 'default',
  sideOffset = 4,
  alignOffset = 0,
  side = 'top',
  align = 'center',
  ...props
}: PopoverContentProps) {
  const { ref, closeButton, open, id } = usePopoverContext()
  const DialogClose = dialogClose

  // Main axis margin based on `side`
  const sideMargins: Partial<CSSStyleDeclaration> =
    {
      top: { marginBottom: `${sideOffset}px` },
      bottom: { marginTop: `${sideOffset}px` },
      left: { marginRight: `${sideOffset}px` },
      right: { marginLeft: `${sideOffset}px` },
      inset: {},
    }[side] ?? {}

  // Cross-axis margin based on `align`
  const alignMargins: Partial<CSSStyleDeclaration> =
    side === 'top' || side === 'bottom'
      ? ({
          start: { marginLeft: `${alignOffset}px` },
          end: { marginRight: `${alignOffset}px` },
          center: {},
        }[align as 'start' | 'end' | 'center'] ?? {})
      : side === 'left' || side === 'right'
        ? ({
            start: { marginTop: `${alignOffset}px` },
            end: { marginBottom: `${alignOffset}px` },
            center: {},
          }[align as 'start' | 'end' | 'center'] ?? {})
        : {}

  const style = {
    '--position-anchor': `--${id}`,
    ...sideMargins,
    ...alignMargins,
  } as React.CSSProperties

  return (
    <dialog popover="auto" style={style} className={className} {...{ ...props, closedby }} id={id} ref={ref}>
      <ShouldRender ref={ref} once={renderOnce} open={open}>
        {children}
        {closeButton && <DialogClose />}
      </ShouldRender>
    </dialog>
  )
}

export default {
  Root,
  Trigger,
  Content,
}
