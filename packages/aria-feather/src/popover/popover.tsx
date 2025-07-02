'use client'

import { useStableId } from '@gentleduck/hooks'
import React from 'react'
import { ShouldRender } from '../dialog'
import { Slot } from '../slot'
import { PopoverContext, usePopover, usePopoverContext } from './popover.hooks'
import { PopoverContentProps, PopoverRootProps } from './popover.types'

async function loadAnchorPolyfill() {
  // Check if the native CSS anchor positioning is supported
  if (!('anchorName' in document.documentElement.style)) {
    // Dynamically import the polyfill only when the feature is not supported
    // This avoids loading unnecessary code in modern browsers
    const { default: polyfill } = await import('@oddbird/css-anchor-positioning/fn')

    // Initialize the polyfill to enable CSS anchor positioning
    polyfill()
    console.log('anchor')
  }
}

// Invoke the function when anchor positioning support is required
loadAnchorPolyfill()

/**
 * Popover component that provides a context for managing its open state and
 * behavior. It uses a ref to handle the underlying HTMLPopoverElement.
 */
export function Root({
  children,
  open: openProp,
  onOpenChange,
  lockScroll = false,
  mouseEnter = false,
  mouseExist = false,
  modal = false,
  closeButton = false,
  skipDelayDuration = 300,
  delayDuration = 0,
  ...props
}: PopoverRootProps & React.HtmlHTMLAttributes<HTMLDivElement>): React.JSX.Element {
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const {
    open,
    onOpenChange: _onOpenChange,
    contentRef,
    triggerRef,
  } = usePopover({
    wrapperRef,
    open: openProp,
    onOpenChange,
    lockScroll,
    mouseExist,
    mouseEnter,
    modal,
    skipDelayDuration,
    delayDuration,
  })
  const id = useStableId()

  return (
    <PopoverContext.Provider
      value={{
        wrapperRef,
        triggerRef,
        contentRef,
        delayDuration,
        skipDelayDuration,
        open,
        onOpenChange: _onOpenChange,
        id,
        modal,
        closeButton,
        mouseEnter,
        mouseExist,
        lockScroll,
      }}>
      <div {...props} duck-popover="" ref={wrapperRef}>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export function Trigger(props: React.ComponentPropsWithoutRef<typeof Slot>): React.JSX.Element {
  const { id, triggerRef } = usePopoverContext()

  return (
    <Slot
      popoverTarget={id}
      style={
        {
          '--position-anchor': `--${id}`,
          anchorName: 'var(--position-anchor)',
        } as React.CSSProperties
      }
      aria-haspopup="dialog"
      aria-controls={id}
      duck-popover-trigger=""
      {...props}
      ref={triggerRef as React.RefObject<HTMLDivElement>}
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
  const { contentRef, closeButton, open, id } = usePopoverContext()
  const DialogClose = dialogClose

  // Main axis margin based on `side`
  const sideMargins: Partial<CSSStyleDeclaration> =
    {
      top: { marginBottom: `${sideOffset}px` },
      bottom: { marginTop: `${sideOffset}px` },
      left: { marginRight: `${sideOffset}px` },
      right: { marginLeft: `${sideOffset}px` },
      inset: {},
    }[side as 'top' | 'bottom' | 'left' | 'right' | 'inset'] ?? {}

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
    <dialog
      popover="auto"
      style={style}
      className={className}
      {...{ ...props, closedby }}
      id={id}
      duck-popover-content=""
      ref={contentRef}>
      <ShouldRender ref={contentRef} once={renderOnce} open={open}>
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
