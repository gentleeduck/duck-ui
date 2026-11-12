'use client'

import { hideOthers } from 'aria-hidden'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { RemoveScroll } from 'react-remove-scroll'
import { DismissableLayer } from '../dismissable-layer'
import { FocusScope } from '../focus-scope'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useFocusGuards } from '../hooks/use-focus-guard'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { clamp } from '../libs/clamp'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { getNavigationCandidates, NAVIGATION_KEYS, useVimNavigation } from '../libs/list-navigation'
import { getRootActiveElement } from '../libs/shared-utils'
import * as PopperPrimitive from '../popper'
import { Presence } from '../presence/presence'
import { useHeldOpen } from '../presence/presence.libs'
import { Primitive } from '../primitive-elements'
import { createSlot } from '../slot'
import {
  CONTENT_MARGIN,
  Collection,
  SelectContentLayoutProvider,
  SelectContentProvider,
  SelectViewportProvider,
  useCollection,
  usePopperScope,
  useSelectContentLayoutContext,
  useSelectContext,
  useSelectOpenContext,
} from './select'
import { getItemText, useTypeaheadListNavigation } from './select.libs'
import type { ISelect } from './select.types'

const CONTENT_NAME = 'SelectContent'

export const SelectContent = React.forwardRef<HTMLDivElement, ISelect.IContentProps>(
  (props: ISelect.IScoped<ISelect.IContentProps>, forwardedRef) => {
    const { forceMount, ...contentProps } = props
    const context = useSelectContext(CONTENT_NAME, props.__scopeSelect)
    const { open } = useSelectOpenContext(CONTENT_NAME, props.__scopeSelect)
    const [fragment, setFragment] = React.useState<DocumentFragment>()
    const hasItems = context.items !== undefined
    const shown = forceMount || open
    // The closed copy waits until the content has left, through any exit animation, so the two never register their
    // items, or show the picked one in the trigger, side by side.
    const [contentGone, setContentGone] = React.useState(!shown)
    if (shown && contentGone) setContentGone(false)
    const composedRefs = useComposedRefs(
      forwardedRef,
      React.useCallback((node: HTMLDivElement | null) => setContentGone(!node), []),
    )

    // DocumentFragment is not available on the server
    useLayoutEffect(() => {
      setFragment(hasItems ? undefined : new DocumentFragment())
    }, [hasItems])

    // Without items, closed items render into a hidden fragment so the trigger, the typeahead and the native
    // select can read them.
    // createPortal's TS type accepts Element, but DocumentFragment is a valid runtime
    // target. The cast is here to surface that React's types are narrower than the runtime.
    const fragmentPortal =
      contentGone && fragment
        ? ReactDOM.createPortal(
            <SelectContentProvider scope={props.__scopeSelect}>
              <Collection.Slot scope={props.__scopeSelect}>
                <div>{contentProps.children}</div>
              </Collection.Slot>
            </SelectContentProvider>,
            fragment as unknown as Element,
          )
        : null

    return (
      <>
        {fragmentPortal}
        <Presence present={shown}>
          <SelectContentImpl {...contentProps} ref={composedRefs} />
        </Presence>
      </>
    )
  },
)

SelectContent.displayName = CONTENT_NAME
const CONTENT_IMPL_NAME = 'SelectContentImpl'

const Slot = createSlot('SelectContent.RemoveScroll')

