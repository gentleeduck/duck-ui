'use client'

import { hideOthers } from 'aria-hidden'
import * as React from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { useDirection } from '../direction'
import { DismissableLayer } from '../dismissable-layer'
import { FocusScope, FocusScopeBranchProvider, useFocusScopeBranch, useFocusScopeBranchRegistry } from '../focus-scope'
import { useFocusGuards } from '../hooks/use-focus-guard'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { focusOn } from '../libs/focus-on'
import { getState } from '../libs/get-state'
import * as PopperPrimitive from '../popper'
import { Presence } from '../presence/presence'
import { useHeldOpen } from '../presence/presence.libs'
import { createSlot } from '../slot'
import { createPopoverContext, usePopoverContext, usePopperScope } from './popover'
import type { IPopover } from './popover.types'
import { usePortalContext } from './portal'

const CONTENT_NAME = 'PopoverContent'

const POPPER_VARIABLES = {
  '--gentleduck-popover-content-transform-origin': 'var(--gentleduck-popper-transform-origin)',
  '--gentleduck-popover-content-available-width': 'var(--gentleduck-popper-available-width)',
  '--gentleduck-popover-content-available-height': 'var(--gentleduck-popper-available-height)',
  '--gentleduck-popover-trigger-width': 'var(--gentleduck-popper-anchor-width)',
  '--gentleduck-popover-trigger-height': 'var(--gentleduck-popper-anchor-height)',
} as React.CSSProperties

export const [PopoverContentProvider, usePopoverContentContext] =
  createPopoverContext<IPopover.IContentContext>(CONTENT_NAME)

type PopoverContentElement = React.ComponentRef<typeof PopperPrimitive.PopperContent>

export const PopoverContent = React.forwardRef<PopoverContentElement, IPopover.IContentProps>(
  (props: IPopover.IScoped<IPopover.IContentProps>, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopePopover)
    const { forceMount = portalContext.forceMount, initialFocus, finalFocus, ...contentProps } = props
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover)
    const Content = context.modal ? PopoverContentModal : PopoverContentNonModal

    return (
      <Presence present={forceMount || context.open}>
        <Content
          {...contentProps}
          onOpenAutoFocus={focusOn(contentProps.onOpenAutoFocus, initialFocus)}
          onCloseAutoFocus={focusOn(contentProps.onCloseAutoFocus, finalFocus)}
          ref={forwardedRef}
        />
      </Presence>
    )
  },
)

PopoverContent.displayName = CONTENT_NAME

const Slot = createSlot('PopoverContent.RemoveScroll')

const PopoverContentModal = React.forwardRef<PopoverContentElement, IPopover.IContentTypeProps>(
  (props: IPopover.IScoped<IPopover.IContentTypeProps>, forwardedRef) => {
    const {
      trapFocus: trapFocusProp,
      disableOutsidePointerEvents: disableOutsidePointerEventsProp,
      lockScroll: lockScrollProp,
      ...restProps
    } = props
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover)
    const held = useHeldOpen(context.open)

    const [content, setContent] = React.useState<HTMLDivElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, setContent)

    const isRightClickOutsideRef = React.useRef(false)
    // A portalled layer inside, such as a select's content, takes focus as part of this one.
    const { nodes: branches, registry: branchRegistry } = useFocusScopeBranchRegistry()

    React.useEffect(() => {
      if (content && held) return hideOthers(content)
      return
    }, [content, held])

    return (
      <RemoveScroll as={Slot} allowPinchZoom enabled={lockScrollProp ?? held}>
        <PopoverContentImpl
          {...restProps}
          ref={composedRefs}
          branches={branches}
          branchRegistry={branchRegistry}
          trapFocus={trapFocusProp ?? context.open}
          disableOutsidePointerEvents={disableOutsidePointerEventsProp ?? held}
          onCloseAutoFocus={composeEventHandlers(props.onCloseAutoFocus, (event) => {
            event.preventDefault()
            if (!isRightClickOutsideRef.current) context.triggerRef.current?.focus()
          })}
          onInteractOutside={composeEventHandlers(props.onInteractOutside, (event) => {
            // Focusing the trigger after a right click would close the context menu it opened.
            const press = event.detail.originalEvent
            isRightClickOutsideRef.current =
              'button' in press && (press.button === 2 || (press.button === 0 && press.ctrlKey))
          })}
          // The trap moving focus in on open reports a focusout, which must not dismiss.
          onFocusOutside={composeEventHandlers(props.onFocusOutside, (event) => event.preventDefault(), {
            checkForDefaultPrevented: false,
          })}
        />
      </RemoveScroll>
    )
  },
)

