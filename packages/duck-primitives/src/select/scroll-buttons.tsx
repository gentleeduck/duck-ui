import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { getRootActiveElement } from '../libs/shared-utils'
import { Primitive } from '../primitive-elements'
import {
  useCollection,
  useSelectContentContext,
  useSelectContentLayoutContext,
  useSelectContext,
  useSelectViewportContext,
} from './select'
import type { ISelect } from './select.types'

const SCROLL_UP_BUTTON_NAME = 'SelectScrollUpButton'

export const SelectScrollUpButton = React.forwardRef<HTMLDivElement, ISelect.IScrollUpButtonProps>(
  (props: ISelect.IScoped<ISelect.IScrollUpButtonProps>, forwardedRef) => {
    const contentContext = useSelectContentLayoutContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect)
    const viewportContext = useSelectViewportContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect)
    const [canScrollUp, setCanScrollUp] = React.useState(false)
    const composedRefs = useComposedRefs(forwardedRef, viewportContext.onScrollButtonChange)

    useLayoutEffect(() => {
      if (contentContext.viewport && contentContext.isPositioned) {
        const viewport = contentContext.viewport
        const handleScroll = () => {
          const canScroll = viewport.scrollTop > 0
          setCanScrollUp(canScroll)
        }
        handleScroll()
        viewport.addEventListener('scroll', handleScroll)
        return () => viewport.removeEventListener('scroll', handleScroll)
      }
    }, [contentContext.viewport, contentContext.isPositioned])

    return canScrollUp ? (
      <SelectScrollButtonImpl
        {...props}
        data-slot="select-scroll-up-button"
        ref={composedRefs}
        onAutoScroll={() => {
          const { viewport, selectedItem } = contentContext
          if (viewport && selectedItem) {
            viewport.scrollTop = viewport.scrollTop - selectedItem.offsetHeight
          }
        }}
      />
    ) : null
  },
)

SelectScrollUpButton.displayName = SCROLL_UP_BUTTON_NAME
const SCROLL_DOWN_BUTTON_NAME = 'SelectScrollDownButton'

export const SelectScrollDownButton = React.forwardRef<HTMLDivElement, ISelect.IScrollDownButtonProps>(
  (props: ISelect.IScoped<ISelect.IScrollDownButtonProps>, forwardedRef) => {
    const contentContext = useSelectContentLayoutContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect)
    const viewportContext = useSelectViewportContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect)
    const [canScrollDown, setCanScrollDown] = React.useState(false)
    const composedRefs = useComposedRefs(forwardedRef, viewportContext.onScrollButtonChange)

    useLayoutEffect(() => {
      if (contentContext.viewport && contentContext.isPositioned) {
        const viewport = contentContext.viewport
        const handleScroll = () => {
          const maxScroll = viewport.scrollHeight - viewport.clientHeight
          // ceil because zoomed UIs report fractional scrollTop
          const canScroll = Math.ceil(viewport.scrollTop) < maxScroll
          setCanScrollDown(canScroll)
        }
        handleScroll()
        viewport.addEventListener('scroll', handleScroll)
        return () => viewport.removeEventListener('scroll', handleScroll)
      }
    }, [contentContext.viewport, contentContext.isPositioned])

    return canScrollDown ? (
      <SelectScrollButtonImpl
        {...props}
        data-slot="select-scroll-down-button"
        ref={composedRefs}
        onAutoScroll={() => {
          const { viewport, selectedItem } = contentContext
          if (viewport && selectedItem) {
            viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight
          }
        }}
      />
    ) : null
  },
)

SelectScrollDownButton.displayName = SCROLL_DOWN_BUTTON_NAME

const SelectScrollButtonImpl = React.forwardRef<HTMLDivElement, ISelect.IScoped<ISelect.IScrollButtonImplProps>>(
  (props, forwardedRef) => {
    const { __scopeSelect, onAutoScroll, ...scrollIndicatorProps } = props
    const context = useSelectContext('SelectScrollButton', __scopeSelect)
    const contentContext = useSelectContentContext('SelectScrollButton', __scopeSelect)
    const autoScrollTimerRef = React.useRef<number | null>(null)
    const getItems = useCollection(__scopeSelect)

    const clearAutoScrollTimer = React.useCallback(() => {
      if (autoScrollTimerRef.current !== null) {
        window.clearInterval(autoScrollTimerRef.current)
        autoScrollTimerRef.current = null
      }
    }, [])

    React.useEffect(() => {
      return () => clearAutoScrollTimer()
    }, [clearAutoScrollTimer])

    // Scroll button mounting alters viewport size (push/shrink) and may partially hide the active
    // item; re-run scrollIntoView to keep focus visible.
    useLayoutEffect(() => {
      const activeItem = getItems().find(
        (item) => item.ref.current && item.ref.current === getRootActiveElement(item.ref.current),
      )
      activeItem?.ref.current?.scrollIntoView({ block: 'nearest' })
    }, [getItems])

    return (
      <Primitive.div
        data-slot="select-scroll-button"
        aria-hidden
        dir={context.dir}
        {...scrollIndicatorProps}
        ref={forwardedRef}
        style={{ flexShrink: 0, ...scrollIndicatorProps.style }}
        onPointerDown={composeEventHandlers(scrollIndicatorProps.onPointerDown, () => {
          if (autoScrollTimerRef.current === null) {
            autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50)
          }
        })}
        onPointerMove={composeEventHandlers(scrollIndicatorProps.onPointerMove, () => {
          contentContext.onItemLeave?.()
          if (autoScrollTimerRef.current === null) {
            autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50)
          }
        })}
        onPointerLeave={composeEventHandlers(scrollIndicatorProps.onPointerLeave, () => {
          clearAutoScrollTimer()
        })}
      />
    )
  },
)

SelectScrollButtonImpl.displayName = 'SelectScrollButtonImpl'