const SelectContentImpl = React.forwardRef<HTMLDivElement, ISelect.IContentImplProps>(
  (props: ISelect.IScoped<ISelect.IContentImplProps>, forwardedRef) => {
    const {
      __scopeSelect,
      position = 'item-aligned',
      onCloseAutoFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside: onFocusOutsideProp,
      disableOutsidePointerEvents: disableOutsidePointerEventsProp,
      trapFocus: trapFocusProp,
      lockScroll: lockScrollProp,
      // PopperContent props
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      avoidCollisions,
      ...contentProps
    } = props
    const context = useSelectContext(CONTENT_NAME, __scopeSelect)
    const { open } = useSelectOpenContext(CONTENT_NAME, __scopeSelect)
    const resolvedTrapFocus = trapFocusProp ?? open
    const held = useHeldOpen(open)
    const resolvedDisableOutsidePointerEvents = disableOutsidePointerEventsProp ?? held
    const resolvedLockScroll = lockScrollProp ?? held
    const [content, setContent] = React.useState<HTMLDivElement | null>(null)
    const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, setContent)
    const [selectedItem, setSelectedItem] = React.useState<HTMLDivElement | null>(null)
    const [selectedItemText, setSelectedItemText] = React.useState<HTMLSpanElement | null>(null)
    const getItems = useCollection(__scopeSelect)
    const [isPositioned, setIsPositioned] = React.useState(false)
    const firstValidItemFoundRef = React.useRef(false)
    const firstItemFoundRef = React.useRef(false)
    const firstItemTextFoundRef = React.useRef(false)
    // A multiple select opens on its first pick and keeps it while open, so no pick moves the list under the pointer
    // or focus off the item just picked.
    const firstPick = [context.value].flat()[0]
    const [openFirstPick, setOpenFirstPick] = React.useState(firstPick)
    if (!open && openFirstPick !== firstPick) setOpenFirstPick(firstPick)
    const anchorValue = context.multiple ? openFirstPick : context.value

    // aria-hide everything except content (better-supported than aria-modal)
    React.useEffect(() => {
      if (content) return hideOthers(content)
    }, [content])

    // Select may be the last element in the DOM via Portal; guard focus from escaping the tree
    useFocusGuards()

    const focusFirstItem = React.useCallback(
      (candidates: Array<HTMLElement | null>) => {
        const [firstItem, ...restItems] = getItems().map((item) => item.ref.current)
        const [lastItem] = restItems.slice(-1)

        // Viewport may have padding; force scroll to its edges when focusing first/last items
        // so padding doesn't leave focused items partially obscured.
        const previouslyFocused = content && getRootActiveElement(content)
        for (const candidate of candidates) {
          if (candidate === previouslyFocused) return
          candidate?.scrollIntoView({ block: 'nearest' })
          if (candidate === firstItem && viewport) viewport.scrollTop = 0
          if (candidate === lastItem && viewport) viewport.scrollTop = viewport.scrollHeight
          candidate?.focus()
          if (content && getRootActiveElement(content) !== previouslyFocused) return
        }
      },
      [getItems, viewport, content],
    )

    const focusSelectedItem = React.useCallback(
      () => focusFirstItem([selectedItem, content]),
      [focusFirstItem, selectedItem, content],
    )

    // Run alongside other effects (not layout-dependent), so do NOT call from `position()`
    React.useEffect(() => {
      if (isPositioned) {
        focusSelectedItem()
      }
    }, [isPositioned, focusSelectedItem])

    // Open-on-pointerdown shouldn't immediately select on the matching pointerup (drag threshold);
    // pointerup outside the content closes the menu.
    const { onOpenChange, triggerPointerDownPosRef } = context
    React.useEffect(() => {
      const start = triggerPointerDownPosRef.current
      if (!content || !start) return
      const ownerDocument = content.ownerDocument
      let pointerMoveDelta = { x: 0, y: 0 }

      const handlePointerMove = (event: PointerEvent) => {
        pointerMoveDelta = {
          x: Math.abs(Math.round(event.pageX) - start.x),
          y: Math.abs(Math.round(event.pageY) - start.y),
        }
      }
      const handlePointerUp = (event: PointerEvent) => {
        // Under 10px movement: treat as click-open, not drag-select. Past it, the composed path decides
        // outside, since a document listener sees a shadow root's host as the target.
        if (pointerMoveDelta.x <= 10 && pointerMoveDelta.y <= 10) {
          event.preventDefault()
        } else if (!event.composedPath().includes(content)) {
          onOpenChange(false)
        }
        ownerDocument.removeEventListener('pointermove', handlePointerMove)
        triggerPointerDownPosRef.current = null
      }

      ownerDocument.addEventListener('pointermove', handlePointerMove)
      ownerDocument.addEventListener('pointerup', handlePointerUp, { capture: true, once: true })
      return () => {
        ownerDocument.removeEventListener('pointermove', handlePointerMove)
        ownerDocument.removeEventListener('pointerup', handlePointerUp, { capture: true })
      }
    }, [content, onOpenChange, triggerPointerDownPosRef])

    React.useEffect(() => {
      const view = content?.ownerDocument.defaultView
      if (!view) return
      const close = () => onOpenChange(false)
      view.addEventListener('blur', close)
      view.addEventListener('resize', close)
      return () => {
        view.removeEventListener('blur', close)
        view.removeEventListener('resize', close)
      }
    }, [content, onOpenChange])

    const [searchRef, handleTypeaheadSearch, resetTypeaheadState] = useTypeaheadListNavigation({
      getItems: () => getItems().filter((item) => !item.disabled),
      getItemElement: (item) => item.ref.current as HTMLElement | null,
      getItemTextValue: getItemText,
      onMatch: (item) => {
        const node = item.ref.current as HTMLElement | null
        if (node) setTimeout(() => node.focus())
      },
    })

    const handleVimKey = useVimNavigation({ onNavigate: resetTypeaheadState })

    const itemRefCallback = React.useCallback(
      (node: HTMLDivElement | null, value: string, disabled: boolean) => {
        const isFirstItem = !firstItemFoundRef.current
        firstItemFoundRef.current = true
        const isFirstValidItem = !firstValidItemFoundRef.current && !disabled
        const isSelectedItem = anchorValue !== undefined && anchorValue === value
        // Positioning aligns to this item, so with every item disabled the first stands in.
        if (isSelectedItem || isFirstValidItem || isFirstItem) {
          setSelectedItem(node)
          if (isFirstValidItem) firstValidItemFoundRef.current = true
        }
      },
      [anchorValue],
    )
    const handleItemLeave = useCallbackRef(() => content?.focus())
    const itemTextRefCallback = React.useCallback(
      (node: HTMLSpanElement | null, value: string, disabled: boolean) => {
        const isFirstItem = !firstItemTextFoundRef.current
        firstItemTextFoundRef.current = true
        const isFirstValidItem = !firstValidItemFoundRef.current && !disabled
        const isSelectedItem = anchorValue !== undefined && anchorValue === value
        if (isSelectedItem || isFirstValidItem || isFirstItem) {
          setSelectedItemText(node)
        }
      },
      [anchorValue],
    )

    const SelectPosition = position === 'popper' ? SelectPopperPosition : SelectItemAlignedPosition

    // SelectItemAlignedPosition silently ignores popper-only props
    const popperContentProps =
      SelectPosition === SelectPopperPosition
        ? {
            side,
            sideOffset,
            align,
            alignOffset,
            arrowPadding,
            collisionBoundary,
            collisionPadding,
            sticky,
            hideWhenDetached,
            avoidCollisions,
          }
        : {}

    return (
      <SelectContentProvider
        scope={__scopeSelect}
        onViewportChange={setViewport}
        itemRefCallback={itemRefCallback}
        onItemLeave={handleItemLeave}
        itemTextRefCallback={itemTextRefCallback}
        position={position}
        searchRef={searchRef}>
        <SelectContentLayoutProvider
          scope={__scopeSelect}
          viewport={viewport}
          selectedItem={selectedItem}
          focusSelectedItem={focusSelectedItem}
          selectedItemText={selectedItemText}
          isPositioned={isPositioned}>
          <RemoveScroll as={Slot} allowPinchZoom enabled={resolvedLockScroll}>
            <FocusScope
              asChild
              // release trap once closed (closed !== unmounted during exit animation)
              trapped={resolvedTrapFocus}
              onMountAutoFocus={(event) => {
                // suppress default autofocus; we focus the selected item manually
                event.preventDefault()
              }}
              onUnmountAutoFocus={composeEventHandlers(onCloseAutoFocus, (event) => {
                context.trigger?.focus({ preventScroll: true })
                event.preventDefault()
              })}>
              <DismissableLayer
                asChild
                disableOutsidePointerEvents={resolvedDisableOutsidePointerEvents}
                onEscapeKeyDown={onEscapeKeyDown}
                onPointerDownOutside={onPointerDownOutside}
                onFocusOutside={onFocusOutsideProp ?? ((event) => event.preventDefault())}
                onDismiss={() => context.onOpenChange(false)}>
                <SelectPosition
                  data-slot="select-content"
                  role="listbox"
                  aria-multiselectable={context.multiple || undefined}
                  id={context.contentId}
                  data-state={open ? 'open' : 'closed'}
                  dir={context.dir}
                  onContextMenu={(event) => event.preventDefault()}
                  {...contentProps}
                  {...popperContentProps}
                  onPlaced={() => setIsPositioned(true)}
                  ref={composedRefs}
                  style={{
                    // flex column so scroll buttons can sit above/below the viewport
                    display: 'flex',
                    flexDirection: 'column',
                    // content may receive focus; suppress the default outline
                    outline: 'none',
                    ...contentProps.style,
                  }}
                  onKeyDown={composeEventHandlers(contentProps.onKeyDown, (event) => {
                    const isModifierKey = event.ctrlKey || event.altKey || event.metaKey

                    // Tab must not move focus inside the listbox
                    if (event.key === 'Tab') event.preventDefault()

                    const enabledItems = getItems().filter((item) => !item.disabled)
                    // Filter mounted refs before mapping. A Presence boundary may unmount an
                    // item mid-keydown, leaving its ref.current null; the previous code asserted
                    // non-null and would throw in that race.
                    const nodes = enabledItems
                      .filter(
                        (item): item is typeof item & { ref: { current: HTMLDivElement } } => item.ref.current !== null,
                      )
                      .map((item) => item.ref.current)
                    if (handleVimKey(event, nodes)) return

                    if (!isModifierKey && event.key.length === 1) handleTypeaheadSearch(event.key)

                    if ((NAVIGATION_KEYS as readonly string[]).includes(event.key)) {
                      const candidateNodes = getNavigationCandidates(nodes, event.key, event.target as HTMLElement)

                      setTimeout(() => focusFirstItem(candidateNodes))
                      event.preventDefault()
                    }
                  })}
                />
              </DismissableLayer>
            </FocusScope>
          </RemoveScroll>
        </SelectContentLayoutProvider>
      </SelectContentProvider>
    )
  },
)

