import type { Middleware, MiddlewareData, Placement } from '@floating-ui/react-dom'
import {
  autoUpdate,
  flip,
  arrow as floatingUIarrow,
  getOverflowAncestors,
  hide,
  limitShift,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/react-dom'
import * as React from 'react'
import { DirectionContext, useDirection } from '../direction'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { useSize } from '../hooks/use-size'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { createPopperContext, usePopperContext } from './popper'
import type { IPopper } from './popper.types'

const CONTENT_NAME = 'PopperContent'

const [PopperContentProvider, useContentContext] = createPopperContext<IPopper.IContentContext>(CONTENT_NAME)

export { useContentContext }

type PopperContentElement = React.ComponentRef<typeof Primitive.div>

export const PopperContent = React.forwardRef<PopperContentElement, IPopper.IContentProps>(
  (props: IPopper.IScoped<IPopper.IContentProps>, forwardedRef) => {
    const {
      __scopePopper,
      side = 'bottom',
      sideOffset = 0,
      align = 'center',
      alignOffset = 0,
      arrowPadding = 0,
      avoidCollisions = true,
      collisionBoundary = [],
      collisionPadding = 0,
      sticky = 'partial',
      hideWhenDetached = false,
      updatePositionStrategy = 'optimized',
      updateOnScroll = true,
      onPlaced,
      shiftCrossAxis = false,
      ...contentProps
    } = props

    const context = usePopperContext(CONTENT_NAME, __scopePopper)

    // Written onto the wrapper rather than kept in state, which rendered the content once more as it mounted.
    const zIndexRef = React.useCallback((node: HTMLDivElement | null) => {
      if (node?.parentElement) node.parentElement.style.zIndex = getComputedStyle(node).zIndex
    }, [])
    const composedRefs = useComposedRefs(forwardedRef, zIndexRef)

    const [arrow, setArrow] = React.useState<HTMLSpanElement | null>(null)
    const arrowSize = useSize(arrow)
    const arrowWidth = arrowSize?.width ?? 0
    const arrowHeight = arrowSize?.height ?? 0

    // `left`/`right` mirror in RTL, like every other physical side in the library.
    const providerDir = React.useContext(DirectionContext)
    const direction = useDirection(
      contentProps.dir === 'rtl' || contentProps.dir === 'ltr' ? contentProps.dir : undefined,
    )
    const placementSide =
      direction === 'rtl' && side === 'left' ? 'right' : direction === 'rtl' && side === 'right' ? 'left' : side
    const desiredPlacement = (placementSide + (align !== 'center' ? `-${align}` : '')) as Placement

    const boundary = [collisionBoundary].flat().filter((element) => element !== null)

    const detectOverflowOptions = { padding: collisionPadding, boundary }

    const [placedSizes] = React.useState(() => new WeakMap<object, { width: number; height: number }>())

    const { refs, floatingStyles, placement, isPositioned, middlewareData } = useFloating({
      strategy: 'fixed',
      placement: desiredPlacement,
      whileElementsMounted: (reference, floating, update) => {
        const stop = autoUpdate(reference, floating, update, {
          ancestorScroll: false,
          ancestorResize: false,
          animationFrame: updatePositionStrategy === 'always',
          elementResize: false,
        })
        // Floating UI listens on the window and its visual viewport once for the anchor and again for the content.
        const referenceNode = 'setAttribute' in reference ? reference : reference.contextElement
        const ancestors = new Set([
          ...(referenceNode ? getOverflowAncestors(referenceNode) : []),
          ...getOverflowAncestors(floating),
        ])
        const unwatch = [...ancestors].map((ancestor) => {
          if (updateOnScroll) ancestor.addEventListener('scroll', update, { passive: true })
          return watchResize(ancestor, update)
        })
        // Floating UI places again for every size its observer reports, the first ones too, which placed the content
        // three times each time it opened. This places again only for a size it was not placed at.
        // A test DOM may have no observer, which Floating UI checks for too.
        const observer =
          typeof ResizeObserver === 'function'
            ? new ResizeObserver((entries) => {
                const resized = entries.some(({ target, borderBoxSize }) => {
                  // Firefox before 92 reports one size rather than a list.
                  const [size] = [borderBoxSize].flat()
                  const placed = placedSizes.get(target)
                  return size?.inlineSize !== placed?.width || size?.blockSize !== placed?.height
                })
                if (resized) update()
              })
            : undefined
        if ('setAttribute' in reference) observer?.observe(reference)
        observer?.observe(floating)
        return () => {
          stop()
          observer?.disconnect()
          for (const ancestor of ancestors) if (updateOnScroll) ancestor.removeEventListener('scroll', update)
          for (const stopWatching of unwatch) stopWatching()
        }
      },
      elements: { reference: context.anchor },
      middleware: [
        offset({
          mainAxis: sideOffset + arrowHeight,
          alignmentAxis: alignOffset,
        }),
        avoidCollisions &&
          shift({
            mainAxis: true,
            crossAxis: shiftCrossAxis,
            ...(sticky === 'partial' ? { limiter: limitShift() } : {}),
            ...detectOverflowOptions,
          }),
        avoidCollisions && flip({ ...detectOverflowOptions }),
        size({
          ...detectOverflowOptions,
          apply: ({ elements, rects, availableWidth, availableHeight }) => {
            const { width: anchorWidth, height: anchorHeight } = rects.reference
            const contentStyle = elements.floating.style

            contentStyle.setProperty('--gentleduck-popper-available-width', `${availableWidth}px`)
            contentStyle.setProperty('--gentleduck-popper-available-height', `${availableHeight}px`)
            contentStyle.setProperty('--gentleduck-popper-anchor-width', `${anchorWidth}px`)
            contentStyle.setProperty('--gentleduck-popper-anchor-height', `${anchorHeight}px`)
            // Not `rects`: Floating UI measures the content by its computed width, which a browser rounds to six digits.
            for (const element of [elements.reference, elements.floating])
              placedSizes.set(element, element.getBoundingClientRect())
          },
        }),
        arrow && floatingUIarrow({ element: arrow, padding: arrowPadding }),
        transformOrigin({ arrowWidth, arrowHeight }),
        // Hiding asks whether the anchor is clipped, so with no boundary given it falls back to the
        // clipping ancestors. The middlewares above keep the viewport, or a clipping portal host clamps them.
        hideWhenDetached &&
          hide({
            strategy: 'referenceHidden',
            ...detectOverflowOptions,
            boundary: boundary.length ? boundary : undefined,
          }),
      ],
    })

    // A cleanup that does nothing keeps React 19 from handing Floating UI a null wrapper as the content unmounts,
    // which updated the state of a component already going.
    const { setFloating } = refs
    const floatingRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        setFloating(node)
        return () => {}
      },
      [setFloating],
    )

    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement)

    // Written onto the element, so a trigger styled by where its content opened costs no render of the popper.
    const { anchor } = context
    useLayoutEffect(() => {
      if (!isElement(anchor)) return
      anchor.setAttribute('data-popper-side', placedSide)
      anchor.setAttribute('data-popper-align', placedAlign)
      return () => {
        anchor.removeAttribute('data-popper-side')
        anchor.removeAttribute('data-popper-align')
      }
    }, [anchor, placedSide, placedAlign])

    const handlePlaced = useCallbackRef(onPlaced)
    useLayoutEffect(() => {
      if (isPositioned) handlePlaced()
    }, [isPositioned, handlePlaced])

    const arrowX = middlewareData.arrow?.x
    const arrowY = middlewareData.arrow?.y
    const cannotCenterArrow = !isArrowCentred(middlewareData.arrow)

    return (
      <Primitive.div
        ref={floatingRef}
        data-slot="popper-content-wrapper"
        style={
          {
            ...floatingStyles,
            transform: isPositioned ? floatingStyles.transform : 'translate(0, -200%)',
            minWidth: 'max-content',
            '--gentleduck-popper-transform-origin': [
              middlewareData.transformOrigin?.x,
              middlewareData.transformOrigin?.y,
            ].join(' '),
            ...(middlewareData.hide?.referenceHidden && {
              visibility: 'hidden',
              pointerEvents: 'none',
            }),
          } as React.CSSProperties
        }
        // Floating UI aligns by the wrapper's direction, which content portalled out of its provider does not inherit.
        dir={props.dir ?? providerDir}>
        <PopperContentProvider
          scope={__scopePopper}
          placedSide={placedSide}
          onArrowChange={setArrow}
          arrowX={arrowX}
          arrowY={arrowY}
          shouldHideArrow={cannotCenterArrow}>
          <Primitive.div
            data-slot="popper-content"
            data-side={placedSide}
            data-align={placedAlign}
            {...contentProps}
            ref={composedRefs}
            style={isPositioned ? contentProps.style : { ...contentProps.style, animation: 'none' }}
          />
        </PopperContentProvider>
      </Primitive.div>
    )
  },
)