PopoverContentModal.displayName = `${CONTENT_NAME}Modal`

const PopoverContentNonModal = React.forwardRef<PopoverContentElement, IPopover.IContentTypeProps>(
  (props: IPopover.IScoped<IPopover.IContentTypeProps>, forwardedRef) => {
    const { lockScroll: _lockScroll, ...contentProps } = props
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover)

    const hasInteractedOutsideRef = React.useRef(false)
    const hasPointerDownOutsideRef = React.useRef(false)

    // Content kept mounted never unmounts to drop the last opening's press.
    React.useEffect(() => {
      if (!context.open) return
      hasInteractedOutsideRef.current = false
      hasPointerDownOutsideRef.current = false
    }, [context.open])

    return (
      <PopoverContentImpl
        {...contentProps}
        ref={forwardedRef}
        trapFocus={false}
        disableOutsidePointerEvents={false}
        onCloseAutoFocus={(event) => {
          props.onCloseAutoFocus?.(event)

          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus()
            event.preventDefault()
          }
        }}
        onInteractOutside={(event) => {
          props.onInteractOutside?.(event)
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true
            if (event.detail.originalEvent.type === 'pointerdown') hasPointerDownOutsideRef.current = true
          }
          // A press on the trigger would close the popover only for the trigger's click to open it again.
          if (context.triggerRef.current?.contains(event.target as HTMLElement)) event.preventDefault()
          // Safari reports a focusin outside after the pointer down outside.
          if (event.detail.originalEvent.type === 'focusin' && hasPointerDownOutsideRef.current) event.preventDefault()
        }}
      />
    )
  },
)

PopoverContentNonModal.displayName = `${CONTENT_NAME}NonModal`

const PopoverContentImpl = React.forwardRef<PopoverContentElement, IPopover.IContentImplProps>(
  (props: IPopover.IScoped<IPopover.IContentImplProps>, forwardedRef) => {
    const {
      __scopePopover,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      branches,
      branchRegistry,
      ...contentProps
    } = props

    const context = usePopoverContext(CONTENT_NAME, __scopePopover)
    // Inside a modal dialog but portalled out of it, the content registers so the dialog lets focus and scroll in.
    const [content, setContent] = React.useState<PopoverContentElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, setContent)
    useFocusScopeBranch(content)
    const popperScope = usePopperScope(__scopePopover)
    const direction = useDirection(context.dir)
    const [titleId, setTitleId] = React.useState<string>()
    const [descriptionId, setDescriptionId] = React.useState<string>()

    // when portalled to end of document, browser tab would escape the trap;
    // sentinel focus guards re-enter the FocusScope on Tab/Shift+Tab at edges
    useFocusGuards()

    return (
      <PopoverContentProvider
        scope={__scopePopover}
        onTitleIdChange={setTitleId}
        onDescriptionIdChange={setDescriptionId}>
        <FocusScopeBranchProvider registry={branchRegistry}>
          <FocusScope
            asChild
            loop
            trapped={trapFocus}
            branches={branches}
            onMountAutoFocus={onOpenAutoFocus}
            onUnmountAutoFocus={onCloseAutoFocus}>
            <DismissableLayer
              asChild
              disableOutsidePointerEvents={disableOutsidePointerEvents}
              onInteractOutside={onInteractOutside}
              onEscapeKeyDown={onEscapeKeyDown}
              onPointerDownOutside={onPointerDownOutside}
              onFocusOutside={onFocusOutside}
              onDismiss={() => context.onOpenChange(false)}
              deferPointerDownOutside>
              <PopperPrimitive.PopperContent
                data-slot="popover-content"
                data-state={getState(context.open)}
                role="dialog"
                id={context.contentId}
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                dir={direction}
                {...popperScope}
                {...contentProps}
                ref={composedRefs}
                style={{ ...contentProps.style, ...POPPER_VARIABLES }}
              />
            </DismissableLayer>
          </FocusScope>
        </FocusScopeBranchProvider>
      </PopoverContentProvider>
    )
  },
)

PopoverContentImpl.displayName = `${CONTENT_NAME}Impl`