SelectContentImpl.displayName = CONTENT_IMPL_NAME
const ITEM_ALIGNED_POSITION_NAME = 'SelectItemAlignedPosition'

const SelectItemAlignedPosition = React.forwardRef<HTMLDivElement, ISelect.IItemAlignedPositionProps>(
  (props: ISelect.IScoped<ISelect.IItemAlignedPositionProps>, forwardedRef) => {
    const { __scopeSelect, onPlaced, ...popperProps } = props
    const context = useSelectContext(CONTENT_NAME, __scopeSelect)
    const contentContext = useSelectContentLayoutContext(CONTENT_NAME, __scopeSelect)
    const [contentWrapper, setContentWrapper] = React.useState<HTMLDivElement | null>(null)
    const [content, setContent] = React.useState<HTMLDivElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, setContent)
    const getItems = useCollection(__scopeSelect)
    const shouldExpandOnScrollRef = React.useRef(false)
    const shouldRepositionRef = React.useRef(true)

    const { viewport, selectedItem, selectedItemText, focusSelectedItem } = contentContext
    const position = React.useCallback(() => {
      if (
        context.trigger &&
        context.valueNode &&
        contentWrapper &&
        content &&
        viewport &&
        selectedItem &&
        selectedItemText
      ) {
        const view = content.ownerDocument.defaultView ?? window
        const triggerRect = context.trigger.getBoundingClientRect()

        const contentRect = content.getBoundingClientRect()
        const valueNodeRect = context.valueNode.getBoundingClientRect()
        const itemTextRect = selectedItemText.getBoundingClientRect()

        if (context.dir !== 'rtl') {
          const itemTextOffset = itemTextRect.left - contentRect.left
          const left = valueNodeRect.left - itemTextOffset
          const leftDelta = triggerRect.left - left
          const minContentWidth = triggerRect.width + leftDelta
          const contentWidth = Math.max(minContentWidth, contentRect.width)
          const rightEdge = view.innerWidth - CONTENT_MARGIN
          const clampedLeft = clamp(left, [CONTENT_MARGIN, Math.max(CONTENT_MARGIN, rightEdge - contentWidth)])

          contentWrapper.style.minWidth = `${minContentWidth}px`
          contentWrapper.style.left = `${clampedLeft}px`
        } else {
          const itemTextOffset = contentRect.right - itemTextRect.right
          const right = view.innerWidth - valueNodeRect.right - itemTextOffset
          const rightDelta = view.innerWidth - triggerRect.right - right
          const minContentWidth = triggerRect.width + rightDelta
          const contentWidth = Math.max(minContentWidth, contentRect.width)
          const leftEdge = view.innerWidth - CONTENT_MARGIN
          const clampedRight = clamp(right, [CONTENT_MARGIN, Math.max(CONTENT_MARGIN, leftEdge - contentWidth)])

          contentWrapper.style.minWidth = `${minContentWidth}px`
          contentWrapper.style.right = `${clampedRight}px`
        }

        const items = getItems()
        const availableHeight = view.innerHeight - CONTENT_MARGIN * 2
        const itemsHeight = viewport.scrollHeight

        const contentStyles = window.getComputedStyle(content)
        const contentBorderTopWidth = parseInt(contentStyles.borderTopWidth, 10)
        const contentPaddingTop = parseInt(contentStyles.paddingTop, 10)
        const contentBorderBottomWidth = parseInt(contentStyles.borderBottomWidth, 10)
        const contentPaddingBottom = parseInt(contentStyles.paddingBottom, 10)
        const fullContentHeight =
          contentBorderTopWidth + contentPaddingTop + itemsHeight + contentPaddingBottom + contentBorderBottomWidth // prettier-ignore
        const minContentHeight = Math.min(selectedItem.offsetHeight * 5, fullContentHeight)

        const viewportStyles = window.getComputedStyle(viewport)
        const viewportPaddingTop = parseInt(viewportStyles.paddingTop, 10)
        const viewportPaddingBottom = parseInt(viewportStyles.paddingBottom, 10)

        const topEdgeToTriggerMiddle = triggerRect.top + triggerRect.height / 2 - CONTENT_MARGIN
        const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle

        const selectedItemHalfHeight = selectedItem.offsetHeight / 2
        const itemOffsetMiddle = selectedItem.offsetTop + selectedItemHalfHeight
        const contentTopToItemMiddle = contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle
        const itemMiddleToContentBottom = fullContentHeight - contentTopToItemMiddle

        const willAlignWithoutTopOverflow = contentTopToItemMiddle <= topEdgeToTriggerMiddle

        if (willAlignWithoutTopOverflow) {
          const isLastItem = items.length > 0 && selectedItem === items[items.length - 1]?.ref.current
          contentWrapper.style.bottom = `${0}px`
          const viewportOffsetBottom = content.clientHeight - viewport.offsetTop - viewport.offsetHeight
          const clampedTriggerMiddleToBottomEdge = Math.max(
            triggerMiddleToBottomEdge,
            selectedItemHalfHeight +
              // include viewport padding-bottom for last item to prevent a scrollable viewport
              (isLastItem ? viewportPaddingBottom : 0) +
              viewportOffsetBottom +
              contentBorderBottomWidth,
          )
          const height = contentTopToItemMiddle + clampedTriggerMiddleToBottomEdge
          contentWrapper.style.height = `${height}px`
        } else {
          const isFirstItem = items.length > 0 && selectedItem === items[0]?.ref.current
          contentWrapper.style.top = `${0}px`
          const clampedTopEdgeToTriggerMiddle = Math.max(
            topEdgeToTriggerMiddle,
            contentBorderTopWidth +
              viewport.offsetTop +
              // include viewport padding-top for first item to prevent a scrollable viewport
              (isFirstItem ? viewportPaddingTop : 0) +
              selectedItemHalfHeight,
          )
          const height = clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom
          contentWrapper.style.height = `${height}px`
          viewport.scrollTop = contentTopToItemMiddle - topEdgeToTriggerMiddle + viewport.offsetTop
        }

        contentWrapper.style.margin = `${CONTENT_MARGIN}px 0`
        contentWrapper.style.minHeight = `${minContentHeight}px`
        contentWrapper.style.maxHeight = `${availableHeight}px`

        onPlaced?.()

        // initial scroll adjustment must NOT trigger expand-on-scroll; arm it next frame
        requestAnimationFrame(() => (shouldExpandOnScrollRef.current = true))
      }
    }, [
      getItems,
      context.trigger,
      context.valueNode,
      contentWrapper,
      content,
      viewport,
      selectedItem,
      selectedItemText,
      context.dir,
      onPlaced,
    ])

    useLayoutEffect(() => position(), [position])

    // mirror content z-index onto wrapper (wrapper is the actually-positioned element)
    const [contentZIndex, setContentZIndex] = React.useState<string>()
    useLayoutEffect(() => {
      if (content) setContentZIndex(window.getComputedStyle(content).zIndex)
    }, [content])

    // Scroll-up button mounts in normal flow, pushing the viewport down and breaking the
    // trigger=>selectedItem alignment. Re-run positioning once it appears.
    const handleScrollButtonChange = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (node && shouldRepositionRef.current === true) {
          position()
          focusSelectedItem?.()
          shouldRepositionRef.current = false
        }
      },
      [position, focusSelectedItem],
    )

    return (
      <SelectViewportProvider
        scope={__scopeSelect}
        contentWrapper={contentWrapper}
        shouldExpandOnScrollRef={shouldExpandOnScrollRef}
        onScrollButtonChange={handleScrollButtonChange}>
        <div
          ref={setContentWrapper}
          dir={context.dir}
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            zIndex: contentZIndex,
          }}>
          <Primitive.div
            data-slot="select-item-aligned-position"
            {...popperProps}
            ref={composedRefs}
            style={{
              // border-box: measured height includes borders; without this the set height overshoots
              boxSizing: 'border-box',
              // never exceed the positioned wrapper
              maxHeight: '100%',
              ...popperProps.style,
            }}
          />
        </div>
      </SelectViewportProvider>
    )
  },
)