PopperContent.displayName = CONTENT_NAME

// Every placed popper shares one resize listener on each ancestor it watches, where each added its own and taking it
// off searched the list every other one had grown.
const resizing = new WeakMap<EventTarget, { updates: Set<() => void>; run: () => void }>()

function watchResize(ancestor: EventTarget, update: () => void) {
  let watched = resizing.get(ancestor)
  if (!watched) {
    const updates = new Set<() => void>()
    const run = () => {
      for (const each of updates) each()
    }
    watched = { updates, run }
    resizing.set(ancestor, watched)
  }
  const { updates, run } = watched
  // Adding a listener already there adds nothing.
  ancestor.addEventListener('resize', run)
  updates.add(update)
  return () => {
    updates.delete(update)
    if (!updates.size) ancestor.removeEventListener('resize', run)
  }
}

// Not `instanceof Element`, which is false for an anchor from another window, such as an iframe's.
function isElement(node: IPopper.IContext['anchor']): node is Element {
  return node !== null && 'setAttribute' in node
}

// Floating UI mixes the content's rounded clientWidth with its exact width, so a centred arrow can come back a hair off 0.
function isArrowCentred(arrow: MiddlewareData['arrow']) {
  return arrow !== undefined && Math.abs(arrow.centerOffset) < 0.5
}

const transformOrigin = (options: { arrowWidth: number; arrowHeight: number }): Middleware => ({
  name: 'transformOrigin',
  options,
  async fn(data) {
    const { placement, rects, middlewareData, platform, elements } = data

    const isArrowHidden = !isArrowCentred(middlewareData.arrow)
    const arrowHeight = isArrowHidden ? 0 : options.arrowHeight

    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement)
    // Floating UI aligns `start`/`end` to the right/left edge on top/bottom placements in RTL.
    const isRTL = await platform.isRTL?.(elements.floating)
    const isVertical = placedSide === 'top' || placedSide === 'bottom'
    const [startOrigin, endOrigin] = isRTL && isVertical ? ['100%', '0%'] : ['0%', '100%']
    const noArrowAlign = { start: startOrigin, center: '50%', end: endOrigin }[placedAlign]

    const { x: arrowX = 0, y: arrowY = 0 } = middlewareData.arrow ?? {}
    const along = isArrowHidden
      ? noArrowAlign
      : `${isVertical ? arrowX + options.arrowWidth / 2 : arrowY + arrowHeight / 2}px`
    const across = `${placedSide === 'bottom' || placedSide === 'right' ? -arrowHeight : (isVertical ? rects.floating.height : rects.floating.width) + arrowHeight}px`

    return { data: isVertical ? { x: along, y: across } : { x: across, y: along } }
  },
})

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-')
  return [side as IPopper.Side, align as IPopper.Align] as const
}