SelectItemAlignedPosition.displayName = ITEM_ALIGNED_POSITION_NAME
const POPPER_POSITION_NAME = 'SelectPopperPosition'

const SelectPopperPosition = React.forwardRef<HTMLDivElement, ISelect.IPopperPositionProps>(
  (props: ISelect.IScoped<ISelect.IPopperPositionProps>, forwardedRef) => {
    const { __scopeSelect, align = 'start', collisionPadding = CONTENT_MARGIN, ...popperProps } = props
    const popperScope = usePopperScope(__scopeSelect)

    return (
      <PopperPrimitive.Content
        data-slot="select-popper-position"
        {...popperScope}
        {...popperProps}
        ref={forwardedRef}
        align={align}
        collisionPadding={collisionPadding}
        style={{
          // border-box required for floating-ui measurements
          boxSizing: 'border-box',
          ...popperProps.style,
          // expose popper custom props under select-* namespace
          ...({
            '--gentleduck-select-content-transform-origin': 'var(--gentleduck-popper-transform-origin)',
            '--gentleduck-select-content-available-width': 'var(--gentleduck-popper-available-width)',
            '--gentleduck-select-content-available-height': 'var(--gentleduck-popper-available-height)',
            '--gentleduck-select-trigger-width': 'var(--gentleduck-popper-anchor-width)',
            '--gentleduck-select-trigger-height': 'var(--gentleduck-popper-anchor-height)',
          } as React.CSSProperties),
        }}
      />
    )
  },
)

SelectPopperPosition.displayName = POPPER_POSITION_NAME
